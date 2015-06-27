
        //node built in
var  exec = require('./utils/exec');

//This can be require'd and then run haxe or haxelib commands
// which will return a promise with the error, output and code

module.exports = {

    haxe:function(args, ondataout, ondataerr) {
        var haxe_path = atom.config.get('haxe.haxe_path') || 'haxe';
        return exec(haxe_path, args, ondataout, ondataerr);
    },

    haxelib:function(args, ondataout, ondataerr) {
        var haxelib_path = atom.config.get('haxe.haxelib_path') || 'haxelib';
        return exec(haxelib_path, args, ondataout, ondataerr);
    }

} //module.exports
