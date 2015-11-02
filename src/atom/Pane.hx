/**
	A container for presenting content in the center of the workspace.
	Panes can contain multiple items, one of which is *active* at a given time.
	The view corresponding to the active item is displayed in the interface. In
	the default configuration, tabs are also displayed for each item. 
**/
package atom;
@:jsRequire("atom", "Pane") extern class Pane {
	/**
		Invoke the given callback when the pane resizes
	**/
	function onDidChangeFlexScale(callback:Float -> Dynamic):atom.Disposable;
	/**
		Invoke the given callback with the current and future values of
		{::getFlexScale}.
	**/
	function observeFlexScale(callback:Float -> Dynamic):atom.Disposable;
	/**
		Invoke the given callback when the pane is activated.
	**/
	function onDidActivate(callback:haxe.Constraints.Function):atom.Disposable;
	/**
		Invoke the given callback before the pane is destroyed.
	**/
	function onWillDestroy(callback:haxe.Constraints.Function):atom.Disposable;
	/**
		Invoke the given callback when the pane is destroyed.
	**/
	function onDidDestroy(callback:haxe.Constraints.Function):atom.Disposable;
	/**
		Invoke the given callback when the value of the {::isActive}
		property changes.
	**/
	function onDidChangeActive(callback:Bool -> Dynamic):atom.Disposable;
	/**
		Invoke the given callback with the current and future values of the
		{::isActive} property.
	**/
	function observeActive(callback:Bool -> Dynamic):atom.Disposable;
	/**
		Invoke the given callback when an item is added to the pane.
	**/
	function onDidAddItem(callback:{ var item : Dynamic; var index : Float; } -> Dynamic):atom.Disposable;
	/**
		Invoke the given callback when an item is removed from the pane.
	**/
	function onDidRemoveItem(callback:{ var item : Dynamic; var index : Float; } -> Dynamic):atom.Disposable;
	/**
		Invoke the given callback before an item is removed from the pane.
	**/
	function onWillRemoveItem(callback:{ var item : Dynamic; var index : Float; } -> Dynamic):Dynamic;
	/**
		Invoke the given callback when an item is moved within the pane.
	**/
	function onDidMoveItem(callback:{ var item : Dynamic; var oldIndex : Float; var newIndex : Float; } -> Dynamic):atom.Disposable;
	/**
		Invoke the given callback with all current and future items.
	**/
	function observeItems(callback:Dynamic -> Dynamic):atom.Disposable;
	/**
		Invoke the given callback when the value of {::getActiveItem}
		changes.
	**/
	function onDidChangeActiveItem(callback:Dynamic -> Dynamic):atom.Disposable;
	/**
		Invoke the given callback with the current and future values of
		{::getActiveItem}.
	**/
	function observeActiveItem(callback:Dynamic -> Dynamic):atom.Disposable;
	/**
		Invoke the given callback before items are destroyed.
	**/
	function onWillDestroyItem(callback:{ var item : Dynamic; var index : Dynamic; } -> Dynamic):atom.Disposable;
	/**
		Get the items in this pane.
	**/
	function getItems():Array<Dynamic>;
	/**
		Get the active pane item in this pane.
	**/
	function getActiveItem():Dynamic;
	/**
		Return the item at the given index.
	**/
	function itemAtIndex(index:Float):Dynamic;
	/**
		Makes the next item active. 
	**/
	function activateNextItem():Dynamic;
	/**
		Makes the previous item active. 
	**/
	function activatePreviousItem():Dynamic;
	/**
		Move the active tab to the right. 
	**/
	function moveItemRight():Dynamic;
	/**
		Move the active tab to the left 
	**/
	function moveItemLeft():Dynamic;
	/**
		Get the index of the active item.
	**/
	function getActiveItemIndex():Float;
	/**
		Activate the item at the given index.
	**/
	function activateItemAtIndex(index:Float):Dynamic;
	/**
		Make the given item *active*, causing it to be displayed by
		the pane's view. 
	**/
	function activateItem():Dynamic;
	/**
		Add the given item to the pane.
	**/
	function addItem(item:Dynamic, index:Float):Dynamic;
	/**
		Add the given items to the pane.
	**/
	function addItems(items:Array<Dynamic>, index:Float):Array<Dynamic>;
	/**
		Move the given item to the given index.
	**/
	function moveItem(item:Dynamic, index:Float):Dynamic;
	/**
		Move the given item to the given index on another pane.
	**/
	function moveItemToPane(item:Dynamic, pane:atom.Pane, index:Float):Dynamic;
	/**
		Destroy the active item and activate the next item. 
	**/
	function destroyActiveItem():Dynamic;
	/**
		Destroy the given item.
	**/
	function destroyItem(item:Dynamic):Dynamic;
	/**
		Destroy all items. 
	**/
	function destroyItems():Dynamic;
	/**
		Destroy all items except for the active item. 
	**/
	function destroyInactiveItems():Dynamic;
	/**
		Save the active item. 
	**/
	function saveActiveItem():Dynamic;
	/**
		Prompt the user for a location and save the active item with the
		path they select.
	**/
	function saveActiveItemAs(nextAction:haxe.Constraints.Function):Dynamic;
	/**
		Save the given item.
	**/
	function saveItem(item:Dynamic, nextAction:haxe.Constraints.Function):Dynamic;
	/**
		Prompt the user for a location and save the active item with the
		path they select.
	**/
	function saveItemAs(item:Dynamic, nextAction:haxe.Constraints.Function):Dynamic;
	/**
		Save all items. 
	**/
	function saveItems():Dynamic;
	/**
		Return the first item that matches the given URI or undefined if
		none exists.
	**/
	function itemForURI(uri:String):Dynamic;
	/**
		Activate the first item that matches the given URI.
	**/
	function activateItemForURI(uri:String):Bool;
	/**
		Determine whether the pane is active.
	**/
	function isActive():Bool;
	/**
		Makes this pane the *active* pane, causing it to gain focus. 
	**/
	function activate():Dynamic;
	/**
		Close the pane and destroy all its items.
	**/
	function destroy():Dynamic;
	/**
		Create a new pane to the left of this pane.
	**/
	function splitLeft(params:{ @:optional
	var items : Array<Dynamic>; @:optional
	var copyActiveItem : Bool; }):atom.Pane;
	/**
		Create a new pane to the right of this pane.
	**/
	function splitRight(params:{ @:optional
	var items : Array<Dynamic>; @:optional
	var copyActiveItem : Bool; }):atom.Pane;
	/**
		Creates a new pane above the receiver.
	**/
	function splitUp(params:{ @:optional
	var items : Array<Dynamic>; @:optional
	var copyActiveItem : Bool; }):atom.Pane;
	/**
		Creates a new pane below the receiver.
	**/
	function splitDown(params:{ @:optional
	var items : Array<Dynamic>; @:optional
	var copyActiveItem : Bool; }):atom.Pane;
}