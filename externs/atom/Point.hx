/**
	Represents a point in a buffer in row/column coordinates.
**/
package atom;
@:jsRequire("atom", "Point") extern class Point {
	/**
		A zero-indexed {Number} representing the row of the {Point}. 
	**/
	var row : Float;
	/**
		A zero-indexed {Number} representing the column of the {Point}. 
	**/
	var column : Float;
	/**
		Convert any point-compatible object to a {Point}.
	**/
	static function fromObject(object:atom.Point, copy:Dynamic):atom.Point;
	static function min(point1:atom.Point, point2:atom.Point):atom.Point;
	/**
		Construct a {Point} object
	**/
	function new(row:Float, column:Float):Void;
	function copy():atom.Point;
	function negate():atom.Point;
	/**
		Makes this point immutable and returns itself.
	**/
	function freeze():atom.Point;
	/**
		Build and return a new point by adding the rows and columns of
		the given point.
	**/
	function translate(other:atom.Point):atom.Point;
	/**
		Build and return a new {Point} by traversing the rows and columns
		specified by the given point.
	**/
	function traverse(other:atom.Point):atom.Point;
	function compare(other:atom.Point):Dynamic;
	function isEqual(other:atom.Point):Bool;
	function isLessThan(other:atom.Point):Bool;
	function isLessThanOrEqual(other:atom.Point):Bool;
	function isGreaterThan(other:atom.Point):Bool;
	function isGreaterThanOrEqual(other:atom.Point):Bool;
	function toArray():Dynamic;
	function serialize():Dynamic;
	function toString():Dynamic;
}