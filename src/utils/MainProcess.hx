package utils;

import js.node.Process;
import js.Node.process;

import haxe.Timer;

import utils.BackgroundProcess;
import utils.Log;

@:enum abstract MainProcessMessageKind(Int) {
    var MESSAGE = 0;
    var READY = 1;
}

typedef MainProcessMessage = {
    var kind:MainProcessMessageKind;
    var data:Dynamic;
}

    /** Communicate with the main (parent) process (if not current) */
class MainProcess {

    private static var is_kept_alive:Bool = false;

    private static var keep_alive_timer:Timer = null;

    private static var message_handlers:Array<String->Void> = [];

        /** Return true if the current process is the main process */
    public static function is_main_process():Bool {

        return process.argv.indexOf('is_background_process') == -1;

    } //has_parent_process

        /** Listen to messages sent from main (parent) process */
    public static function on_message(callback:String->Void):Void {
            // Initialize if needed
        initialize_if_needed();
            // Add message handler
        message_handlers.push(callback);

    } //on_message

        /** Send a message to the main (parent) process */
    public static function post_message(message:String):Void {
            // Initialize if needed
        initialize_if_needed();
            // Post message
        process.send({kind: MESSAGE, data: message});

    } //post_message

    private static function initialize_if_needed():Void {
            // Initialize contact with parent only if a parent process exists
        if (!has_parent_process()) {
            Log.error('Invalid call of MainProcess: there is no parent process to send/receive message.');
            return;
        }

            // Keep alive
        keep_alive();
            // Prepare to receive messages from parent
        process.on('message', function(message:MainProcessMessage) {
            if (message.kind == MESSAGE) {
                for (handler in message_handlers) {
                    handler(message.data);
                }
            }
        });
            // Send READY signal
        process.send({kind: READY});

    } //initialize_if_needed

    private static function keep_alive():Void {
            // Already kept alive?
        if (is_kept_alive) return;

            // Start timer to keep process alive
        Log.debug('Keep child process alive.');
        keep_alive_timer = new Timer(1000);
        keep_alive_timer.run = function() {
            if (untyped !process.connected) {
                is_kept_alive = false;
                process.exit(untyped BackgroundProcessExitCode.EXIT_ORPHAN);
            }
        };

        is_kept_alive = true;

    } //keep_alive

}
