
    // Match any single/double quoted string
var REGEX_BEGINS_WITH_STRING = /^(?:"(?:[^"\\]*(?:\\.[^"\\]*)*)"|\'(?:[^\'\\]*(?:\\.[^\'\\]*)*)\')/;

module.exports = {

        // Parse hxml data and return an array of arguments (compatible with node child_process.spawn)
    parse_hxml_args: function(raw_hxml) {
        var args = [];
        var i = 0;
        var len = raw_hxml.length;
        var current_arg = '';
        var prev_arg = null;
        var number_of_parens = 0;
        var c, m;

        while (i < len) {
            c = raw_hxml.charAt(i);

            if (c === '(') {
                if (prev_arg === '--macro') {
                    number_of_parens++;
                }
                current_arg += c;
                i++
            }
            else if (number_of_parens > 0 && c === ')') {
                number_of_parens--;
                current_arg += c;
                i++;
            }
            else if (c === '"' || c === '\'') {
                REGEX_BEGINS_WITH_STRING.lastIndex = -1;
                if (m = raw_hxml.slice(i).match(REGEX_BEGINS_WITH_STRING)) {
                    current_arg += m[0];
                    i += m[0].length;
                }
                else {
                        // This should not happen, but if it happens, just add the character
                    current_arg += c;
                    i++;
                }
            }
            else if (c.trim() === '') {
                if (number_of_parens == 0) {
                    if (current_arg.length > 0) {
                        prev_arg = current_arg;
                        current_arg = '';
                        args.push(prev_arg);
                    }
                }
                else {
                    current_arg += c;
                }
                i++;
            }
            else {
                current_arg += c;
                i++;
            }

        }

        if (current_arg.length > 0) {
            args.push(current_arg);
        }

        return args;
    }

}
