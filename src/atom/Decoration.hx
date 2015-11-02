/**
	Represents a decoration that follows a {Marker}. A decoration is
	basically a visual representation of a marker. It allows you to add CSS
	classes to line numbers in the gutter, lines, and add selection-line regions
	around marked ranges of text.
**/
package atom;
@:jsRequire("atom", "Decoration") extern class Decoration {
	/**
		Destroy this marker.
	**/
	function destroy():Dynamic;
	/**
		When the {Decoration} is updated via {Decoration::update}.
	**/
	function onDidChangeProperties(callback:{ var oldProperties : Dynamic<Dynamic>; var newProperties : Dynamic<Dynamic>; } -> Dynamic):atom.Disposable;
	/**
		Invoke the given callback when the {Decoration} is destroyed
	**/
	function onDidDestroy(callback:haxe.Constraints.Function):atom.Disposable;
	/**
		An id unique across all {Decoration} objects 
	**/
	function getId():Dynamic;
	function getMarker():atom.Decoration;
	function getProperties():atom.Decoration;
	/**
		Update the marker with new Properties. Allows you to change the decoration's class.
	**/
	function setProperties(newProperties:Dynamic<Dynamic>):Dynamic;
}