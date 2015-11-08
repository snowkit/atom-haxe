/**
	Represents a gutter within a {TextEditor}.
**/
package atom;
@:jsRequire("atom", "Gutter") extern class Gutter {
	/**
		Destroys the gutter. 
	**/
	function destroy():Dynamic;
	/**
		Calls your `callback` when the gutter's visibility changes.
	**/
	function onDidChangeVisible(callback:Dynamic -> Dynamic):atom.Disposable;
	/**
		Calls your `callback` when the gutter is destroyed.
	**/
	function onDidDestroy(callback:haxe.Constraints.Function):atom.Disposable;
	/**
		Hide the gutter. 
	**/
	function hide():Dynamic;
	/**
		Show the gutter. 
	**/
	function show():Dynamic;
	/**
		Determine whether the gutter is visible.
	**/
	function isVisible():Bool;
	/**
		Add a decoration that tracks a {Marker}. When the marker moves,
		is invalidated, or is destroyed, the decoration will be updated to reflect
		the marker's state.
	**/
	function decorateMarker(marker:atom.Marker, decorationParams:{ var class_ : Dynamic; @:optional
	var onlyHead : Dynamic; @:optional
	var onlyEmpty : Dynamic; @:optional
	var onlyNonEmpty : Dynamic; }):atom.Decoration;
}