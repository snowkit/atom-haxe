
var   lint = require('./lint')
        // base linter class
    , Linter = require(atom.packages.getLoadedPackage('linter').path + '/lib/linter')
        // extends
    , extend = require('../utils/extend.js')


    // We need to provide a Linter subclass to the linter plugin
    // This is just forwarding call to our main lint code
function HaxeLinter() {
    HaxeLinter.__super__.constructor.apply(this, arguments);

        // When set to true, this linter will wait for compiler output
        // before providing result
    this.awaiting_info = true;

        // When the linter is awaiting for compiler output, it will have
        // a callback that will be called after retrieving info from compiler
    this.info_callback = null;

        // A copy of the used content to perform lint. Will be compared to
        // the editor's contents to know if the lint items are still valid
    this.used_contents = null;

        // Keep track of this linter
    lint.add_linter(this);
}

    // Extend parent class
extend(HaxeLinter, Linter);

    // Use this linter for haxe files
HaxeLinter.syntax = ['source.haxe'];

    // Override method to provide lint messages and forward to our own lint object
HaxeLinter.prototype.lintFile = function(temporary_file_path, done) {
    lint.lint_file(this, this.editor, temporary_file_path, done);
}

HaxeLinter.prototype.destroy = function() {
        // Release linter before it is destroyed
    lint.remove_linter(this);
    HaxeLinter.__super__.destroy.apply(this, arguments);
}

module.exports = HaxeLinter;
