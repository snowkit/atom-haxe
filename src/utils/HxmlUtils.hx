package utils;

using StringTools;

class HxmlUtils {
        /** Match any single/double quoted string */
    static var REGEX_BEGINS_WITH_STRING:EReg = new EReg('^(?:"(?:[^"\\\\]*(?:\\\\.[^"\\\\]*)*)"|\'(?:[^\']*(?:\'\'[^\']*)*)\')', '');

    public static function parse_hxml_args(raw_hxml:String):Array<String> {

        var args = [];
        var i = 0;
        var len = raw_hxml.length;
        var current_arg = '';
        var prev_arg = null;
        var number_of_parens = 0;
        var c, m0;

        while (i < len) {
            c = raw_hxml.charAt(i);

            if (c == '(') {
                if (prev_arg == '--macro') {
                    number_of_parens++;
                }
                current_arg += c;
                i++;
            }
            else if (number_of_parens > 0 && c == ')') {
                number_of_parens--;
                current_arg += c;
                i++;
            }
            else if (c == '"' || c == '\'') {
                if (REGEX_BEGINS_WITH_STRING.match(raw_hxml.substr(i))) {
                    m0 = REGEX_BEGINS_WITH_STRING.matched(0);
                    current_arg += m0;
                    i += m0.length;
                }
                else {
                        // This should not happen, but if it happens, just add the character
                    current_arg += c;
                    i++;
                }
            }
            else if (c.trim() == '') {
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
