
    // Match any single/double quoted string
var REGEX_BEGINS_WITH_STRING = new RegExp('^(?:"(?:[^"\\\\]*(?:\\\\.[^"\\\\]*)*)"|\'(?:[^\']*(?:\'\'[^\']*)*)\')', '');

module.exports = {

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
    }

} //module.exports
