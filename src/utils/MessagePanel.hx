package utils;

import npm.MessagePanelView;
import npm.PlainMessageView;

import utils.HTML;

@:enum abstract PanelMessageKind(Int) {
    var INFO = 1;
    var SUCCESS = 2;
    var WARN = 3;
    var ERROR = 4;
}

    /** Shared message panel to display logs */
class MessagePanel {

    private static var view:MessagePanelView;

    private static var timeout_id:js.Node.TimeoutObject = null;

    public static var visible(get,null):Bool = false;
    private static inline function get_visible():Bool { return visible; }

    public static var sticky(default,set):Bool = false;
    private static function set_sticky(value:Bool):Bool {

        sticky = value;

        if (sticky && timeout_id != null) {
                // Disable hiding after some delay
            js.Node.clearTimeout(timeout_id);
            timeout_id = null;
        }
        else if (!sticky && timeout_id == null) {
                // Hide after some delay when not
                // sticky anymore
            delay_hide();
        }

        return sticky;

    } //set_sticky

    public static function init():Void {

        view = new MessagePanelView({
            title: 'Haxe',
            closeMethod: 'custom_close'
        });

    } //init

    public static function show():Void {

        if (!visible) {

            visible = true;
            view.attach();

                // Ensure visible flag is updated when closing
                // with the X icon
            untyped view.panel.custom_close = function() {
                view.panel.hide();
                hide();
            };

                // Hide the panel after some delay (unless sticky)
            if (timeout_id != null) {
                js.Node.clearTimeout(timeout_id);
                timeout_id = null;
            }
            if (!sticky) {
                delay_hide();
            }

        }

    } //show

    public static function hide():Void {

        if (visible) {
            visible = false;
            sticky = false;
            view.close();
        }

    } //hide

    public static function clear():Void {

        view.clear();

    } //clear

    public static function toggle():Void {

        if (visible) hide();
        else show();

    } //toggle

        /** Log a visible message on the panel.
            Will handle the parsing of ANSI colors and links to source file or url. (TODO) */
    public static function message(kind:PanelMessageKind, content:String):Void {
            // Escape HTML
        content = HTML.escape(content);
            // Set CSS class from message kind
        var class_name:String = null;
        if (kind == SUCCESS) class_name = 'text-success';
        else if (kind == ERROR) class_name = 'text-error';
        else if (kind == INFO) class_name = 'text-highlight';
        else if (kind == WARN) class_name = 'text-warning';
            // Add message
        view.add(new PlainMessageView({ message: content, raw: true, className: class_name }));
            // Scroll to top
        untyped view.body.scrollTop(1e10);
            // Display panel
        show();

    } //message

    private static function delay_hide():Void {

        var delay = 5000; // TODO make configurable

            // Reset any existing delayed hide
        if (timeout_id != null) {
            js.Node.clearTimeout(timeout_id);
            timeout_id = null;
        }

        timeout_id = js.Node.setTimeout(function() {
            timeout_id = null;
            hide();
        }, delay);

    } //delay_hide

}
