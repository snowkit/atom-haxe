package support;

import platform.Log;

    /** IDE-Support plugin entry point */
class Support {

    public static var state:SupportState = null;

    public static function init(?serialized_state:Dynamic):Void {
        Log.debug('Starting HaxeDev support...');

        state = new SupportState(serialized_state);
    }

    public static function dispose():Void {
        state.destroy();
        state = null;
    }

}
