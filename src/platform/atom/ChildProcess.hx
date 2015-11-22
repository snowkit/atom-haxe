package platform.atom;

import js.node.Process;
import js.node.ChildProcess as NodeProcess;

import js.Node.process;

import platform.Log;

using StringTools;

@:enum abstract ChildProcessExitCode(Int) {
    var EXIT_SUCCESS = 0;
    var EXIT_ORPHAN = 100;
}

@:enum abstract ChildProcessMessageKind(Int) {
    var MESSAGE = 0;
    var READY = 1;
    var LOG_DEBUG = 2;
    var LOG_INFO = 3;
    var LOG_SUCCESS = 4;
    var LOG_WARN = 5;
    var LOG_ERROR = 6;
}

typedef ChildProcessMessage = {
    var kind:ChildProcessMessageKind;
    @:optional var data:Dynamic;
    @:optional var display:Bool;
}

class ChildProcess {

    private var message_handlers:Array<String->Void> = [];

    private var proc:js.node.child_process.ChildProcess;

    private var got_node_enoent_error:Bool = false;

    private var queued_messages:Array<String> = [];

    private var ready:Bool = false;

    private var killed:Bool = false;

    public function new() {
        start_proc();
    }

    public function on_message(callback:String->Void):Void {
            // Add message handler
        message_handlers.push(callback);
    }

    public function post_message(message:String):Void {
        if (!ready) {
            queued_messages.push(message);
            return;
        }
            // Send message to child process
        proc.send({kind: MESSAGE, data: message});
    }

    public function kill() {
        killed = true;
        if (proc == null) return;
        try {
            proc.kill('SIGTERM');
        }
        catch (ex:Dynamic) {
            Log.error('Failed to kill child process.');
        }
        proc = null;
    }

    private function start_proc():Void {
            // Got some inspiration from: https://github.com/TypeStrong/atom-typescript/blob/master/lib/worker/lib/workerLib.ts

            // Configure env properly
            // cf. atom/atom#2887
        var spawn_env:Dynamic = untyped (process.platform == 'linux') ? Object.create(process.env) : {};
        spawn_env.ATOM_SHELL_INTERNAL_RUN_AS_NODE = '1';
        var node:String = process.execPath;
        var jsfile:String = untyped __filename;
            // Ensure we use the worker js file
        if (jsfile.endsWith("-main.js")) {
            jsfile = jsfile.substring(0, jsfile.length - 8) + '-background.js';
        }
            // Start process
        proc = NodeProcess.spawn(node, [
            jsfile, 'has_parent_process'
        ], {
            cwd: process.cwd(),
            env: spawn_env,
            stdio: ['ipc']
        });
            // Configure message hooks
        proc.on('message', function(message:ChildProcessMessage) {
            switch (message.kind) {
            case MESSAGE:
                for (handler in message_handlers) {
                    handler(message.data);
                }
            case LOG_DEBUG:
                Log.debug(message.data);
            case LOG_INFO:
                Log.info(message.data, message.display);
            case LOG_SUCCESS:
                Log.success(message.data, message.display);
            case LOG_WARN:
                Log.warn(message.data, message.display);
            case LOG_ERROR:
                Log.error(message.data, message.display);
            case READY:
                ready = true;
                    // Send queued messages
                var messages = queued_messages;
                queued_messages = [];
                for (message in messages) {
                    post_message(message);
                }
            }
        });
        proc.on('error', function(error) {
            if (error.code == "ENOENT" && error.path == node) {
                got_node_enoent_error = true;
            }
            Log.error(error);
            proc = null;
        });
        proc.stdout.on('data', function(data) {
            Log.debug(data);
        });
        proc.stderr.on('data', function(data) {
            Log.error(data);
        });
        proc.on('close', function(code) {
            if (killed) return;

                // Handle process dropping
            if (code == EXIT_ORPHAN) {
                    // If orphaned, restart
                start_proc();
            }
            else if (got_node_enoent_error) {
                    // If we got ENOENT, restarting will not help
                Log.error('Cannot start child process because of ENOENT error.');
            }
            else {
                    // We haven't found a reason to not start worker yet
                Log.warn('Restarting child process. Don\'t know why it stopped with code: ' + code);
                start_proc();
            }
        });
    }

}
