package support;

import utils.Worker;

import platform.Log;
import platform.Exec;

import utils.Promise;

typedef SupportStateHXMLContext = {
        /** Populate this with the hxml content for your project */
    var hxml_content:String;
        /** The current working directory for the hxml content */
    var hxml_cwd:String;
}

     /* Shared ide-support state
        Should not be imported directly.
        Use Plugin.state instead. */
class SupportState {

    public var hxml_content:String;

    public var hxml_file:String;

    public var hxml_cwd:String;

    @:allow(support.Support)
    private function new(?serialized_state:Dynamic) {
        if (serialized_state != null) {
            unserialize(serialized_state);
        }
    }

        /** Serialize */
    public function serialize():Dynamic {
            // Put all values we want to keep in the mapping
        var values:Dynamic = {};
        values.hxml_content = hxml_content;
        values.hxml_cwd = hxml_cwd;
        values.hxml_file = hxml_file;
        return values;
    }

        /** Unserialize */
    public function unserialize(values:Dynamic):Void {
            // Update all values on the target state (this)
        hxml_content = values.hxml_content;
        hxml_cwd = values.hxml_cwd;
        hxml_file = values.hxml_file;
    }

        /** Update */
    public function update_hxml_context(context:SupportStateHXMLContext):Void {
            // Update context
        hxml_content = context.hxml_content;
        hxml_cwd = context.hxml_cwd;

        reload_hxml_context();
    }

    private function reload_hxml_context():Void {
        //
    }

    @:allow(support.Support)
    private function destroy():Void {}

}
