package state;

import utils.Worker;

import platform.Log;
import platform.Exec;

import utils.Promise;

import tasks.HelloTask;

class State {

    public static var main_worker(get,null):Worker;
    private static function get_main_worker():Worker { return main_worker; }

    public static var child_worker(get,null):Worker;
    private static function get_child_worker():Worker { return child_worker; }

    public static var parent_worker(get,null):Worker;
    private static function get_parent_worker():Worker { return parent_worker; }

    public static function init() {
            // Check if there is a parent process
        var has_parent_process:Bool = false;
        #if atom
        has_parent_process = platform.atom.ParentProcess.has_parent_process();
        #end

        if (has_parent_process) {
                // Child worker setup
            main_worker = new Worker({process_kind: MAIN});
            parent_worker = new Worker({process_kind: PARENT, main_worker: main_worker});
        }
        else {
                // Default worker setup
            main_worker = new Worker({process_kind: MAIN});
            child_worker = new Worker({process_kind: CHILD, main_worker: main_worker});
        }
    }

    public static function synchronize():Void {
        //
    }

}
