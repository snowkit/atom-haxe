
import platform.Log;

/**
 Haxe Dev Worker (inside a child process)
 This is the entry point to execute code in background
 without blocking the UI thread.
 */
class HaxeDevBackground {

    private static var process:js.node.Process = untyped __js__('process');

    public static function main():Void {
            // Start worker
        Log.debug('Starting HaxeDev worker...');
            // Init state
        context.State.init();
    }

}
