
import js.Node.module;
import js.Browser.console;

import state.State;

import utils.HaxeParsingUtils;
import utils.Worker;
import utils.Command;

import platform.Log;

import atom.Atom;
import atom.Panel;
import atom.CompositeDisposable;

/**
 Public API exposed to Atom.
 */
class HaxeDevMain {

    private static var subscriptions: CompositeDisposable = null;

    public static function main():Void {
            // Start plugin
        Log.debug('Starting HaxeDev plugin...');
            // We don't use haxe's built-in @:expose() because we want to expose
            // the whole class as a single module (with its own context)
        module.exports = cast HaxeDevMain;
            // Init state
        State.init();
    }

    public static function activate(state:Dynamic):Void {
            // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        subscriptions = new CompositeDisposable();

            // Register command that toggle
        Log.debug('Starting HaxeDev worker...');
        subscriptions.add(Atom.commands.add('atom-workspace', {'haxe-dev:toggle': toggle}));
    }

    public static function deactivate(state:Dynamic):Void {
        subscriptions.dispose();
    }

    public static function serialize():Dynamic {
        return {};
    }

    public static function toggle():Void {
        Log.debug('HaxeDev was toggled!');
    }

}
