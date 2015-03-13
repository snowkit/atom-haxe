
        //node built in
var  exec = require('./utils/exec');

//This can be require'd and then run haxe or haxelib commands
// which will return a promise with the error, output and code

module.exports = {

    haxe:function(args) {
        return exec('haxe', args);
    },

    haxelib:function(args) {
        return exec('haxelib', args);
    }

} //module.exports
