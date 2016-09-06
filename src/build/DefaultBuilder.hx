package build;

import plugin.Plugin.state;

import atom.Atom.atom;

import utils.Log;
import utils.Run;
import utils.Exec;

import utils.Promise;

class DefaultBuilder {

    public static function build():Void {

        atom.notifications.addInfo('Haxe: Running build \u2026', {});

            // We can assume since we did state.is_valid before
        var build:Promise<ExecResult>;

        Log.info('Running build \u2026', {display: true, clear: true});

        if (state.consumer.build_command != null) {
                // Custom build command
            var command = Exec.parse_command_line(state.consumer.build_command);
            build = Exec.run(command.cmd, command.args, {cwd: state.consumer.cwd, channel: 'build-project'}, onout, onerr);
            Log.debug(command.cmd + ' ' + command.args.join(' '));
        }
        else {
                // Default build command
            var args = state.as_args();
            build = Run.haxe(args, {cwd: state.hxml.cwd, channel: 'build-project'}, onout, onerr);
            Log.debug('haxe ' + args.join(' '));
        }

        build.then(function(res:ExecResult) {
            if (!res.killed) {
                if (res.code != 0) {
                    atom.notifications.addWarning('Haxe: Build failed. Check log.', {});
                    Log.error('Build failed', {display: true});
                } else {
                    atom.notifications.addSuccess('Haxe: Build succeeded', {});
                    Log.success('Build succeeded', {display: true});
                }
            } else {
                Log.info('Stopped previous build', {display: true});
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
