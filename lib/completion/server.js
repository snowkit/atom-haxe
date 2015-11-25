
        // node built in
var   exec = require('child_process').spawn
        // lib code
    , debug = require('./debug')


var should_run = false;
module.exports = {

    init:function() {
        should_run = true;
        var time = atom.config.get('haxe.server_activation_start_delay');
        setTimeout(this.reset.bind(this), time * 1000.0);
    },

    dispose:function() {
        should_run = false;
        this.stop();
    },

    on_exit:function(code) {
        debug.server('process exit ' + code);
        this.process = null;

            // Try to start again the server if it was ended
            // when it should be active. This ensures the server will be
            // restarted when closing the window that was running it.
        if (should_run) setTimeout(this.reset_if_needed.bind(this), 5000.0);
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
        var haxe_path = atom.config.get('haxe.haxe_path') || 'haxe';

        debug.server('starting `' + haxe_path + '` on `' + port + '`');

        this.process = exec(haxe_path, ['--wait',''+port]);
        this.process.stdout.on('data', this.on_data.bind(this));
        this.process.stderr.on('data', this.on_error.bind(this));
        this.process.on('close', this.on_exit.bind(this));

    }, //reset

    reset_if_needed:function() {

        if (should_run && !this.process) this.reset();

    }, //reset_if_needed

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
