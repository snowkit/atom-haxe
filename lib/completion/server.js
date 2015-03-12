
        // node built in
var   exec = require('child_process').spawn
        // lib code
    , log = require('./log')


module.exports = {

  init:function() {
    var time = atom.config.get('atom-haxe.server_activation_start_delay');
    setTimeout(this.reset.bind(this), time * 1000.0);
  },

  dispose:function() {
    this.stop();
  },

  on_exit:function(code) {
    log.server('process exit ' + code);
    this.process = null;
  },

  on_data:function(data) {
    log.server(data.toString('utf-8'));
  },

  on_error:function(data) {
    log.server(data.toString('utf-8'));
  },

  reset:function() {

    this.stop();

    var port = atom.config.get('atom-haxe.server_port');

    log.server('starting on ' + port);

    this.process = exec('haxe', ['-v','--wait',''+port]);
    this.process.stdout.on('data', this.on_data.bind(this));
    this.process.stderr.on('data', this.on_error.bind(this));
    this.process.on('close', this.on_exit.bind(this));

  },

  stop:function() {

    if(this.process) {
      try {
        this.process.kill();
        log.server('stopped');
      } catch(e) {}
    }

    this.process = null;

  }


}
