package platform.atom;

import js.node.Buffer;
import js.node.Process;
import js.Error;

import platform.atom.ChildProcess;

typedef Console = {
    log: Dynamic->Void,
    debug: Dynamic->Void,
    warn: Dynamic->Void,
    error: Dynamic->Void
}

/**
 Debug logging utility that handles routing messages
 from a child process to its parent process.
 */
class Log {

    private static var console:Console = untyped __js__('console');
    private static var process:Process = untyped __js__('process');

#if worker

    inline public static function debug(data:Dynamic):Void {
        process.send({kind: ChildProcessMessageKind.LOG_DEBUG, data: data});
    }

    inline public static function info(data:Dynamic):Void {
        process.send({kind: ChildProcessMessageKind.LOG_INFO, data: data});
    }

    inline public static function warn(data:Dynamic):Void {
        process.send({kind: ChildProcessMessageKind.LOG_WARN, data: data});
    }

    inline public static function error(data:Dynamic):Void {
        process.send({kind: ChildProcessMessageKind.LOG_ERROR, data: data});
    }

#else

    inline public static function debug(data:Dynamic):Void {
        console.debug(format(data));
    }

    inline public static function info(data:Dynamic):Void {
        console.log(format(data));
    }

    inline public static function warn(data:Dynamic):Void {
        console.warn(format(data));
    }

    inline public static function error(data:Dynamic):Void {
        console.error(format(data));
    }

#end

    private static function format(data:Dynamic):Dynamic {
        if (Std.is(data, Buffer)) data = Std.string(data);
        return data;
    }

}
