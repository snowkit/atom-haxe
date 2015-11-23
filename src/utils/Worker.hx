package utils;

import utils.Promise;

import haxe.Serializer;
import haxe.Unserializer;

import platform.Log;
import platform.ChildProcess;
import platform.ParentProcess;

typedef WorkerOptions = {
    var process_kind:WorkerProcessKind;
    @:optional var current_worker:Worker;
}

typedef CommandCallbacks = {
    var resolve:Dynamic->Void;
    var reject:Dynamic->Void;
}

@:enum abstract WorkerProcessKind(Int) {
    var CURRENT = 0;
    var CHILD = 1;
    var PARENT = 2;
}

@:enum abstract ProcessMessageKind (Int) {
    var COMMAND_RESOLVE = 0;
    var COMMAND_REJECT = 1;
    var RUN_COMMAND = 2;
}

    /** Higher level abstraction to run tasks.
        Takes care of serializing/unserializing tasks to send them across
        different processes. This provides an easy way to run code either
        on background or main process/thread. */
class Worker {

    private static var workers_by_id:Map<Int,Worker> = new Map<Int,Worker>();

    private static var next_worker_id:Int = 0;

        /** Worker identifier */
    public var id(get,null):Int;
    inline private function get_id():Int return id;

        /** Worker process kind (CURRENT, PARENT or CHILD) */
    public var process_kind(get,null):WorkerProcessKind;
    inline private function get_process_kind():WorkerProcessKind return process_kind;

    private var child_process:ChildProcess;

    private var awaiting_command_callbacks:Map<Int,CommandCallbacks> = new Map<Int,CommandCallbacks>();

    private var main_worker:Worker;

    public function new(options:WorkerOptions) {
            // Configure
        id = next_worker_id++;
        process_kind = options.process_kind;
            // Keep worker reference
        workers_by_id.set(id, this);

            // Keep track of main worker if given
        if (process_kind != CURRENT) {
            if (options.current_worker != null) {
                    // Current worker is used to run task requested
                    // by parent/child process
                main_worker = options.current_worker;
            } else {
                throw "Option `current_worker` is required on workers of kind CHILD or PARENT";
            }
        } else {
            if (options.current_worker != null) {
                throw "Option `current_worker` is forbidden on worker of kind CURRENT";
            }
        }

            // Create child process if needed
        if (process_kind == CHILD) {
            child_process = new ChildProcess();
            child_process.on_message(on_process_message);
        }
            // Listen to parent process if needed
        else if (process_kind == PARENT) {
            ParentProcess.on_message(on_process_message);
        }

    } //new

        /** Run the given command on the worker. */
    public function run_command<P,R>(command:Command<P,R>):Promise<Command<P,R>> {

        return new Promise<Command<P,R>>(function(resolve, reject) {

            if (process_kind == CHILD) {
                    // Prepare from receiving response
                await_command_response(command.id, resolve, reject);
                    // Run command in child process
                var serializer = new Serializer();
                serializer.serialize(RUN_COMMAND);
                serializer.serialize(command);
                child_process.post_message(serializer.toString());
            }
            else if (process_kind == PARENT) {
                    // Prepare from receiving response
                await_command_response(command.id, resolve, reject);
                    // Run command in parent process
                var serializer = new Serializer();
                serializer.serialize(RUN_COMMAND);
                serializer.serialize(command);
                ParentProcess.post_message(serializer.toString());
            }
            else { //process_kind == CurrentProcess
                    // Run task
                command.internal_execute(resolve, reject);
            }
        });

    } //new

        /** Destroy the worker and it's related child process if any. */
    public function destroy() {
            // Destroy child process if needed
        if (child_process != null) {
            child_process.kill();
            child_process = null;
        }

    } //destroy

    private function await_command_response(command_id, resolve:Dynamic->Void, reject:Dynamic->Void):Void {
            // Keep track of command id and callbacks until we get
            // news from the parent/child related process
        awaiting_command_callbacks.set(command_id, {resolve: resolve, reject: reject});

    } //await_command_response

    private function on_process_message(message:String):Void {

        var unserializer = new Unserializer(message);
        var message_kind:ProcessMessageKind = unserializer.unserialize();

            // Run command requested by parent process
        if (message_kind == RUN_COMMAND) {
            var command:Command<Dynamic,Dynamic> = unserializer.unserialize();

            main_worker.run_command(command).then(function(result) {
                    // Resolve
                var serializer = new Serializer();
                serializer.serialize(COMMAND_RESOLVE);
                serializer.serialize(command);
                if (process_kind == PARENT) {
                    ParentProcess.post_message(serializer.toString());
                } else if (process_kind == CHILD) {
                    child_process.post_message(serializer.toString());
                }

            }).error(function(error) {
                    // Reject
                var serializer = new Serializer();
                serializer.serialize(COMMAND_REJECT);
                serializer.serialize(command);
                serializer.serialize(error);
                if (process_kind == PARENT) {
                    ParentProcess.post_message(serializer.toString());
                } else if (process_kind == CHILD) {
                    child_process.post_message(serializer.toString());
                }
            });
        }
            // Resolve command
        else if (message_kind == COMMAND_RESOLVE) {
            var command = unserializer.unserialize();

            if (!awaiting_command_callbacks.exists(command.id)) {
                throw "Cannot resolve command "+command+" because it is not running.";
            }

            var callbacks = awaiting_command_callbacks.get(command.id);
            awaiting_command_callbacks.remove(command.id);
            callbacks.resolve(command);
        }
            // Reject command
        else if (message_kind == COMMAND_REJECT) {
            var command = unserializer.unserialize();

            if (!awaiting_command_callbacks.exists(command.id)) {
                throw "Cannot reject command "+command+" because it is not running.";
            }

            var callbacks = awaiting_command_callbacks.get(command.id);
            awaiting_command_callbacks.remove(command.id);
            var error = unserializer.unserialize();
            callbacks.reject(error);
        }

    } //on_process_message

}
