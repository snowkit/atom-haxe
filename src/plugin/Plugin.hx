package plugin;

import utils.Worker;

import platform.MessagePanel;
import platform.Log;

import utils.Command;

import atom.Atom.atom;
import atom.CompositeDisposable;

using StringTools;

    /** Atom-specific plugin entry point */
class Plugin {

    private static var subscriptions:CompositeDisposable = null;

    public static var state:PluginState = null;

    public static var workers:Workers = null;

    public static function init(?serialized_state:Dynamic):Void {
            // Init message panel
        MessagePanel.init();

            // Start plugin
        Log.debug('Starting HaxeDev plugin...');

        state = new PluginState(serialized_state);
        workers = new Workers();

            // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        subscriptions = new CompositeDisposable();

        init_commands();
        init_menus();

    } //init

    public static function dispose():Void {

        subscriptions.dispose();

        state.destroy();
        state = null;

        workers.destroy();
        workers = null;

    } //dispose

    private static function init_commands():Void {

        Log.debug("Init commands");
            // Register command to set hxml file
        register_command('set-hxml-file', new commands.atom.SetHXMLFileFromTreeView());

    } //init_commands

    private static function init_menus():Void {

        Log.debug("Init menus");

        atom.contextMenu.add(untyped {
            ".tree-view .file": [
                { type: 'separator' },
                { label: 'Set as active HXML file (dev)', command: 'haxe-dev:set-hxml-file', shouldDisplay: should_display_context_tree },
                { type: 'separator' }
            ]
        });

    } //init_menus

    private static function should_display_context_tree(event:js.html.Event):Bool {

        var key = '.hxml';
        var val:String = untyped event.target.innerText;
        if (val == null) return false;
        return val.endsWith(key);

    } //should_display_context_tree

    private static function register_command(name:String, command:Command<Dynamic,Dynamic>, module:String = 'haxe-dev'):Void {

        subscriptions.add(atom.commands.add('atom-workspace', module + ':' + name, function(opts:Dynamic):Dynamic {
            workers.main.run_command(command);
            return null;
        }));

    } //register_command

}
