
var   haxe_code = require('../utils/haxe-code')

var REGEX_ENDS_WITH_BEFORE_CALL_CHAR = /[a-zA-Z0-9_\]\)]\s*$/
var REGEX_ENDS_WITH_KEY = /([a-zA-Z0-9_]+)\s*\:$/
var REGEX_ENDS_WITH_ALPHANUMERIC = /([a-zA-Z0-9_]+)$/
var REGEX_BEGINS_WITH_KEY = /^([a-zA-Z0-9_]+)\s*\:/

module.exports = {

        // Parse a composed haxe type (that can be a whole function signature)
        // and return an object with all the informations walkable recursively
        // A function type will have an `args` value next to the `type` value
        // while a regular type will only have a `type` value.
        // In case the type is itself named inside another function signature, a `name` value
        // Will be added to it. Unknown types are replaced with null.
    parse_composed_type: function(raw_composed_type, ctx) {

        var info = {};
        var len = raw_composed_type.length;

        var current_item = '';
        var items = [];
        var c;

        if (ctx == null) {
            ctx = {i: 0};
        }

            // Iterate over each characters and parse groups recursively
        while (ctx.i < len) {
            c = raw_composed_type.charAt(ctx.i);

            if (c === '(') {
                ctx.i++;
                if (current_item.length > 0 && current_item.charAt(current_item.length - 1) === ':') {
                        // New group, continue parsing in a sub call until the end of the group
                    items.push({
                        name: current_item.slice(0, current_item.length-1),
                        type: this.parse_composed_type(raw_composed_type, ctx)
                    });
                } else {
                    items.push(this.parse_composed_type(raw_composed_type, ctx));
                }
                current_item = '';
            }
            else if (c === ')') {
                ctx.i++;
                break;
            }
            else if (c === '-' && raw_composed_type.charAt(ctx.i + 1) === '>') {
                if (current_item.length > 0) {
                        // Parse the current item as a composed type in case there are
                        // nested groups inside
                    items.push(this.parse_composed_type(current_item));
                }
                current_item = '';
                ctx.i += 2;
            }
            else if (c.trim() === '') {
                ctx.i++;
            }
            else {
                current_item += c;
                ctx.i++;
            }
        }

        if (current_item.length > 0) {
            if (current_item.indexOf('->') != -1) {
                    // Parse the current item as a composed type as there as still
                    // nested groups inside
                items.push(this.parse_composed_type(current_item));
            }
            else {
                items.push(this.parse_type(current_item));
            }
        }

        if (items.length > 1) {
                // If multiple items were parsed, that means it is a function signature
                // Extract arguments and return type
            info.args = [].concat(items);
            info.type = info.args.pop();
            if (info.args.length === 1 && info.args[0].type === 'Void') {
                info.args = [];
            }
        }
        else if (items.length === 1) {
                // If only 1 item was parsed, this is a simple type
            info = items[0];
        }

        return info;
    },

        // Parse haxe type / haxe named argument
        // It will return an object with a `type` value or with both a `type` and `name` values
    parse_type: function(raw_type) {

            // Replace Unknown<*> with null as we probably don't want to use these types directly nor display them
            // And because it is more consistent with signatures that already have null types when none is provided
        var parts = raw_type.split(':');
        if (parts.length === 2) {
            if (parts[1].slice(0, 8) === 'Unknown<') {
                parts[1] = null;
            }
            return {
                type: parts[1],
                name: parts[0]
            };

        } else {
            if (parts[0].slice(0, 8) === 'Unknown<') {
                return {
                    type: null
                };
            }
            return {
                type: parts[0]
            };
        }
    },

        // Get string from parsed haxe type
        // It may be useful to stringify a sub-type (group)
        // of a previously parsed type
    string_from_parsed_type: function(parsed_type) {
        if (parsed_type == null) {
            return '';
        }

        if (typeof(parsed_type) == 'object') {
            if (parsed_type.args != null) {
                var str_args;
                if (parsed_type.args.length > 0) {
                    var arg_items = [];
                    for (var i = 0; i < parsed_type.args.length; i++) {
                        arg_items.push(this.string_from_parsed_type(parsed_type.args[i]));
                    }
                    str_args = arg_items.join('->');
                }
                else {
                    str_args = 'Void';
                }

                if (parsed_type.type != null && parsed_type.type.args != null) {
                    return str_args + '->(' + this.string_from_parsed_type(parsed_type.type) + ')';
                } else {
                    return str_args + '->' + this.string_from_parsed_type(parsed_type.type)
                }
            }
            else {
                return this.string_from_parsed_type(parsed_type.type);
            }
        }

        return String(parsed_type);
    },

        // Try to match a partial function call from the given
        // text and index position and return info if succeeded or null.
        // The provided info are:
        //  `signature_start`   the index of the opening parenthesis starting the function call signature
        //  `number_of_args`    the number of arguments between the signature start and the given index
        //  `key_path`          (optional) an array of keys, in case the index is inside an anonymous structure given as argument
        //  `partial_key`       (optional) a string of the key being written at the given index if inside an anonymous structure given as argument
    parse_partial_call: function(text, index) {
            // Cleanup text
        text = haxe_code.code_with_empty_comments_and_strings(text.slice(0, index));

        var i = index - 1;
        var number_of_args = 0;
        var number_of_parens = 0;
        var number_of_braces = 0;
        var number_of_unclosed_parens = 0;
        var number_of_unclosed_braces = 0;
        var signature_start = -1;
        var did_extract_used_keys = false;
        var c, arg, m;

            // A key path will be detected when giving
            // anonymous structure as argument. The key path will allow to
            // know exactly which key or value we are currently writing.
            // Coupled with typedefs, it can allow to compute suggestions for
            // anonymous structure keys and values
        var can_set_colon_index = true;
        var colon_index = -1;
        var key_path = [];
        var used_keys = [];
        var partial_key = null;

        while (i > 0) {
            c = text.charAt(i);

            if (c === '"' || c === '\'') {
                    // Continue until we reach the beginning of the string
                while (i >= 0) {
                    i--;
                    if (text.charAt(i) === c) {
                        i--;
                        break;
                    }
                }
            }
            else if (c === ',') {
                if (number_of_parens === 0 && number_of_braces === 0) {
                    can_set_colon_index = false;
                    if (number_of_args == 0) {
                        arg = text.slice(i + 1, index);
                        if (arg.length > 0) {
                            number_of_args++;
                        }
                    }
                    else {
                        number_of_args++;
                    }
                }
                i--;
            }
            else if (c === ')') {
                number_of_parens++;
                i--;
            }
            else if (c === '}') {
                number_of_braces++;
                i--;
            }
            else if (c === ':') {
                if (can_set_colon_index && number_of_braces === 0 && number_of_parens == 0) {
                    colon_index = i;
                    can_set_colon_index = false;
                }
                i--;
            }
            else if (c === '{') {
                if (number_of_braces === 0) {
                        // Reset number of arguments because we found that
                        // all the already parsed text is inside an unclosed brace token
                    number_of_args = 0;
                    number_of_unclosed_braces++;
                    can_set_colon_index = true;

                    if (!did_extract_used_keys) {
                            // Extract already used keys
                        used_keys = this.extract_used_keys_in_structure(text.slice(i+1));
                        did_extract_used_keys = true;
                    }

                        // Match key
                    if (colon_index != -1) {
                        REGEX_ENDS_WITH_KEY.lastIndex = -1;
                        if (m = text.slice(0, colon_index + 1).match(REGEX_ENDS_WITH_KEY)) {
                            key_path.unshift(m[1]);
                        }
                    }
                    else if (key_path.length === 0) {
                        REGEX_ENDS_WITH_ALPHANUMERIC.lastIndex = -1;
                        if (m = text.slice(0, index).match(REGEX_ENDS_WITH_ALPHANUMERIC)) {
                            partial_key = m[1];
                        } else {
                            partial_key = '';
                        }
                    }
                }
                else {
                    number_of_braces--;
                }
                i--;
            }
            else if (c === '(') {
                if (number_of_parens > 0) {
                    number_of_parens--;
                    i--;
                }
                else {
                    REGEX_ENDS_WITH_BEFORE_CALL_CHAR.lastIndex = -1;
                    if (REGEX_ENDS_WITH_BEFORE_CALL_CHAR.test(text.slice(0, i))) {
                        number_of_args++;
                        signature_start = i;
                        break;
                    }
                    else {
                            // Reset number of arguments because we found that
                            // all the already parsed text is inside an unclosed paren token
                        number_of_args = 0;

                            // Reset key path also if needed
                        can_set_colon_index = true;
                        colon_index = -1;

                        number_of_unclosed_parens++;
                        i--;
                    }
                }
            }
            else {
                i--;
            }
        }

        if (signature_start === -1) {
            return null;
        }

        var result = {
            signature_start: signature_start,
            number_of_args: number_of_args
        };

        if (number_of_unclosed_braces > 0) {
            result.key_path = key_path;
            result.partial_key = partial_key;
            result.used_keys = used_keys;
        }

        return result;
    },

    extract_used_keys_in_structure: function(cleaned_text) {

        var i = 0, len = cleaned_text.length;
        var number_of_braces = 0;
        var number_of_parens = 0;
        var c;
        var used_keys = [];

        while (i < len) {
            c = cleaned_text.charAt(i);
            if (c === '{') {
                number_of_braces++;
                i++;
            }
            else if (c === '}') {
                number_of_braces--;
                i++;
            }
            else if (c === '(') {
                number_of_parens++;
                i++;
            }
            else if (c === ')') {
                number_of_parens--;
                i++;
            }
            else if (number_of_braces === 0 && number_of_parens === 0) {
                REGEX_BEGINS_WITH_KEY.lastIndex = -1;
                if (m = cleaned_text.slice(i).match(REGEX_BEGINS_WITH_KEY)) {
                    i += m[0].length;
                    used_keys.push(m[1]);
                }
                else {
                    i++;
                }
            } else {
                i++;
            }
        }

        return used_keys;
    },


//Based on
// https://github.com/nadako/hxsublime/blob/master/src/SignatureHelper.hx
//Not done, etc.

      //String->String
    getCloseChar:function( c ) {
        var r = '';
        switch (c) {
            case "(": r = ")"; break;
            case "<": r = ">"; break;
            case "{": r = "}"; break;
            default: break;
        }
        return r;
    },

      //String->String
    parseType: function(_intype) {

        var parenRegex = /^\((.*)\)$/;
        var argNameRegex = /^(\??\w+) : /;
        var monomorphRegex = /^Unknown<\d+>$/;

        // replace arrows to ease parsing ">" in type params
        var type = _intype.replace(/ -> /g, "%");

        // prepare a simple toplevel signature without nested arrows
        // nested arrow can be in () or <> and we don't need to modify them,
        // so we store them separately in `groups` map and replace their occurence
        // with a group name in the toplevel string
        var toplevel = [];//StringBuf
        var groups = {}; //Map
        var closeStack = [];//new haxe.ds.GenericStack();
        var depth = 0;
        var groupId = 0;

        for(var i = 0; i < type.length; ++i) {
            var char = type.charAt(i);
            if (char == "(" || char == "<" || char == "{") {
                depth++;
                closeStack.push(this.getCloseChar(char));
                if (depth == 1) {
                    groupId++;
                    groups[groupId] = [];
                    toplevel.push(char);
                    toplevel.push('$'+groupId);
                    continue;
                }
            } else if (char == closeStack[closeStack.length-1]) {
                closeStack.pop();
                depth--;
            }

            if (depth == 0) {
                toplevel.push(char);
            } else {
                groups[groupId].push(char);
            }

        } //for

        // process a sigle type entry, replacing inner content from groups
        // and removing unnecessary parentheses, String->String
        var processType = function(_in_ptype) {

            var ptype = _in_ptype;
            var groupRegex = /\$(\d)+/g;
            var gr = groupRegex.exec(ptype);
            if(gr) {

              var swapgr = true;
              var gridx = 1;
              while(swapgr) {

                var grid = gr[gridx];
                if(grid) {
                  var groupId = parseInt(grid);
                  var groupStr = groups[groupId].join('');
                  var idstr = '\\$'+groupId;
                  var idreplace = new RegExp(idstr, 'g');
                  ptype = ptype.replace(idreplace, groupStr);
                  ptype = ptype.replace(/%/g, "->");
                  gridx++;
                } else {
                  swapgr = false;
                }

              } //while swapping
            } //gr

            var pr = parenRegex.exec(ptype);
            if(pr) {
                ptype = pr[1];
            }

            return ptype;

        } //processType

        // split toplevel signature by the "%" (which is actually "->")
        var parts = toplevel.join('').split("%");

        // get a return or variable type
        var returnType = processType(parts.pop());

        // if there is only the return type, it's a variable
        // otherwise `parts` contains function arguments
        var isFunction = parts.length > 0;

        // format function arguments
        var args = [];
        for(var i = 0; i < parts.length; ++i) {
            var part = parts[i];

            // get argument name and type
            // if function is not a method, argument name is generated by its position
            var argname = '';
            var argtype = '';
            var ar = argNameRegex.exec(part);
            if(ar) {
                argname = ar[1];
                argtype = part.substr(ar[0].length, part.length);
            } else {
                argname = 'arg'+i;
                argtype = part;
            }

            argtype = processType(argtype);

            // we don't need to include the Void argument
            // because it represents absence of arguments
            if (argtype == "Void") {
                continue;
            }

            // if type is unknown, include only the argument name
            if(monomorphRegex.test(argtype)) {
                args.push(argname);
            } else {
                args.push(argname+':'+argtype);
            }

        } //each part

        // finally generate the signature
        var result = [];
        var res = { pre:_intype, sig:'', args:null, ret:null };
        if (isFunction) {
            res.sig += "(";
            res.sig += args.join(", ");
            res.sig += ")";
            res.args = args;
            res.ret = returnType;
        } else {
            res.sig = returnType;
        }

        return res;
    }

} //sig_helper
