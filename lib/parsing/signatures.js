

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
