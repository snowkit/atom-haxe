
var   state     = require('../haxe-state')
    , run       = require('../haxe-call')
    , log       = require('../utils/log')

module.exports = {

    run_build: function() {

        if(state.valid) {

                // - I want to handle the build
                // - I don't handle the build, you run it
                // - I don't handle the build,
                //   but don't run haxe on the hxml
            if(state.consumer) {
                if(state.consumer.does_build) {
                    log.debug('consumer handling build: ' + state.consumer.name);
                    this.run_consumer_build();
                } else if(!state.consumer.no_build) {
                    log.debug('consumer build pass, run default hxml');
                    this.run_hxml_build();
                } else {
                    console.log('consumer configured no build');
                }
            } else {
                this.run_hxml_build();
            }

        } else {

            atom.notifications.addWarning('Haxe: No project state set. No build possible.');

        }

    }, //run_build


    run_consumer_build: function() {

        if(state.consumer.onRunBuild) {
            state.consumer.onRunBuild({
                haxe_args: state.as_args(),
                run: {
                    haxe:function(){ run.haxe.apply(run, arguments); },
                    haxelib:function(){ run.haxelib.apply(run, arguments); }
                }
            });
        } else {
            var info = 'Haxe: A package trying to build is misconfigured. <br/>';
                info += 'Please report this to the following package: <br/>';
                info += '- ' + state.consumer.name;
                console.log('haxe: misconfigured build consumer: ', state.consumer);
            atom.notifications.addWarning(info, {dismissable:true});
        }

    }, //run_consumer_build

    run_hxml_build: function() {

        atom.notifications.addInfo('Haxe: Running build...');

            //we can assume since we did state.valid above
        var args = state.as_args();
        var build = run.haxe(args, this._logi, this._loge);
        log.info('Running build...', true)
        log.debug('haxe ' + args.join(' '));
        build.then(function(res){
            if(res.code) {
                atom.notifications.addWarning('Haxe: Build failed. check log.');
                log.error('Build failed', false, true);
            } else {
                atom.notifications.addSuccess('Haxe: Build succeeded');
                log.success('Build succeeded');
            }
        });

    }, //run_hxml_build

    _logi: function(s) {
        log.msg(s, false, true);
    }, //

    _loge: function(s) {
        log.error(s, false, true);
    }, //

} //module.exports
