
    // Match any single/double quoted string
var REGEX_BEGINS_WITH_STRING = new RegExp('^(?:"(?:[^"\\\\]*(?:\\\\.[^"\\\\]*)*)"|\'(?:[^\']*(?:\'\'[^\']*)*)\')', '');

var REGEX_ENDS_WITH_BEFORE_CALL_CHAR = /[a-zA-Z0-9_\]\)]\s*$/;
var REGEX_ENDS_WITH_KEY = /([a-zA-Z0-9_]+)\s*\:$/;
var REGEX_ENDS_WITH_ALPHANUMERIC = /([a-zA-Z0-9_]+)$/;
var REGEX_BEGINS_WITH_KEY = /^([a-zA-Z0-9_]+)\s*\:/;
var REGEX_PACKAGE = /^package\s*([a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)*)/;

module.exports = {

        // Parse a composed haxe type (that can be a whole function signature)
        // and return an object with all the informations walkable recursively (json-friendly)
        // A function type will have an `args` value next to the `type` value
        // while a regular type will only have a `type` value.
        // In case the type is itself named inside another function signature, a `name` value
        // Will be added to it.
    parse_composed_type: function(raw_composed_type, ctx) {

        var info = {};
        var len = raw_composed_type.length;

        var current_item = '';
        var items = [];
        var item_params = [];
        var c, item, sub_item, params;

        if (ctx == null) {
            ctx = {
                i: 0, // index
                stop: null // the character that stopped the last recursive call
            };
        }

            // Iterate over each characters and parse groups recursively
        while (ctx.i < len) {
            c = raw_composed_type.charAt(ctx.i);

            if (c === '(') {
                ctx.i++;
                if (current_item.length > 0 && current_item.charAt(current_item.length - 1) === ':') {
                        // New group, continue parsing in a sub call until the end of the group
                    item = {
                        name: current_item.slice(0, current_item.length-1),
                        type: this.parse_composed_type(raw_composed_type, ctx)
                    };
                    if (item.name.charAt(0) === '?') {
                        item.optional = true;
                        item.name = item.name.slice(1);
                    }
                    items.push(item);
                } else {
                    items.push(this.parse_composed_type(raw_composed_type, ctx));
                }
                current_item = '';
            }
            else if (c === '<') {
                ctx.i++;

                    // Add type parameters
                params = [];
                do {
                    params.push(this.parse_composed_type(raw_composed_type, ctx));
                }
                while (ctx.stop === ',');

                if (current_item.length > 0) {
                    item = this.parse_composed_type(current_item);

                    item.type = {
                        type: item.type,
                        params: params
                    };

                    items.push(item);
                }
                item_params.push([]);
                current_item = '';
            }
            else if (c === '{') {
                    // Parse structure type
                if (current_item.length > 0 && current_item.charAt(current_item.length - 1) === ':') {
                    item = {
                        name: current_item.slice(0, current_item.length-1),
                        type: this.parse_structure_type(raw_composed_type, ctx)
                    };
                    if (item.name.charAt(0) === '?') {
                        item.optional = true;
                        item.name = item.name.slice(1);
                    }
                    items.push(item);
                } else {
                    items.push(this.parse_structure_type(raw_composed_type, ctx));
                }
                current_item = '';
            }
            else if (c === ')') {
                ctx.i++;
                ctx.stop = ')';
                break;
            }
            else if (c === '>') {
                ctx.i++;
                ctx.stop = '>';
                break;
            }
            else if (c === ',') {
                ctx.i++;
                ctx.stop = ',';
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

            // Stopped by end of string
        if (ctx.i >= len) {
            ctx.stop = null;
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


        // Parse structure type like {f:Int}
        // Can be nested.
        // Will update ctx.i (index) accordingly to allow
        // a parent method to continue parsing of a bigger string
    parse_structure_type: function(raw_structure_type, ctx) {

        var item = '';
        var len = raw_structure_type.length;
        var number_of_lts = 0;
        var c;

        if (ctx == null) {
            ctx = {
                i: 0 // index
            };
        }

        while (ctx.i < len) {
            c = raw_structure_type.charAt(ctx.i);

            if (c === '{') {
                number_of_lts++;
                ctx.i++;
                item += c;
            }
            else if (c === '}') {
                number_of_lts--;
                ctx.i++;
                item += c;
                if (number_of_lts <= 0) {
                    break;
                }
            }
            else if (c.trim() === '') {
                ctx.i++;
            }
            else if (number_of_lts === 0) {
                item = '{}';
                break;
            }
            else {
                item += c;
                ctx.i++;
            }
        }

        return {
            type: item
        };
    },

        // Parse haxe type / haxe named argument
        // It will return an object with a `type` value or with both a `type` and `name` values
    parse_type: function(raw_type) {

        var parts = raw_type.split(':');
        var result = {};

        if (parts.length === 2) {
            result.type = parts[1];
            result.name = parts[0];

        } else {
            result.type = parts[0];
        }

            // Optional?
        if (result.name != null && result.name.charAt(0) === '?') {
            result.optional = true;
            result.name = result.name.slice(1);
        }

        return result;
    },

        // Get string from parsed haxe type
        // It may be useful to stringify a sub-type (group)
        // of a previously parsed type
    string_from_parsed_type: function(parsed_type) {
        if (parsed_type == null) {
            return '';
        }

        if (typeof(parsed_type) == 'object') {
            var result;

            if (parsed_type.args != null) {
                var str_args;
                if (parsed_type.args.length > 0) {
                    var arg_items = [];
                    var str_arg;
                    for (var i = 0; i < parsed_type.args.length; i++) {
                        str_arg = this.string_from_parsed_type(parsed_type.args[i]);
                        if (parsed_type.args[i].args != null && parsed_type.args[i].args.length == 1) {
                            str_arg = '(' + str_arg + ')';
                        }
                        arg_items.push(str_arg);
                    }
                    str_args = arg_items.join('->');
                }
                else {
                    str_args = 'Void';
                }

                if (parsed_type.type != null && parsed_type.type.args != null) {
                    result = str_args + '->(' + this.string_from_parsed_type(parsed_type.type) + ')';
                } else {
                    result = str_args + '->' + this.string_from_parsed_type(parsed_type.type)
                }
            }
            else {
                result = this.string_from_parsed_type(parsed_type.type);
            }

            if (parsed_type.params != null && parsed_type.params.length > 0) {
                var params = [];
                for (var i = 0; i < parsed_type.params.length; i++) {
                    params.push(this.string_from_parsed_type(parsed_type.params[i]));
                }

                result += '<' + params.join(',') + '>';
            }

            return result;
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
        text = this.code_with_empty_comments_and_strings(text.slice(0, index));

        var i = index - 1;
        var number_of_args = 0;
        var number_of_parens = 0;
        var number_of_braces = 0;
        var number_of_lts = 0;
        var number_of_unclosed_parens = 0;
        var number_of_unclosed_braces = 0;
        var number_of_unclosed_lts = 0;
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
                if (number_of_parens === 0 && number_of_braces === 0 && number_of_lts === 0) {
                    can_set_colon_index = false;
                    number_of_args++;
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
                if (can_set_colon_index && number_of_braces === 0 && number_of_parens == 0 && number_of_lts === 0) {
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
            else if (c === '>' && text.charAt(i - 1) !== '-') {
                number_of_lts++;
                i--
            }
            else if (c === '<') {
                if (number_of_lts > 0) {
                    number_of_lts--;
                } else {
                        // Reset number of arguments because we found that
                        // all the already parsed text is inside an unclosed lower-than token
                    number_of_args = 0;

                        // Reset key path also if needed
                    can_set_colon_index = true;
                    colon_index = -1;

                    number_of_unclosed_lts++;
                }
                i--;
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

        // Extract used keys in structure
        // For instance, when writing: `{a: {b: "c"}, d: |`, used_keys will contain 'a' and 'd'.
    extract_used_keys_in_structure: function(cleaned_text) {

        var i = 0, len = cleaned_text.length;
        var number_of_braces = 0;
        var number_of_parens = 0;
        var number_of_lts = 0;
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
            else if (c === '<') {
                number_of_lts++;
                i++
            }
            else if (c === '>' && cleaned_text.charAt(i - 1) !== '-') {
                number_of_lts--;
                i++;
            }
            else if (number_of_braces === 0 && number_of_parens === 0 && number_of_lts === 0) {
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

        // Return the given code after replacing single-line/multiline comments
        // and string contents with white spaces
        // In other words, the output will be the same haxe code, with the same text length
        // but strings will be only composed of spaces and comments completely replaced with spaces
        // Use this method to simplify later parsing of the code and/or make it more efficient
        // where you don't need string and comment contents
    code_with_empty_comments_and_strings: function(input) {

        var i = 0;
        var output = '';
        var len = input.length;
        var is_in_single_line_comment = false;
        var is_in_multiline_comment = false;
        var matches, k;

        while (i < len) {

            if (is_in_single_line_comment) {
                if (input.charAt(i) === "\n") {
                    is_in_single_line_comment = false;
                    output += "\n";
                }
                else {
                    output += ' ';
                }
                i++;
            }
            else if (is_in_multiline_comment) {
                if (input.substr(i, 2) === '*/') {
                    is_in_multiline_comment = false;
                    output += '  ';
                    i += 2;
                }
                else {
                    if (input.charAt(i) === "\n") {
                        output += "\n";
                    }
                    else {
                        output += ' ';
                    }
                    i++;
                }
            }
            else if (input.substr(i, 2) === '//') {
                is_in_single_line_comment = true;
                output += '  ';
                i += 2;
            }
            else if (input.substr(i, 2) === '/*') {
                is_in_multiline_comment = true;
                output += '  ';
                i += 2;
            }
            else if (input.charAt(i) === '\'' || input.charAt(i) === '"') {
                REGEX_BEGINS_WITH_STRING.lastIndex = -1;
                if (matches = input.substring(i).match(REGEX_BEGINS_WITH_STRING)) {
                    var match_len = matches[0].length;
                    output += '"';
                    for (k = 0; k < match_len - 2; k++) {
                        output += ' ';
                    }
                    output += '"';
                    i += match_len;
                }
                else {
                        // Input finishes with non terminated string
                        // In that case, remove the partial string and put spaces
                    while (i < len) {
                        output += ' ';
                        i++;
                    }
                }
            }
            else {
                output += input.charAt(i);
                i++;
            }
        }

        return output;
    },

        // Extract a package (as string)
        // From the given haxe code contents.
        // Default package will be an empty string
    extract_package: function(input) {

        var i = 0;
        var len = input.length;
        var is_in_single_line_comment = false;
        var is_in_multiline_comment = false;
        var matches;

        while (i < len) {

            if (is_in_single_line_comment) {
                if (input.charAt(i) === "\n") {
                    is_in_single_line_comment = false;
                }
                i++;
            }
            else if (is_in_multiline_comment) {
                if (input.substr(i, 2) === '*/') {
                    is_in_multiline_comment = false;
                    i += 2;
                }
                else {
                    i++;
                }
            }
            else if (input.substr(i, 2) === '//') {
                is_in_single_line_comment = true;
                i += 2;
            }
            else if (input.substr(i, 2) === '/*') {
                is_in_multiline_comment = true;
                i += 2;
            }
            else if (input.charAt(i).trim() === '') {
                i++;
            }
            else if ((REGEX_PACKAGE.lastIndex = -1) && (matches = input.slice(i).match(REGEX_PACKAGE))) {
                return matches[1];
            }
            else {
                    // Something that is neither a comment or a package token shown up.
                    // We are done
                return '';
            }
        }

        return '';
    }

} //module.exports
