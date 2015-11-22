package platform.atom;

import js.node.Buffer;
import js.node.Process;
import js.Error;

import js.Node.console;
import js.Node.process;

import platform.atom.ChildProcess;

#if !background
import platform.atom.MessagePanel;
#end

/**
 Debug logging utility.
 Handles routing messages from a child process
 to its parent process if needed.
 */
class Log {

#if background

    inline public static function debug(data:Dynamic):Void {
        process.send({kind: ChildProcessMessageKind.LOG_DEBUG, data: data});
    }

    inline public static function info(data:Dynamic, display:Bool = true):Void {
        process.send({kind: ChildProcessMessageKind.LOG_INFO, data: data, display: display});
    }

    inline public static function success(data:Dynamic, display:Bool = true):Void {
        process.send({kind: ChildProcessMessageKind.LOG_SUCCESS, data: data, display: display});
    }

    inline public static function warn(data:Dynamic, display:Bool = true):Void {
        process.send({kind: ChildProcessMessageKind.LOG_WARN, data: data, display: display});
    }

    inline public static function error(data:Dynamic, display:Bool = true):Void {
        process.send({kind: ChildProcessMessageKind.LOG_ERROR, data: data, display: display});
    }

#else

    inline public static function debug(data:Dynamic):Void {
        console.log(format(data));
    }

    inline public static function info(data:Dynamic, display:Bool = true):Void {
        untyped console.log(format(data));
        if (display) MessagePanel.message(INFO, data);
    }

    inline public static function success(data:Dynamic, display:Bool = true):Void {
            // Appears with blue color on chrome console
            // Let's just use it to differenciate it
        untyped console.debug(format(data));
        if (display) MessagePanel.message(SUCCESS, data);
    }

    inline public static function warn(data:Dynamic, display:Bool = true):Void {
        console.warn(format(data));
        if (display) MessagePanel.message(WARN, data);
    }

    inline public static function error(data:Dynamic, display:Bool = true):Void {
        console.error(format(data));
        if (display) MessagePanel.message(ERROR, data);
    }

#end

    private static function format(data:Dynamic):Dynamic {
        if (Std.is(data, Buffer)) data = Std.string(data);
        return data;
    }

}
