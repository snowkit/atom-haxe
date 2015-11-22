package plugin;

import utils.Worker;

    /** Atom-specific plugin entry point */
class Plugin {

    public static var main_worker(get,null):Worker;
    private static function get_main_worker():Worker { return main_worker; }

    public static var background_worker(get,null):Worker;
    private static function get_background_worker():Worker { return background_worker; }

    public static var current_worker(get,null):Worker;
    private static function get_current_worker():Worker { return background_worker.process_kind == CURRENT ? background_worker : main_worker; }

    public static var other_worker(get,null):Worker;
    private static function get_other_worker():Worker { return background_worker.process_kind == CURRENT ? main_worker : background_worker; }

    public static var state:PluginState = null;

    public static function init(?serialized_state:Dynamic):Void {
        state = new PluginState(serialized_state);

            // Check if there is a parent process
        var has_parent_process:Bool = false;
        #if atom
        has_parent_process = platform.atom.ParentProcess.has_parent_process();
        #end

        if (has_parent_process) {
                // Background process setup
            background_worker = new Worker({process_kind: CURRENT});
            main_worker = new Worker({process_kind: PARENT, current_worker: background_worker});
        }
        else {
                // Main process setup
            main_worker = new Worker({process_kind: CURRENT});
            background_worker = new Worker({process_kind: CHILD, current_worker: main_worker});
        }
    }

    public static function dispose():Void {
        state.destroy();
        state = null;
    }

}
