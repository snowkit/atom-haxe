package context;

import utils.Worker;

import platform.Log;
import platform.Exec;

import utils.Promise;

#if !background
import context.HaxeService;
#end

// Extend either background or main state while
// still manipulating a similar "State"
// interface from both processes
class BaseState {

    public var main_worker(get,null):Worker;
    private function get_main_worker():Worker { return main_worker; }

    public var background_worker(get,null):Worker;
    private function get_background_worker():Worker { return background_worker; }

    public var current_worker(get,null):Worker;
    private function get_current_worker():Worker { return background_worker.process_kind == CURRENT ? background_worker : main_worker; }

    public var other_worker(get,null):Worker;
    private function get_other_worker():Worker { return background_worker.process_kind == CURRENT ? main_worker : background_worker; }

    public var hxml_content:String;

    public var hxml_file:String;

    public var hxml_cwd:String;

    public static function init() {}

    public static function dispose() {}

    private function new(?serialized_state:Dynamic) {
            // Unserialize values
        if (serialized_state != null) unserialize(serialized_state);

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

            // Synchronize
        synchronize();
    }

        /** Serialize */
    public function serialize():Dynamic {
            // Put all values we want to keep in the mapping
        var values:Dynamic = {};
        values.hxml_content = hxml_content;
        values.hxml_cwd = hxml_cwd;
        values.hxml_file = hxml_file;
        return values;
    }

        /** Unserialize */
    public function unserialize(values:Dynamic):Void {
            // Update all values on the target state (this)
        hxml_content = values.hxml_content;
        hxml_cwd = values.hxml_cwd;
        hxml_file = values.hxml_file;
    }

        /** Synchronize this state with the other worker's state.
            (only the serialized values are synchronized) */
    public function synchronize() {
            // Put in values mapping all properties
            // that needs to be synchronized
            // (we are only synchronizing the subset that should be shared ; we would
            // rather keep the other main process values on the main state and vice versa)
        var values:Dynamic = serialize();
            // Run the command to serialize and
            // assign values on the other worker's state
        return other_worker.run_command(new commands.SynchronizeState({values: values}));
    }

}

#if background

class BackgroundState extends BaseState {

    public static var state(get,null):State;
    private static function get_state():State { return state; }

    public static function init() {
        BaseState.init();
        state = new State();
    }

    public static function dispose() {
        state = null;
        BaseState.dispose();
    }

}
typedef State = BackgroundState;

#else

class MainState extends BaseState {

    public static var state(get,null):State;
    private static function get_state():State { return state; }

    public static function init(serialized_state:Dynamic) {
        BaseState.init();
        state = new State(serialized_state);
    }

    public static function dispose() {
        state = null;
        BaseState.dispose();
    }

    public var consumer(default,set):HaxeServiceConsumer;

    private function set_consumer(consumer:HaxeServiceConsumer):HaxeServiceConsumer {
        this.consumer = consumer;
            // Update state from consumer
        hxml_content = consumer.hxml_content;
        hxml_cwd = consumer.hxml_cwd;
        hxml_file = consumer.hxml_file;
        return consumer;
    }

}
typedef State = MainState;

#end
