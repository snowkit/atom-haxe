package plugin;

import utils.Worker;

import platform.MessagePanel;
import platform.Log;

    /** Atom-specific plugin entry point */
class Plugin {

    public static var state:PluginState = null;

    public static var workers:Workers = null;

    public static function init(?serialized_state:Dynamic):Void {
            // Init message panel
        MessagePanel.init();

            // Start plugin
        Log.debug('Starting HaxeDev plugin...');

        state = new PluginState(serialized_state);
        workers = new Workers();
    }

    public static function dispose():Void {
        state.destroy();
        state = null;
        workers.destroy();
        workers = null;
    }

}
