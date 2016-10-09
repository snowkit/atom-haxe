package completion;

import js.html.DivElement;
import js.Browser.document;

import atom.Atom.atom;
import atom.TextEditor;
import atom.Decoration;
import atom.Range;
import atom.Point;

import utils.Log;

    /** Provide (type) hints next to the cursor position, if relevant.
        Depends on atom. */
class HintProvider {

    var fetcher:HintFetcher = null;

    var view:DivElement;

    var marker:Dynamic;

    var overlay_decoration:Decoration;

    var editor:TextEditor;

    var did_bind_view:Bool = false;

    public var html(get, set):String;

    public function new(editor:TextEditor) {

        this.editor = editor;
        view = document.createDivElement();
        view.className = 'haxe-hint';

    } //new

    public function update():Void {

        if (!did_bind_view) {

            bind_view();
        }

        if (editor.getLastCursor != null) {

            var cursor = editor.getLastCursor();
            if (cursor == null) return;

            var buffer_pos = cursor.getBufferPosition();
            var text_before_cursor = editor.getTextInBufferRange(new Range(new Point(0,0), buffer_pos));
            var text = editor.getText();
            var index = text_before_cursor.length;

            var previous_fetcher = fetcher;
            fetcher = new HintFetcher({
                file_path: editor.getBuffer().file.path,
                file_content: text,
                cursor_index: index
            });

            if (!fetcher.can_use_previous_fetcher(previous_fetcher)) {
                    // If we know the contextes are too different,
                    // Clear hint right away.
                html = null;
            }

            fetcher.fetch(previous_fetcher).then(function(context:HintFetcher) {

                Log.success('Hint: ' + context.hint);
                html = context.hint;

            }).catchError(function(error) {

                Log.warn(error);
                html = null;

            }); //fetch
        }

    } //set_position

    function bind_view():Void {
        did_bind_view = true;

            // View
        html = null;
        atom.views.getView(atom.workspace).appendChild(view);

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
