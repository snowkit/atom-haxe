
        // node built in
var   exec = require('child_process').spawn
        // lib code
    , debug = require('./debug')


module.exports = {

    init:function() {
        var time = atom.config.get('haxe.server_activation_start_delay');
        setTimeout(this.reset.bind(this), time * 1000.0);
    },

    dispose:function() {
        this.stop();
    },

    on_exit:function(code) {
        debug.server('process exit ' + code);
        this.process = null;
    },

    on_data:function(data) {
        debug.server(data.toString('utf-8'));
    },

    on_error:function(data) {
        debug.server(data.toString('utf-8'));
    },

    reset:function() {

        this.stop();

        var port = atom.config.get('haxe.server_port');

        debug.server('starting on ' + port);

        var haxe_path = atom.config.get('haxe.haxe_path') || 'haxe';
        this.process = exec(haxe_path, ['-v','--wait',''+port]);
        this.process.stdout.on('data', this.on_data.bind(this));
        this.process.stderr.on('data', this.on_error.bind(this));
        this.process.on('close', this.on_exit.bind(this));

    }, //reset

    stop:function() {

        if(this.process) {
            try {
                this.process.kill();
                debug.server('stopped');
            } catch(e) {
                //nothing to do
            }
        }

        this.process = null;

    } //stop


} //module.exports
