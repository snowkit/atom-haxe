
        // lib code
var   state = require('../haxe-state')
        // node built in
    , path = require('path')

    // Match haxe compiler output info
var REGEX_HAXE_COMPILER_OUTPUT_LINE = /^\s*([^\:]+)\:([0-9]+)\:\s+(characters|lines)\s+([0-9]+)\-([0-9]+)(?:\s+\:\s*(.*?))?\s*$/;

module.exports = {

        // Parse haxe compiler output and extract info
    parse_output: function(output, options) {

        if (options == null) {
            options = {};
        }

        var info = [];
        var prev_info = null;
        var lines = output.split("\n");
        var cwd = state.hxml_cwd;
        var i, l, m, line, file_path, location, start, end, message;

        for (i = 0; i < lines.length; i++) {
                // Reset the regex index
                // This is still better than creating a new regex each time.
            REGEX_HAXE_COMPILER_OUTPUT_LINE.lastIndex = -1;

            line = lines[i];

            if (info.length > 0) {
                prev_info = info[info.length - 1];
            }

            if (m = line.match(REGEX_HAXE_COMPILER_OUTPUT_LINE)) {
                file_path = m[1];
                line = parseInt(m[2], 10);
                location = m[3];
                start = parseInt(m[4], 10);
                end = parseInt(m[5], 10);
                message = m[6];

                if (message != null || options.allow_empty_message) {

                        // Make file_path absolute if possible
                    if (cwd != null && !path.isAbsolute(file_path)) {
                        file_path = path.join(cwd, file_path);
                    }

                    if (message != null
                        && prev_info != null
                        && prev_info.message != null
                        && prev_info.file_path == file_path
                        && prev_info.location == location
                        && prev_info.line == line
                        && prev_info.start == start
                        && prev_info.end == end) {
                            // Concatenate multiline message
                        prev_info.message += "\n" + message;
                    }
                    else {
                        info.push({
                            line: line,
                            file_path: file_path,
                            location: location,
                            start: start,
                            end: end,
                            message: message
                        });
                    }
                }
            }
        } //for lines

            // Prevent duplicate messages as this can happen, like multiple `Unexpected (` at the same location
            // We may want to remove this snippet in a newer haxe compiler version if the output is never duplicated anymore
        for (i = 0; i < info.length; i++) {
            message = info[i].message;
            var message_lines = message.split("\n");
            var all_lines_are_equal = true;
            if (message_lines.length > 1) {
                line = message_lines[0];
                for (l = 1; l < message_lines.length; l++) {
                    if (line != message_lines[l]) {
                        all_lines_are_equal = false;
                        break;
                    }
                    line = message_lines[l];
                }
                    // If all lines of message are equal, just keep one line
                if (all_lines_are_equal) {
                    info[i].message = line;
                }
            }
        }

        return info;

    } //parse_output

}
