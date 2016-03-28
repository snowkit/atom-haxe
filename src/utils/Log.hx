package utils;

import js.node.Buffer;
import js.node.Process;
import js.Error;

import js.Node.console;
import js.Node.process;

import utils.BackgroundProcess;

#if !background
import utils.MessagePanel;
import atom.Atom.atom;
#end

typedef LogOptions = {
        /** Display in message panel (default: false) */
    @:optional var display:Bool;
        /** Clear message panel (default: false) */
    @:optional var clear:Bool;
}

    /** Debug logging utility.
        Handles routing messages from a child process
        to its parent process if needed. */
class Log {

#if background

        /** Log a debug message */
    inline public static function debug(data:Dynamic):Void {

        process.send({kind: ChildProcessMessageKind.LOG_DEBUG, data: data});

    } //debug

        /** Log an info message */
    inline public static function info(data:Dynamic, ?options:LogOptions):Void {

        var info = {kind: ChildProcessMessageKind.LOG_INFO, data: data};
        if (options != null) info.options = options;
        process.send(info);

    } //info

        /** Log a success message */
    inline public static function success(data:Dynamic, ?options:LogOptions):Void {

        var info = {kind: ChildProcessMessageKind.LOG_SUCCESS, data: data};
        if (options != null) info.options = options;
        process.send(info);

    } //success

        /** Log a warning message */
    inline public static function warn(data:Dynamic, ?options:LogOptions):Void {

        var info = {kind: ChildProcessMessageKind.LOG_WARN, data: data};
        if (options != null) info.options = options;
        process.send(info);

    } //warn

        /** Log an error message */
    inline public static function error(data:Dynamic, ?options:LogOptions):Void {

        var info = {kind: ChildProcessMessageKind.LOG_ERROR, data: data};
        if (options != null) info.options = options;
        process.send(info);

    } //error

#else

        /** Log a debug message */
    inline public static function debug(data:Dynamic):Void {

        console.log(format(data));

    } //debug

        /** Log an info message */
    inline public static function info(data:Dynamic, ?options:LogOptions):Void {

        data = format(data);
        untyped console.log(data);
        if (options != null) {
            if (options.clear) MessagePanel.clear();
            if (options.display) MessagePanel.message(INFO, data);
        }

    } //info

        /** Log a success message */
    inline public static function success(data:Dynamic, ?options:LogOptions):Void {
            // Appears with blue color on chrome console
            // Let's just use it to differenciate it
        data = format(data);
        untyped console.debug(data);
        if (options != null) {
            if (options.clear) MessagePanel.clear();
            if (options.display) MessagePanel.message(SUCCESS, data);
        }

    } //success

        /** Log a warning message */
    inline public static function warn(data:Dynamic, ?options:LogOptions):Void {

        data = format(data);
        console.warn(data);
        if (options != null) {
            if (options.clear) MessagePanel.clear();
            if (options.display) MessagePanel.message(WARN, data);
        }

    } //warn

        /** Log an error message */
    inline public static function error(data:Dynamic, ?options:LogOptions):Void {

        data = format(data);
        console.error(data);
        if (options != null) {
            if (options.clear) MessagePanel.clear();
            if (options.display) MessagePanel.message(ERROR, data);
        }

    } //error

#end

        /** Sanitize the input for proper display in logs */
    private static function format(data:Dynamic):Dynamic {

        if (Std.is(data, Buffer)) data = Std.string(data);
        return data;

    } //format

}
