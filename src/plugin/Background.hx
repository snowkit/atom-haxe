package plugin;

    /** Entry point for background process. */
class Background {

    public static var workers:Workers = null;

    public static function init(?serialized_state:Dynamic):Void {
        workers = new Workers();
    }

    public static function dispose():Void {
        workers.destroy();
        workers = null;
    }

}
