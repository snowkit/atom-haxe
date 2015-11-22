package support;

    /** IDE-Support plugin entry point */
class Support {

    public static var state:SupportState = null;

    public static function init(?serialized_state:Dynamic):Void {
        state = new SupportState(serialized_state);
    }

    public static function dispose():Void {
        state.destroy();
        state = null;
    }

}
