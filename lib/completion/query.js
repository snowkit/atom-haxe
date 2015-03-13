
        // node built in
var   path = require('path')
        // lib code
    , debug = require('./debug')
    , run = require('../haxe-call')
    , state = require('../haxe-state')


module.exports = {

    init: function() {
    },

    dispose:function() {
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
            var cwd   = options.cwd  || state.hxml_cwd;
            var args = [];

            if(cwd) {
                args.push('--cwd');
                args.push(cwd);
            }

            var hxml_args = state.hxml_as_args(options);
            if(!hxml_args) {
                log.error('no completion hxml is configured');
                return reject();
            }

            args = args.concat(hxml_args);

            args.push('--display');
            args.push(file+'@'+byte);

            args.push('--connect');
            args.push(''+port);

            debug.query('on ' + port + ' with ' + args.join(' '));
            debug.query('');

            run.haxe(args).then(function(result) {
                resolve(result.err || result.out);
            });

        }.bind(this)); //promise

    }, //get

} //module.exports