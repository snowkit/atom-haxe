package utils;

import js.node.Process;
import js.node.ChildProcess;

import js.Node.process;

import utils.Log;

using StringTools;

@:enum abstract BackgroundProcessExitCode(Int) {
    var EXIT_SUCCESS = 0;
    var EXIT_ORPHAN = 100;
}

@:enum abstract BackgroundProcessMessageKind(Int) {
    var MESSAGE = 0;
    var READY = 1;
    var LOG_DEBUG = 2;
    var LOG_INFO = 3;
    var LOG_SUCCESS = 4;
    var LOG_WARN = 5;
    var LOG_ERROR = 6;
}

typedef BackgroundProcessMessage = {
    var kind:BackgroundProcessMessageKind;
    @:optional var data:Dynamic;
    @:optional var options:Log.LogOptions;
}

    /** Create and communicate with a background (child) process */
class BackgroundProcess {

    private var message_handlers:Array<String->Void> = [];

    private var proc:js.node.child_process.ChildProcess;

    private var got_node_enoent_error:Bool = false;

    private var queued_messages:Array<String> = [];

    private var ready:Bool = false;

    private var killed:Bool = false;

        /** Return true if the current process is a background (child) process */
    public static function is_background_process():Bool {

        return process.argv.indexOf('is_background_process') != -1;

    } //has_parent_process

    public function new() {

        start_proc();

    } //new

    public function on_message(callback:String->Void):Void {
            // Add message handler
        message_handlers.push(callback);

    } //on_message

    public function post_message(message:String):Void {

        if (!ready) {
            queued_messages.push(message);
            return;
        }
            // Send message to child process
        proc.send({kind: MESSAGE, data: message});

    } //post_message

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

    } //kill

    private function start_proc():Void {
            // Got some inspiration from: https://github.com/TypeStrong/atom-typescript/blob/master/lib/worker/lib/workerLib.ts

            // Configure env properly
            // cf. atom/atom#2887
        var spawn_env:Dynamic = untyped (process.platform == 'linux') ? Object.create(process.env) : {};
        spawn_env.ATOM_SHELL_INTERNAL_RUN_AS_NODE = '1';
        var node:String = process.execPath;
        var jsfile:String = untyped __filename;
            // Ensure we use the worker js file (if any)
        if (jsfile.endsWith("-main.js")) {
            jsfile = jsfile.substring(0, jsfile.length - 8) + '-background.js';
        }
            // Start process
        proc = ChildProcess.spawn(node, [
            jsfile, 'is_background_process'
        ], {
            cwd: process.cwd(),
            env: spawn_env,
            stdio: ['ipc']
        });
            // Configure message hooks
        proc.on('message', function(message:BackgroundProcessMessage) {
            switch (message.kind) {
            case MESSAGE:
                for (handler in message_handlers) {
                    handler(message.data);
                }
            case LOG_DEBUG:
                Log.debug(message.data);
            case LOG_INFO:
                Log.info(message.data, message.options);
            case LOG_SUCCESS:
                Log.success(message.data, message.options);
            case LOG_WARN:
                Log.warn(message.data, message.options);
            case LOG_ERROR:
                Log.error(message.data, message.options);
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

    } //start_proc

}