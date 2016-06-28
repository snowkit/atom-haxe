package completion;

import js.html.DivElement;
import js.Browser.document;

import atom.Atom.atom;
import atom.TextEditor;
import atom.Decoration;

    /** Provide (type) hints next to the cursor position, if relevant.
        Depends on atom. */
class HintProvider {

    var context:HintContext = null;

    var view:DivElement;

    var marker:Dynamic;

    var overlay_decoration:Decoration;

    var editor:TextEditor;

    public var html(get, set):String;

    public function new(editor:TextEditor) {

        this.editor = editor;
        view = document.createDivElement();

    } //new

    public function update():Void {

        if (view == null) {

            bind_view();
        }

        if (marker == null) {
            //
        }

    } //set_position

    function bind_view():Void {
            // View
        html = null;

            // Marker
        if (editor.getLastCursor != null && editor.getLastCursor() != null) {
            marker = editor.getLastCursor().getMarker();
        }

        if (marker == null) {
            return;
        }

        overlay_decoration = editor.decorateMarker(marker, untyped {
            type: 'overlay',
            item: view,
            'class': 'haxe-hint-container',
            position: 'after',
            invalidate: 'touch'
        });

        atom.views.getView(atom.workspace).appendChild(view);
    }

    function get_html():String {

        return view.innerHTML;

    } //get_html

    function set_html(html:String):String {

        if (html != null && html.length > 0) {
            view.innerHTML = html;
            view.style.display = 'block';
        }
        else {
            view.innerHTML = '';
            view.style.display = 'none';
        }
        
        return html;

    } //set_html

    public function destroy():Void {

        marker = null;

        if (overlay_decoration != null) {
            overlay_decoration.destroy();
            overlay_decoration = null;
        }

        if (view != null) {
            view.remove();
            view = null;
        }

    } //destroy

}
