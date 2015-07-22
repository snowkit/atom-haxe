
        // node built in
var   path = require('path')
        // lib code
    , run = require('../haxe-call')
    , state = require('../haxe-state')
    , compiler = require('../parsing/compiler')
        // atom related
    , Range = require('atom').Range

module.exports = {

        // When set to true, this linter will wait for compiler output
        // before providing result
    awaiting_info: true,

        // When the linter is awaiting for compiler output, it will have
        // a callback that will be called after retrieving info from compiler
    info_callback: null,

        // A copy of the used content to perform lint. Will be compared to
        // the editor's contents to know if the lint items are still valid
    used_contents: null,

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

        this.editor_watch.dispose();
    },

    lint_file: function(editor, temporary_path, done) {

            // Defer from 1ms because in many cases linters are triggered after
            // file save. In that case, we want to be sure the compiler will start
            // running before this code is executed.
        setImmediate((function() {

                // Compare saved file with editor's contents
                // If there are different, don't display any lint item
                // because haxe error linting is only based on saved files.
                // This will also prevent annoying pop ups showing up when writing code
            if (this.used_contents != null && editor.getBuffer().getText() != this.used_contents) {
                return done([]);
            }

            if (this.awaiting_info && this.info_callback == null) {
                    // This linter is waiting from compiler info
                this.info_callback = (function() {
                        // Called, after processing compiler output. Reset state and provide result
                    this.awaiting_info = false;

                    this._provide_lint_items(editor, done);

                }).bind(this);
            }
            else {
                    // Called, after processing compiler output. Reset state and provide result
                this.awaiting_info = false;

                this._provide_lint_items(editor, done);
            }

        }).bind(this));
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

        var i;

            // Inform linter that it should wait for compilation output
        this.used_contents = null;
        this.awaiting_info = true;

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

            //console.log(this.compiler_errors);
            //console.log(this.linters);

            // Notify linter that it can now process the new output
            this.awaiting_info = false;
            if (this.info_callback != null) {
                this.info_callback();
                this.info_callback = null;
            }
        }).bind(this));
    },

    _provide_lint_items: function(editor, done) {

        var message_lines, entry, info, i, j, l, editor_lines, start, end;

            // Don't perform lint on file not on disk
        var saved_path = editor.getBuffer().getPath();
        if (saved_path == null) {
            return done([]);
        }

            // Update linter's used contents
        this.used_contents = editor.getBuffer().getText();

        var result = [];

            // Compute items
        if (this.compiler_errors.length > 0) {
            for (i = 0; i < this.compiler_errors.length; i++) {
                info = this.compiler_errors[i];

                    // Only process the outputs related to the current file
                if (info.file_path == saved_path) {

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
                        if (editor_lines == null) {
                            editor_lines = editor.getText().split("\n");

                                // Get start and end in line after trimming left and right of the line
                            start = editor_lines[info.start - 1].length - editor_lines[info.start - 1].replace(/^\s*/, '').length;
                            end = editor_lines[info.start - 1].replace(/\s*$/, '').length;

                                // Add one entry with the message
                            entry = {
                                text:       info.message,
                                line:       info.line,
                                filePath:   info.file_path,
                                range:      new Range([info.start - 1, start], [info.start - 1, end]),
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
