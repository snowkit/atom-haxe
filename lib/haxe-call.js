
        //node built in
var  exec = require('child_process').spawn

//This can be require'd and then run haxe or haxelib commands
// which will return a promise with the error, output and code

module.exports = {

    haxe:function(args) {
        return this.exec('haxe', args);
    },

    haxelib:function(args) {
        return this.exec('haxelib', args);
    },

    exec:function(cmd, args) {

        return new Promise(function(resolve, reject){

            var final_err = '';
            var final_out = '';
            var process = exec(cmd, args);

            process.stdout.on('data', function(data){
                final_out += data.toString('utf-8');
            });

            process.stderr.on('data', function(data){
                final_err += data.toString('utf-8');
            });

            process.on('close', function(code) {
                resolve({out:final_out, err:final_err, code:code});
            }); //on close

        }); //Promise

    }, //exec

} //module.exports
