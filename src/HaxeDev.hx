
import atom.Atom;
import atom.Panel;
import atom.CompositeDisposable;
import js.Node.module;
import js.Browser.console;

import utils.HaxeParsingUtils;

/**
 Public API exposed to Atom.
 */
class HaxeDev {

    private static var modalPanel: Panel = null;
    private static var subscriptions: CompositeDisposable = null;

    public static function main():Void {
            // We don't use haxe's built-in @:expose() because we want to expose
            // the whole class as a single module (with its own context)
        module.exports = cast HaxeDev;
    }

    public static function activate(state:Dynamic):Void {
            // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        subscriptions = new CompositeDisposable();

            // Register command that toggles this view
        subscriptions.add(Atom.commands.add('atom-workspace', {'haxe-dev:toggle': toggle}));
    }

    public static function deactivate(state:Dynamic):Void {
        modalPanel.destroy();
        subscriptions.dispose();
    }

    public static function serialize():Dynamic {
        return {};
    }

    public static function toggle():Void {
        console.log('HaxeDev was toggled!');

        if (modalPanel.isVisible()) {
            modalPanel.hide();
        }
        else {
            modalPanel.show();
        }
    }

}
