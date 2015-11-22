
import js.Node.module;

import support.Support;
import plugin.Plugin;

/**
 Public API exposed to Atom.
 */
class HaxeDevMain {

    private static var failed:Bool = false;

    public static function main():Void {
            // We don't use haxe's built-in @:expose() because we want to expose
            // the whole class as a single module (with its own context)
        module.exports = cast HaxeDevMain;
    }

    public static function activate(serialized_state:Dynamic):Void {

            // Init internal modules
        Support.init(serialized_state != null ? serialized_state.support : null);
        Plugin.init(serialized_state != null ? serialized_state.plugin : null);
    }

    public static function deactivate(state:Dynamic):Void {
            // Dispose internal modules
        Plugin.dispose();
        Support.dispose();
    }

    public static function serialize():Dynamic {
        if (!failed) return {
            plugin: Plugin.state.serialize(),
            support: Support.state.serialize()
        };
        return null;
    }

}
