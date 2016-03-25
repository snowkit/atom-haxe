package npm;

@:enum abstract MessagePanelViewPosition(String) {
    var TOP = "top";
    var BOTTOM = "bottom";
}

typedef MessagePanelViewParams = {
        /** The title of the panel */
    var title:String;
        /** Set to `true` will allow the title to contain HTML (default is false) */
    @:optional var rawTitle:Bool;
        /** What should the close button do? `detach` (default) or `hide` */
    @:optional var closeMethod:String;
        /** How fast the fold/unfold function should run (default is `fast`) */
    @:optional var speed:Dynamic;
        /** Should new messages be added at the top? (default is `false`) */
    @:optional var recentMessagesAtTop:Bool;
        /** Should the panel attach to the `top` or the `bottom` (default is `bottom`) */
    @:optional var position:MessagePanelViewPosition;
        /** Set a max-height of the panel body (default is `170px`) */
    @:optional var maxHeight:String;
}

/** The main view to display messages in a panel */
@:jsRequire("atom-message-panel", "MessagePanelView")
extern class MessagePanelView {

    function new(params:MessagePanelViewParams);

        /** Append the panel to the Atom view */
    function attach():Void;

        /** Closes the panel */
    function close():Void;

        /** Change the panel title */
    function setTitle(title:String, ?raw:Bool):Void;

        /** Fold/unfold the panel */
    function toggle():Void;

        /** Clear the body */
    function clear():Void;

        /** Add a view to the panel */
    function add(view:Dynamic):Void;

}
