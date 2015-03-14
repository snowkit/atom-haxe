
        // node built in
var   path = require('path')
        // lib code
    , run = require('../haxe-call')
    , state = require('../haxe-state')
    , compiler = require('../parsing/compiler')
        // atom related
    , Range = require('atom').Range

module.exports = {

        // Current linters
    linters: [],

        // Last compiler output errors
    compiler_errors: [],

    init: function() {

            // We need to watch editors in order to know
            // when a haxe file is saved and when to re-query haxe server
        this.editor_watch = atom.workspace.observeTextEditors(this._observe_editor.bind(this));

            // Run compiler once, one second after the haxe server is supposed to be started
            // A better option could be to have an explicit event to catch when the server is ready
        var time = atom.config.get('haxe.server_activation_start_delay');
        setTimeout(this._run_compiler.bind(this), (time + 1) * 1000.0);
    },

    dispose: function() {

        this.linters = [];
        this.editor_watch.dispose();
    },

    lint_file: function(linter, editor, temporary_path, done) {

            // Defer from 100ms because in many cases linters are triggered after
            // file save. In that case, we want to be sure the compiler will start
            // running before this code is executed.
        setTimeout((function() {

            if (linter.awaiting_info && linter.info_callback == null) {
                    // This linter is waiting from compiler info
                linter.info_callback = (function() {
                        // Called, after processing compiler output. Reset state and provide result
                    linter.awaiting_info = false;

                    this._provide_lint_items(editor, done);

                }).bind(this);
            }
            else {
                    // Called, after processing compiler output. Reset state and provide result
                linter.awaiting_info = false;

                this._provide_lint_items(editor, done);
            }

        }).bind(this), 100);
    },

    add_linter: function(linter) {
        this.linters.push(linter);
    },

    remove_linter: function(linter) {
        this.linters.splice(this.linters.indexOf(linter), 1);
    },

//Internal

    _observe_editor: function(editor) {
        var file_path = editor.getPath();
        var ext = path.extname(file_path);

        if (ext === '.hx') {
            var save_observer = editor.onDidSave((function(event) {
                file_path = event.path;

                // Run compiler when saving file
                this._run_compiler();

            }).bind(this));

            var destroy_observer = editor.onDidDestroy(function() {
                save_observer.dispose();
                destroy_observer.dispose();
            });
        }
    },

    _run_compiler: function() {
        //console.log("RUN COMPILER");

        var i, linter;

            // Inform linters that they should wait for compilation output
        for (i = 0; i < this.linters.length; i++) {
            linter = this.linters[i];
            linter.awaiting_info = true;
        }

        var options = {};
        var port = atom.config.get('haxe.server_port');

        var cwd  = state.hxml_cwd;
        var args = [];

        args.push('--no-output');

        if (cwd) {
            args.push('--cwd');
            args.push(cwd);
        }

        var hxml_args = state.hxml_as_args(options);
        if (hxml_args) {
            args = args.concat(hxml_args);
        }

        run.haxe(args).then((function(result) {

                // Extract errors from output
            if (result.err.length > 0) {
                this.compiler_errors = compiler.parse_output(result.err);
            } else {
                this.compiler_errors = [];
            }

            //console.log(this.compiler_errors);
            //console.log(this.linters);

                // Notify linters that they can now process the new output
            for (i = 0; i < this.linters.length; i++) {
                linter = this.linters[i];
                linter.awaiting_info = false;
                if (linter.info_callback != null) {
                    linter.info_callback();
                    linter.info_callback = null;
                }
            }
        }).bind(this));
    },

    _provide_lint_items: function(editor, done) {

        var message_lines, entry, info, i, j, l, editor_lines, start, end;

        var saved_path = editor.getBuffer().getPath();

        if (saved_path == null) {
            return done([]);
        }

        var result = [];

            // Compute items
        if (this.compiler_errors.length > 0) {
            for (i = 0; i < this.compiler_errors.length; i++) {
                info = this.compiler_errors[i];

                    // Only process the outputs related to the current file
                if (info.file_path == saved_path) {

                        // Error located on a characters range in the single line
                    if (info.location === 'characters') {

                            // Return one entry for each line of the message
                        message_lines = info.message.split("\n");
                        for (l = 0; l < message_lines.length; l++) {
                            entry = {
                                message:    message_lines[l],
                                line:       info.line,
                                range:      new Range([info.line - 1, info.start], [info.line - 1, info.end]),
                                level:      'error',
                                linter:     'Haxe'
                            };

                            if (l == 0) {
                                entry.linter = 'Haxe';
                            }

                            result.push(entry);
                        }
                    }
                        // Error located on multiple lines
                    else if (info.location === 'lines') {
                            // Use the editor content to locate lint only on visible character ranges
                        if (editor_lines == null) {
                            editor_lines = editor.getText().split("\n");

                            for (j = info.start - 1; j < info.end; j++) {
                                    // Get start and end in line after trimming left and right of the line
                                start = editor_lines[j].length - editor_lines[j].replace(/^\s*/, '').length;
                                end = editor_lines[j].replace(/\s*$/, '').length;

                                    // Return one entry for each line of the message
                                message_lines = info.message.split("\n");
                                for (l = 0; l < message_lines.length; l++) {
                                    entry = {
                                        message:    message_lines[l],
                                        line:       j + 1,
                                        range:      new Range([j, start], [j, end]),
                                        level:      'error'
                                    };

                                    if (l == 0) {
                                        entry.linter = 'Haxe';
                                    }

                                    result.push(entry);
                                }
                            }
                        }
                    }
                }
            }
        }

        done(result);
    }

}
