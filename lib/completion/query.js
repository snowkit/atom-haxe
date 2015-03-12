
        // node built in
var   exec = require('child_process').spawn
    , path = require('path')
        // lib code
    , debug = require('./debug')


module.exports = {

    state: {
        hxml_file:null,
        hxml_content:null,
        hxml_cwd:null
    },

    init: function(state) {
        this.set_state(state);
    },

    dispose:function() {

    },

    set_hxml_file:function(file, cwd) {
        this.state.hxml_file = file;
        this.state.hxml_cwd = cwd || path.dirname(file);
        this.state.hxml_content = null;
        debug.query('state hxml file to ' + this.state.hxml_file);
        debug.query('state hxml cwd to ' + this.state.hxml_cwd);
    },

    set_hxml_content:function(file_content, cwd) {
        this.state.hxml_file = null;
        this.state.hxml_content = file_content;
        this.state.hxml_cwd = cwd;
        debug.query('state hxml file content set to' + this.state.hxml_file_content);
        debug.query('state hxml cwd to ' + this.state.hxml_cwd);
    },

    set_state:function(state) {
        if(state) {
            this.state.hxml_content = state.hxml_content;
            this.state.hxml_file = state.hxml_file;
            this.state.hxml_cwd = state.hxml_cwd;
            debug.query('state set to ' + JSON.stringify(this.state));
        }
    },

    get: function(options) {

        if(!options) {
            // console.log('no options to query');
            return null;
        }

        return new Promise(function(resolve, reject) {

            var port = atom.config.get('atom-haxe.server_port');

            var byte  = options.byte || 0
            var file  = options.file || '';
            var cwd   = options.cwd  || this.state.hxml_cwd;
            var args = [];

            if(cwd) {
                args.push('--cwd');
                args.push(cwd);
            }

                //check if hxml content is set
            var hxml = options.hxml_content || this.state.hxml_content;
                //if not, check for a file
            if(!hxml) {
                    //check if there's a file given instead
                hxml = options.hxml_file || this.state.hxml_file;
                    //if there is, make it relative
                if(hxml) {
                    hxml = path.relative(cwd, hxml);
                    args.push(hxml);
                } else {
                    var err = 'No completion hxml is configured';
                    log.error(err);
                    return reject();
                }
            } else {

                args = args.concat( hxml.split('\n') );

            }

            args.push('--display');
            args.push(file+'@'+byte);

            args.push('--connect');
            args.push(''+port);

            debug.query('on ' + port + ' with ' + args.join(' '));
            debug.query('');

            var process = exec('haxe', args);
            var final_err = '';
            var final_out = '';

            process.stdout.on('data', function(data){
                final_out += data.toString('utf-8');
            });

            process.stderr.on('data', function(data){
                final_err += data.toString('utf-8');
            });

            process.on('close', function(code) {
                if(final_err) {
                    resolve(final_err);
                } else {
                    resolve(final_out);
                }
            }); //on close

        }.bind(this)); //promise

    }, //get

} //module.exports
