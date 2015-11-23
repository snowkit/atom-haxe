package plugin;

import plugin.HaxeService;

import platform.Log;

import support.Support;

    /** Atom-specific plugin state */
class PluginState {

    public var consumer(default,set):HaxeServiceConsumer;

    @:allow(plugin.Plugin)
    private function new(?serialized_state:Dynamic) {

        if (serialized_state != null) {
            unserialize(serialized_state);
        }

    } //new

        /** Serialize */
    public function serialize():Dynamic {
            // Put all values we want to keep in the mapping
        var values:Dynamic = {};
        if (consumer != null) {
                // These are the only consumer serialized values.
                // Letting us restoring the default consumer.
                // It is the responsibility of any external consumer
                // To assign itself again on reactivation with additional values
            values.consumer = {
                name: consumer.name,
                hxml_cwd: consumer.hxml_cwd,
                hxml_content: consumer.hxml_content,
                hxml_file: consumer.hxml_file
            };
        }
        return values;

    } //serialize

        /** Unserialize */
    public function unserialize(values:Dynamic):Void {
            // Update all values on the target state (this)
        if (values.consumer != null && values.consumer.name == 'default') {
                // Reset consumer to default if it was using it before serialization
            consumer = values.consumer;
            Log.success("Active HXML file restored to " + consumer.hxml_file);
        }

    } //unserialize

    private function set_consumer(consumer:HaxeServiceConsumer):HaxeServiceConsumer {

        this.consumer = consumer;

            // Update state from consumer
        Support.state.update_hxml_context({
            hxml_content: consumer.hxml_content,
            hxml_cwd: consumer.hxml_cwd
        });

        return consumer;

    } //set_consumer

    @:allow(plugin.Plugin)
    private function destroy():Void {}

}
