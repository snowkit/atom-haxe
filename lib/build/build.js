
var   state     = require('../haxe-state')
    , run       = require('../haxe-call')
    , log       = require('../utils/log')

module.exports = {

    attempt: function() {

        if(state.valid) {
            var info = 'Haxe: Running build...<br/>';
            atom.notifications.addInfo(info);
            this._run_build();
        } else {
            atom.notifications.addWarning('Haxe: No project state set. No build possible.');
        }

    },

    _run_build: function() {
            //we can assume since we did state.valid above
        var args = state.as_args();
        var build = run.haxe(args, this._logi, this._loge);
        log.info('Build running...', true)
        log.debug('haxe ' + args.join(' '));
        build.then(function(res){
            if(res.code) {
                atom.notifications.addWarning('Haxe: Build failed. See log');
                log.error('Build failed', false, true);
            } else {
                atom.notifications.addSuccess('Haxe: Build succeeded');
                log.success('Build succeeded');
            }
        });
    },

    _logi: function(s) {
        log.msg(s, false, true);
    },

    _loge: function(s) {
        log.error(s, false, true);
    },

} //module.exports
