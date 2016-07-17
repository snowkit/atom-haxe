package utils;

import atom.Atom.atom;
import atom.Panel;

import utils.Promise;

import npm.SelectListView as BaseListView;

class SelectList {

    public static function display<T>(items:Array<T>):Promise<T> {

        return new Promise<T>(function(resolve, reject) {

            var list_view = new SelectListView<T>(items, resolve, reject);
            var panel = atom.workspace.addModalPanel({item: list_view});
            list_view.panel = panel;
            list_view.storeFocusedElement();
            list_view.focusFilterEditor();

        }); //Promise

    }

}

private class SelectListView<T> extends BaseListView<T> {

    public var items:Array<T>;

    public var panel:Panel;

    var resolve:T->Void;

    var reject:String->Void;

    public function new(items:Array<T>, resolve:T->Void, reject:String->Void) {

        this.items = items;
        this.resolve = resolve;
        this.reject = reject;

        super();

        setItems(items);

    } //new

    override function viewForItem(item_:T):Dynamic {
        var item:Dynamic = item_;
        if (Std.is(item, String)) {
            return '<li>' + item + '</li>';
        }
        else {
            if (item.title != null) {
                if (item.subtitle != null) {
                    return '<li class="two-lines">'
                        + '<div class="primary-line">' + item.title + '</div>'
                        + '<div class="secondary-line">' + item.subtitle + '</div>'
                        + '</li>';
                } else {
                    return '<li>' + item.title + '</li>';
                }
            } else {
                return '<li>' + item + '</li>';
            }
        }

    } //viewForItem

    override function confirmed(item:T):Void {

        resolve(item);

        cancel();

    } //confirmed

    override function cancelled():Void {

        reject('Selection was cancelled');

        panel.hide();

    } //cancelled

} //SelectListView
