
import js.Node.module;
import js.Browser.console;

import support.Support;

import plugin.Plugin;

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

    private static var subscriptions:CompositeDisposable = null;

    private static var failed:Bool = false;

    public static function main():Void {
            // Start plugin
        Log.debug('Starting HaxeDev plugin...');
        var test = "test";
            // We don't use haxe's built-in @:expose() because we want to expose
            // the whole class as a single module (with its own context)
        module.exports = cast HaxeDevMain;
    }

    public static function activate(serialized_state:Dynamic):Void {
            // Init internal modules
        Plugin.init(serialized_state != null ? serialized_state.plugin : null);
        Support.init(serialized_state != null ? serialized_state.support : null);

            // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        subscriptions = new CompositeDisposable();

            // Register command to set hxml file
        register_command('set-hxml-file', new commands.atom.SetHXMLFileFromTreeView());
    }

    public static function deactivate(state:Dynamic):Void {
            // Dispose internal modules
        Plugin.dispose();
        Support.dispose();

        subscriptions.dispose();
    }

    public static function serialize():Dynamic {
        if (!failed) return {
            plugin: Plugin.state.serialize(),
            support: Support.state.serialize()
        };
        return null;
    }

    private static function register_command(name:String, command:Command<Dynamic,Dynamic>, module:String = 'atom-workspace'):Void {


        subscriptions.add(Atom.commands.add(name, module + ':' + name, function(opts:Dynamic):Dynamic {
            Plugin.main_worker.run_command(command);
            return null;
        }));
    }

}
