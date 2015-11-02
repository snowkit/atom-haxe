/**
	Represents a region in a buffer in row/column coordinates.
**/
package atom;
@:jsRequire("atom", "Range") extern class Range {
	/**
		A {Point} representing the start of the {Range}. 
	**/
	var start : atom.Point;
	/**
		A {Point} representing the end of the {Range}. 
	**/
	var end : atom.Point;
	/**
		Convert any range-compatible object to a {Range}.
	**/
	static function fromObject(object:atom.Range, copy:Dynamic):atom.Range;
	/**
		Call this with the result of {Range::serialize} to construct a new Range.
	**/
	static function deserialize(array:Array<Dynamic>):Dynamic;
	/**
		Construct a {Range} object
	**/
	function new(pointA:atom.Point, pointB:atom.Point):Void;
	function copy():Dynamic;
	function negate():Dynamic;
	function serialize():Dynamic;
	/**
		Is the start position of this range equal to the end position?
	**/
	function isEmpty():Bool;
	function isSingleLine():Bool;
	/**
		Get the number of rows in this range.
	**/
	function getRowCount():Float;
	function getRows():Dynamic;
	/**
		Freezes the range and its start and end point so it becomes
		immutable and returns itself.
	**/
	function freeze():atom.Range;
	function union(otherRange:atom.Range):Dynamic;
	/**
		Build and return a new range by translating this range's start and
		end points by the given delta(s).
	**/
	function translate(startDelta:atom.Point, endDelta:atom.Point):atom.Range;
	/**
		Build and return a new range by traversing this range's start and
		end points by the given delta.
	**/
	function traverse(delta:atom.Point):atom.Range;
	/**
		Compare two Ranges
	**/
	function compare(otherRange:atom.Range):Dynamic;
	function isEqual(otherRange:atom.Range):Bool;
	function coversSameRows(otherRange:atom.Range):Bool;
	/**
		Determines whether this range intersects with the argument.
	**/
	function intersectsWith(otherRange:atom.Range, exclusive:Bool):Bool;
	function containsRange(otherRange:atom.Range, exclusive:Dynamic):Bool;
	function containsPoint(point:atom.Point, exclusive:Dynamic):Bool;
	function intersectsRow(row:Float):Bool;
	function intersectsRowRange(startRow:Float, endRow:Float):Bool;
	function toString():Dynamic;
}