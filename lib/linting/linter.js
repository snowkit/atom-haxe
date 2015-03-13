
var   lint = require('./lint')
        // base linter class
    , Linter = require(atom.packages.getLoadedPackage('linter').path + '/lib/linter')
        // extends
    , extend = require('../utils/extend.js')


    // We need to provide a Linter subclass to the linter plugin
    // This is just forwarding call to our main lint code
function HaxeLinter() {
    HaxeLinter.__super__.constructor.apply(this, arguments);
}

    // Extend parent class
extend(HaxeLinter, Linter);

    // Use this linter for haxe files
HaxeLinter.syntax = ['source.haxe'];

    // Override method to provide lint messages and forward to our own lint object
HaxeLinter.prototype.lintFile = function(temporary_file_path, done) {
    lint.lint_file(this.editor, temporary_file_path, done);
}

module.exports = HaxeLinter;
