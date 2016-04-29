package build;

import plugin.Plugin.state;

import atom.Atom.atom;

import utils.Log;
import utils.Run;
import utils.Exec;

class DefaultBuilder {

    public static function build():Void {

        atom.notifications.addInfo('Haxe: Running build \u2026', {});

            // We can assume since we did state.is_valid before
        var args = state.as_args();
        var build = Run.haxe(args, {}, onout, onerr);
        Log.info('Running build \u2026', {display: true, clear: true});
        Log.debug('haxe ' + args.join(' '));

        build.then(function(res:ExecResult) {
            if (res.code != 0) {
                atom.notifications.addWarning('Haxe: Build failed. Check log.', {});
                Log.error('Build failed', {display: true});
            } else {
                atom.notifications.addSuccess('Haxe: Build succeeded', {});
                Log.success('Build succeeded', {display: true});
            }
        });

    } //build

    private static function onout(s:String):Void {
        Log.info(s, {display: true});
    }

    private static function onerr(s:String):Void {
        Log.error(s, {display: true});
    }

}
