package context;

import utils.Worker;

import platform.Log;
import platform.Exec;

import utils.Promise;

#if background

class BackgroundState {

}
typedef BaseState = BackgroundState;

#else

import context.HaxeService;

class MainState {

    public var consumer(default,set):HaxeServiceConsumer;

    private function set_consumer(consumer:HaxeServiceConsumer):HaxeServiceConsumer {
        return this.consumer = consumer;
    }

}
typedef BaseState = MainState;

#end

// Extend either background or main state while
// still manipulating a similar "State"
// interface from both processes
class State extends BaseState {

    public static var state(get,null):State;
    private static function get_state():State { return state; }

    public var main_worker(get,null):Worker;
    private function get_main_worker():Worker { return main_worker; }

    public var background_worker(get,null):Worker;
    private function get_background_worker():Worker { return background_worker; }

    public var current_worker(get,null):Worker;
    private function get_current_worker():Worker { return background_worker.process_kind == CURRENT ? background_worker : main_worker; }

    public var other_worker(get,null):Worker;
    private function get_other_worker():Worker { return background_worker.process_kind == CURRENT ? main_worker : background_worker; }

    public var hxml_data:String;

    public var hxml_file:String;

    public static function init() {
        state = new State();
    }

    private function new() {
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

    /**
     Synchronize this state with the other worker's state.
     (only the relevant values)
     */
    public function synchronize():Void {
            // Put in values mapping all properties
            // that needs to be synchronized
            // (we are only synchronizing the subset that should be shared ; we would
            // rather keep the other main process values on the main state and vice versa)
        var values:Dynamic = {};
        values.hxml_data = hxml_data;
            // Run the command to serialize and
            // assign values on the other worker's state
        other_worker.run_command(new commands.SynchronizeState({values: values})).then(function(command) {
            command.params.values;
        });
    }

    /**
     Assign values received from other worker's state
     */
    private function assign_values(values:Dynamic):Void {
            // Update all values on the target state (this)
        hxml_data = values.hxml_data;
    }

}
