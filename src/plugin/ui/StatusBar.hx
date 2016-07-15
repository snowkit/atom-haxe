package plugin.ui;

import atom.Atom.atom;
import atom.Disposable;

import plugin.Plugin.state;

import js.Browser.document;
import js.html.AnchorElement;
import js.html.DivElement;

using StringTools;

typedef AtomStatusBar = {

    function addLeftTile(options:{item:Dynamic, priority:Int}):Void;

    function addRightTile(options:{item:Dynamic, priority:Int}):Void;

} //AtomStatusBar

class StatusBar {

    public static var atom_status_bar:AtomStatusBar;

    static var element:AnchorElement;

    static var container:DivElement;

    static var tooltip:Disposable;

    public static function update():Void {

        if (atom_status_bar == null) return;

        if (state != null && state.is_valid()) {
            show();
            if (tooltip != null) tooltip.dispose();

            if (state.hxml.file != null) {
                tooltip = atom.tooltips.add(element, {title: state.hxml.file});
                element.textContent = state.hxml.file.substring(state.hxml.file.replace('\\', '/').lastIndexOf('/') + 1);
            }
            else {
                element.textContent = '';
            }
        }
        else {
            hide();
        }

    } //update

    static function show():Void {

        if (element == null) {

            element = document.createAnchorElement();
            element.id = 'status-bar-haxe';
            element.href = '#';
            element.textContent = '';
            element.addEventListener('click', function(e) {

                // TODO

                element.blur(); // To prevent any color change
                e.preventDefault();
                return false;
            });

            container = document.createDivElement();
            container.className = 'inline-block';
            container.appendChild(element);

            atom_status_bar.addLeftTile({item: container, priority: 100});
        }
        else {

            element.className = '';
        }

    } //show

    static function hide():Void {
        
        if (tooltip != null) {
            tooltip.dispose();
            tooltip = null;
        }

        if (element != null) {
            element.className = 'hidden';
            element.textContent = '';
        }

    } //hide

} //StatusBar
