
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

using StringTools;

/**
 Public API exposed to Atom.
 */
class HaxeDevMain {

    private static var subscriptions:CompositeDisposable = null;

    private static var failed:Bool = false;

    public static function main():Void {
            // We don't use haxe's built-in @:expose() because we want to expose
            // the whole class as a single module (with its own context)
        module.exports = cast HaxeDevMain;
    }

    public static function activate(serialized_state:Dynamic):Void {

            // Init internal modules
        Support.init(serialized_state != null ? serialized_state.support : null);
        Plugin.init(serialized_state != null ? serialized_state.plugin : null);

            // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        subscriptions = new CompositeDisposable();

        init_commands();
        init_menus();
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

    private static function init_commands():Void {
        Log.debug("Init commands");
            // Register command to set hxml file
        register_command('set-hxml-file', new commands.atom.SetHXMLFileFromTreeView());
    }


    private static function init_menus():Void {

        Log.debug("Init menus");

        Atom.contextMenu.add(untyped {
            ".tree-view .file": [
                { type: 'separator' },
                { label: 'Set as active HXML file (dev)', command: 'haxe-dev:set-hxml-file', shouldDisplay: should_display_context_tree },
                { type: 'separator' }
            ]
        });
    }

    private static function should_display_context_tree(event:js.html.Event):Bool {
        var key = '.hxml';
        var val:String = untyped event.target.innerText;
        if (val == null) return false;
        return val.endsWith(key);
    }

    private static function register_command(name:String, command:Command<Dynamic,Dynamic>, module:String = 'haxe-dev'):Void {


        subscriptions.add(Atom.commands.add('atom-workspace', module + ':' + name, function(opts:Dynamic):Dynamic {
            Plugin.workers.main.run_command(command);
            return null;
        }));
    }

}
