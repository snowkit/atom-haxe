
        // node built in
var   path = require('path')
    , fs = require('fs')
        // lib code
    , run = require('../haxe-call')
    , state = require('../haxe-state')
    , compiler = require('../parsing/compiler')
        // atom related
    , Range = require('atom').Range

module.exports = {

        // The first lint will wait until haxe compiler is ready
        // This will be set to false after the linting ran once
    should_wait_for_compiler: true,

        // Last compiler output errors
    compiler_errors: [],

    init: function() {

    },

    dispose: function() {

    },

    lint_project: function(editor, done) {

            // The first lint is delayed to be sure the compiler is ready
        if (this.should_wait_for_compiler) {
            var time = atom.config.get('haxe.server_activation_start_delay');
            setTimeout((function() {
                    // Update flag
                this.should_wait_for_compiler = false;
                    // Lint
                this.lint_project(editor, done);

            }).bind(this), (time + 1) * 1000.0);

            return;
        }

            // Defer from 1ms because in many cases linters are triggered after
            // file save. In that case, we want to be sure the compiler will start
            // running before this code is executed.
        setImmediate((function() {

            this._run_compiler((function() {
                this._provide_lint_items(editor, done);
            }).bind(this));

        }).bind(this));
    },

//Internal

    _run_compiler: function(done) {

        var port = atom.config.get('haxe.server_port');

        var args = [];
        args.push('--no-output');

        if (port) {
            args.push('--connect');
            args.push(String(port));
        }

        args = state.as_args(args);

        run.haxe(args).then((function(result) {

                // Extract errors from output
            if (result.err.length > 0) {
                this.compiler_errors = compiler.parse_output(result.err);
            } else {
                this.compiler_errors = [];
            }

            done();

            
        }).bind(this));
    },

    _provide_lint_items: function(editor, done) {

        var message_lines, entry, info, i, j, l, file_lines, start, end;

        var result = [];

            // Compute items
        if (this.compiler_errors.length > 0) {
            for (i = 0; i < this.compiler_errors.length; i++) {
                info = this.compiler_errors[i];
                file_lines = null;

                    // Error located on a characters range in the single line
                if (info.location === 'characters') {

                        // Add one entry with the message
                    entry = {
                        text:       info.message,
                        line:       info.line,
                        filePath:   info.file_path,
                        range:      new Range([info.line - 1, info.start], [info.line - 1, info.end]),
                        type:       'Error'
                    };

                    result.push(entry);
                }
                    // Error located on multiple lines
                else if (info.location === 'lines') {
                        // Use the editor content to locate lint only on visible character ranges
                    if (file_lines == null) {
                            // Use file contents to find the best range
                        if (fs.existsSync(info.file_path)) {
                            file_lines = String(fs.readFileSync(info.file_path)).split("\n");

                                // Get start and end in line after trimming left and right of the line
                            start = file_lines[info.start - 1].length - file_lines[info.start - 1].replace(/^\s*/, '').length;
                            end = file_lines[info.start - 1].replace(/\s*$/, '').length;

                                // Add one entry with the message
                            entry = {
                                text:       info.message,
                                line:       info.line,
                                filePath:   info.file_path,
                                range:      new Range([info.line - 1, start], [info.line - 1, end]),
                                type:      'Error'
                            };

                            result.push(entry);
                        }
                    }
                }
            }
        }

        done(result);
    }

}
