package context;

import context.State.state;

typedef HaxeServiceConsumer = {
        /** The name of the consumer */
    var name:String;
        /** Populate this with the hxml content for your project */
    var hxml_content:String;
        /** The current working directory for the hxml content */
    var hxml_cwd:String;
        /** If provided, and if using the default build,
            will be used as argument to build the haxe project.
            The default hxml consumer is providing it. */
    @:optional var hxml_file:String;
        /** If provided, will be called when haxe service stopped using
            this consumer (and probably switched to another consumer) */
    @:optional function on_dispose():Void;
        /** If provided, will be called when build is triggered by the user
            instead of triggering the default hxml.
            The `selected_file_path` allows the build command to
            be ignored if it doesn't match its file pattern. */
    @:optional function on_run_build(selected_file_path:String):Void;
}

class HaxeService {

    public static function set_consumer(consumer:HaxeServiceConsumer):Void {
        state.consumer = consumer;
    }

}
