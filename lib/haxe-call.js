
        //node built in
var  exec = require('./utils/exec');

//This can be require'd and then run haxe or haxelib commands
// which will return a promise with the error, output and code

module.exports = {

    haxe:function(args, ondataout, ondataerr) {
        return exec('haxe', args, ondataout, ondataerr);
    },

    haxelib:function(args, ondataout, ondataerr) {
        return exec('haxelib', args, ondataout, ondataerr);
    }

} //module.exports
