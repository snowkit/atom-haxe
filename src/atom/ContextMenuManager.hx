/**
	Provides a registry for commands that you'd like to appear in the
	context menu.
**/
package atom;
@:jsRequire("atom", "ContextMenuManager") extern class ContextMenuManager {
	/**
		Add context menu items scoped by CSS selectors.
	**/
	function add(itemsBySelector:{ var label : String; var command : String; var enabled : Bool; var submenu : Array<Dynamic>; var type : Dynamic; var visible : Bool; var created : Dynamic -> Dynamic; var shouldDisplay : Dynamic -> Dynamic; }):atom.Disposable;
}