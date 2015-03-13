
var spawn = require('child_process').spawn

    //runs a command with args,
    //returning a promise that will resolve with
    //{ out:..., err:..., code:... }
    //the promise does not reject

module.exports = function(cmd, args) {

    return new Promise(function(resolve, reject){

        var total_err = '';
        var total_out = '';
        var proc = spawn(cmd, args);

        proc.stdout.on('data', function(data){
            total_out += data.toString('utf-8');
        });

        proc.stderr.on('data', function(data){
            total_err += data.toString('utf-8');
        });

        proc.on('close', function(code) {
            resolve({
                out:total_out,
                err:total_err,
                code:code
            });
        }); //on close

    }); //Promise

} //module.exports
