
        // node built in
var   path = require('path')
        //lib code
    , run = require('../haxe-call')
    , state = require('../haxe-state')
    , compiler = require('../parsing/compiler')

module.exports = {

    init: function() {

        this.compiler_errors = [];

            // We need to watch editors in order to know
            // when a haxe file is saved and when to re-query haxe server
        this.editor_watch = atom.workspace.observeTextEditors(this._observe_editor.bind(this));
    },

    dispose: function() {

    },

    lint_file: function(editor, temporary_path, done) {
        done([]);
    },

//Internal

    _observe_editor: function(editor) {
        var file_path = editor.getPath();
        var ext = path.extname(file_path);
        var _this = this;

        if (ext === '.hx') {
            var save_observer = editor.onDidSave(function(event) {
                file_path = event.path;

                // TODO: query haxe server to get potential errors

                console.log("SAVED");
                _this._run_compiler();
            });

            var destroy_observer = editor.onDidDestroy(function() {
                save_observer.dispose();
                destroy_observer.dispose();
            });
        }
    },

    _run_compiler: function() {

        var options = {};
        var port = atom.config.get('atom-haxe.server_port');

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

        run.haxe(args).then(function(result) {
            console.log(result);
            if (result.err.length > 0) {
                console.log(compiler.parse_output(result.err));
            }
        });
    }

}
