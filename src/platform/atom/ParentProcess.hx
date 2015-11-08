package platform.atom;

import js.node.Process;
import haxe.Timer;

import platform.ChildProcess;
import platform.Log;

@:enum abstract ParentProcessMessageKind(Int) {
    var MESSAGE = 0;
    var READY = 1;
}

typedef ParentProcessMessage = {
    var kind:ParentProcessMessageKind;
    var data:Dynamic;
}

class ParentProcess {

    private static var process:Process = untyped __js__('process');

    private static var is_kept_alive:Bool = false;

    private static var keep_alive_timer:Timer = null;

    private static var message_handlers:Array<String->Void> = [];

    public static function has_parent_process():Bool {
        return process.argv.indexOf('has_parent_process') != -1;
    }

    public static function on_message(callback:String->Void):Void {
            // Initialize if needed
        initialize_if_needed();
            // Add message handler
        message_handlers.push(callback);
    }

    public static function post_message(message:String):Void {
            // Initialize if needed
        initialize_if_needed();
            // Post message
        process.send({kind: MESSAGE, data: message});
    }

    private static function initialize_if_needed():Void {
            // Initialize contact with parent only if a parent process exists
        if (!has_parent_process()) {
            Log.error('Invalid call of ParentProcess: there is no parent process to send/receive message.');
            return;
        }

            // Keep alive
        keep_alive();
            // Prepare to receive messages from parent
        process.on('message', function(message:ParentProcessMessage) {
            if (message.kind == MESSAGE) {
                for (handler in message_handlers) {
                    handler(message.data);
                }
            }
        });
            // Send READY signal
        process.send({kind: READY});
    }

    private static function keep_alive():Void {
            // Already kept alive?
        if (is_kept_alive) return;

            // Start timer to keep process alive
        Log.debug('Keep child process alive.');
        keep_alive_timer = new Timer(1000);
        keep_alive_timer.run = function() {
            if (untyped !process.connected) {
                is_kept_alive = false;
                process.exit(untyped ChildProcessExitCode.EXIT_ORPHAN);
            }
        };

        is_kept_alive = true;
    }

}
