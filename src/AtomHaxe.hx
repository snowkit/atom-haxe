
import js.Node.module;

    /** Public API exposed to Atom. */
class AtomHaxe {

    private static var failed:Bool = false;

    public static function main():Void {
            // We don't use haxe's built-in @:expose() because we want to expose
            // the whole class as a single module (with its own context)
        module.exports = cast AtomHaxe;

    } //main

    public static function activate(serialized_state:Dynamic):Void {
            // Init internal modules

    } //activate

    public static function deactivate(state:Dynamic):Void {
            // Dispose internal modules

    } //deactivate

    public static function serialize():Dynamic {

        if (!failed) return {
            //
        };
        return null;

    } //serialize

}
