package npm;

typedef PlainMessageViewParams = {
        /** The message to display */
    var message:String;
        /** `true` will allow the message to contain HTML (default is `false`) */
    @:optional var raw:Bool;
        /** Add a CSS class to your message (optional) */
    @:optional var className:String;
}

    /** Let's you add a simple message */
@:jsRequire("atom-message-panel", "PlainMessageView")
extern class PlainMessageView {

    function new(params:PlainMessageViewParams);

}
