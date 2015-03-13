
        // node built in
var   path = require('path')
        //lib code
    , run = require('../haxe-call')

module.exports = {

    init: function() {
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

        if (ext === '.hx') {
            var saveObserver = editor.onDidSave(function(event) {
                file_path = event.path;

                // TODO: query haxe server to get potential errors

                // :sven: for ^, use:
                // run.haxe([args]).then(function(result){
                    //result.out result.err result.code
                //})
            });

            var destroyObserver = editor.onDidDestroy(function() {
                saveObserver.dispose();
                destroyObserver.dispose();
            });
        }
    }

}
