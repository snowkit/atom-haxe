package utils;

import utils.Promise;

import haxe.Serializer;
import haxe.Unserializer;

import platform.Log;
import platform.ChildProcess;
import platform.ParentProcess;

typedef WorkerOptions = {
    var process_kind:WorkerProcessKind;
    @:optional var main_worker:Worker;
}

typedef WorkerTaskCallbacks = {
    var resolve:Dynamic->Void;
    var reject:Dynamic->Void;
}

@:enum abstract WorkerProcessKind(Int) {
    var MAIN = 0;
    var CHILD = 1;
    var PARENT = 2;
}

@:enum abstract ProcessMessageKind (Int) {
    var TASK_RESOLVE = 0;
    var TASK_REJECT = 1;
    var RUN_TASK = 2;
}

/**
 Higher level abstraction to run tasks.
 Takes care of serializing/unserializing tasks to send them across
 different processes. This provides an easy way to run code either
 on background or ui process/thread.
 */
class Worker {

    private static var workers_by_id:Map<Int,Worker> = new Map<Int,Worker>();

    private static var next_worker_id:Int = 0;

    /**
     Worker identifier
     */
    public var id(get,null):Int;
    inline private function get_id():Int return id;

    /**
     Worker process kind (CURRENT, PARENT or CHILD)
     */
    public var process_kind(get,null):WorkerProcessKind;
    inline private function get_process_kind():WorkerProcessKind return process_kind;

    private var child_process:ChildProcess;

    private var awaiting_task_callbacks:Map<Int,WorkerTaskCallbacks> = new Map<Int,WorkerTaskCallbacks>();

    private var main_worker:Worker;

    public function new(options:WorkerOptions) {
            // Configure
        id = next_worker_id++;
        process_kind = options.process_kind;
            // Keep worker reference
        workers_by_id.set(id, this);

            // Keep track of main worker if given
        if (process_kind != MAIN) {
            if (options.main_worker != null) {
                    // Main worker is used to run task requested
                    // by parent/child process
                main_worker = options.main_worker;
            } else {
                throw "Option `main_worker` is required on workers of kind CHILD or PARENT";
            }
        } else {
            if (options.main_worker != null) {
                throw "Option `main_worker` is forbidden on worker of kind MAIN";
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
    }

    /**
     Run the given task on the worker.
     */
    public function run_task<P,R>(task:WorkerTask<P,R>):Promise<WorkerTask<P,R>> {
        return new Promise<WorkerTask<P,R>>(function(resolve, reject) {

            if (process_kind == CHILD) {
                    // Prepare from receiving response
                await_task_response(task.id, resolve, reject);
                    // Run task in child process
                var serializer = new Serializer();
                serializer.serialize(RUN_TASK);
                serializer.serialize(task);
                child_process.post_message(serializer.toString());
            }
            else if (process_kind == PARENT) {
                    // Prepare from receiving response
                await_task_response(task.id, resolve, reject);
                    // Run task in parent process
                var serializer = new Serializer();
                serializer.serialize(RUN_TASK);
                serializer.serialize(task);
                ParentProcess.post_message(serializer.toString());
            }
            else { //process_kind == CurrentProcess
                    // Run task
                task.internal_run(resolve, reject);
            }
        });
    }

    /**
     Destroy the worker and it's related child process if any.
     */
    public function destroy() {
            // Destroy child process if needed
        if (child_process != null) {
            child_process.kill();
            child_process = null;
        }
    }

    private function await_task_response(task_id, resolve:Dynamic->Void, reject:Dynamic->Void):Void {
            // Keep track of task id and callbacks until we get
            // news from the parent/child related process
        awaiting_task_callbacks.set(task_id, {resolve: resolve, reject: reject});
    }

    private function on_process_message(message:String):Void {
        var unserializer = new Unserializer(message);
        var message_kind:ProcessMessageKind = unserializer.unserialize();

            // Run task requested by parent process
        if (message_kind == RUN_TASK) {
            var task:WorkerTask<Dynamic,Dynamic> = unserializer.unserialize();

            main_worker.run_task(task).then(function(result) {
                    // Resolve
                var serializer = new Serializer();
                serializer.serialize(TASK_RESOLVE);
                serializer.serialize(task);
                if (process_kind == PARENT) {
                    ParentProcess.post_message(serializer.toString());
                } else if (process_kind == CHILD) {
                    child_process.post_message(serializer.toString());
                }

            }).error(function(error) {
                    // Reject
                var serializer = new Serializer();
                serializer.serialize(TASK_REJECT);
                serializer.serialize(task);
                serializer.serialize(error);
                if (process_kind == PARENT) {
                    ParentProcess.post_message(serializer.toString());
                } else if (process_kind == CHILD) {
                    child_process.post_message(serializer.toString());
                }
            });
        }
            // Resolve task
        else if (message_kind == TASK_RESOLVE) {
            var task = unserializer.unserialize();

            if (!awaiting_task_callbacks.exists(task.id)) {
                throw "Cannot resolve task "+task+" because it is not running.";
            }

            var callbacks = awaiting_task_callbacks.get(task.id);
            awaiting_task_callbacks.remove(task.id);
            callbacks.resolve(task);
        }
            // Reject task
        else if (message_kind == TASK_REJECT) {
            var task = unserializer.unserialize();

            if (!awaiting_task_callbacks.exists(task.id)) {
                throw "Cannot reject task "+task+" because it is not running.";
            }

            var callbacks = awaiting_task_callbacks.get(task.id);
            awaiting_task_callbacks.remove(task.id);
            var error = unserializer.unserialize();
            callbacks.reject(error);
        }
    }

}
