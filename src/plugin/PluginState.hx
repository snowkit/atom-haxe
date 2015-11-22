package plugin;

import plugin.HaxeService;

import support.Support;

class PluginState {

    public var consumer(default,set):HaxeServiceConsumer;

    @:allow(plugin.Plugin)
    private function new(?serialized_state:Dynamic) {
        if (serialized_state != null) {
            unserialize(serialized_state);
        }
    }

        /** Serialize */
    public function serialize():Dynamic {
            // Put all values we want to keep in the mapping
        var values:Dynamic = {};
        return values;
    }

        /** Unserialize */
    public function unserialize(values:Dynamic):Void {
            // Update all values on the target state (this)
    }

    private function set_consumer(consumer:HaxeServiceConsumer):HaxeServiceConsumer {
        this.consumer = consumer;

            // Update state from consumer
        Support.state.update_hxml_context({
            hxml_content: consumer.hxml_content,
            hxml_cwd: consumer.hxml_cwd
        });

        return consumer;
    }

    @:allow(plugin.Plugin)
    private function destroy():Void {}

}
