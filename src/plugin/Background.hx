package plugin;

import platform.Log;

    /** Entry point for background process. */
class Background {

    public static var workers:Workers = null;

    public static function init(?serialized_state:Dynamic):Void {
            // Start background worker
        Log.debug('Starting background worker...');

        workers = new Workers();

    } //init

    public static function dispose():Void {

        workers.destroy();
        workers = null;

    } //dispose

}
