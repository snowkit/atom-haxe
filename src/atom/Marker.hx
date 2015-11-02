/**
	Represents a buffer annotation that remains logically stationary
	even as the buffer changes. This is used to represent cursors, folds, snippet
	targets, misspelled words, and anything else that needs to track a logical
	location in the buffer over time.
**/
package atom;
@:jsRequire("atom", "Marker") extern class Marker {
	/**
		Destroys the marker, causing it to emit the 'destroyed' event. Once
		destroyed, a marker cannot be restored by undo/redo operations. 
	**/
	function destroy():Dynamic;
	/**
		Creates and returns a new {Marker} with the same properties as
		this marker.
	**/
	function copy(properties:Dynamic<Dynamic>):atom.Marker;
	/**
		Invoke the given callback when the state of the marker changes.
	**/
	function onDidChange(callback:{ var oldHeadBufferPosition : atom.Point; var newHeadBufferPosition : atom.Point; var oldTailBufferPosition : atom.Point; var newTailBufferPosition : atom.Point; var oldHeadScreenPosition : atom.Point; var newHeadScreenPosition : atom.Point; var oldTailScreenPosition : atom.Point; var newTailScreenPosition : atom.Point; var wasValid : Bool; var isValid : Bool; var hadTail : Bool; var hasTail : Bool; var oldProperties : Dynamic<Dynamic>; var newProperties : Dynamic<Dynamic>; var textChanged : Bool; } -> Dynamic):atom.Disposable;
	/**
		Invoke the given callback when the marker is destroyed.
	**/
	function onDidDestroy(callback:haxe.Constraints.Function):atom.Disposable;
	function isValid():Bool;
	function isDestroyed():Bool;
	function isReversed():Bool;
	/**
		Get the invalidation strategy for this marker.
	**/
	function getInvalidationStrategy():String;
	function getProperties():Dynamic<Dynamic>;
	/**
		Merges an {Object} containing new properties into the marker's
		existing properties.
	**/
	function setProperties(properties:Dynamic<Dynamic>):Dynamic;
	function isEqual(other:atom.Marker):Bool;
	/**
		Compares this marker to another based on their ranges.
	**/
	function compare(other:atom.Marker):Float;
	/**
		Gets the buffer range of the display marker.
	**/
	function getBufferRange():atom.Range;
	/**
		Modifies the buffer range of the display marker.
	**/
	function setBufferRange(bufferRange:atom.Range, properties:{ var reversed : Bool; }):Dynamic;
	/**
		Gets the screen range of the display marker.
	**/
	function getScreenRange():atom.Range;
	/**
		Modifies the screen range of the display marker.
	**/
	function setScreenRange(screenRange:atom.Range, properties:{ var reversed : Bool; }):Dynamic;
	/**
		Retrieves the buffer position of the marker's start. This will always be
		less than or equal to the result of {Marker::getEndBufferPosition}.
	**/
	function getStartBufferPosition():atom.Point;
	/**
		Retrieves the screen position of the marker's start. This will always be
		less than or equal to the result of {Marker::getEndScreenPosition}.
	**/
	function getStartScreenPosition():atom.Point;
	/**
		Retrieves the buffer position of the marker's end. This will always be
		greater than or equal to the result of {Marker::getStartBufferPosition}.
	**/
	function getEndBufferPosition():atom.Point;
	/**
		Retrieves the screen position of the marker's end. This will always be
		greater than or equal to the result of {Marker::getStartScreenPosition}.
	**/
	function getEndScreenPosition():atom.Point;
	/**
		Retrieves the buffer position of the marker's head.
	**/
	function getHeadBufferPosition():atom.Point;
	/**
		Sets the buffer position of the marker's head.
	**/
	function setHeadBufferPosition(bufferPosition:atom.Point, properties:Dynamic<Dynamic>):Dynamic;
	/**
		Retrieves the screen position of the marker's head.
	**/
	function getHeadScreenPosition():atom.Point;
	/**
		Sets the screen position of the marker's head.
	**/
	function setHeadScreenPosition(screenPosition:atom.Point, properties:Dynamic<Dynamic>):Dynamic;
	/**
		Retrieves the buffer position of the marker's tail.
	**/
	function getTailBufferPosition():atom.Point;
	/**
		Sets the buffer position of the marker's tail.
	**/
	function setTailBufferPosition(bufferPosition:atom.Point, properties:Dynamic<Dynamic>):Dynamic;
	/**
		Retrieves the screen position of the marker's tail.
	**/
	function getTailScreenPosition():atom.Point;
	/**
		Sets the screen position of the marker's tail.
	**/
	function setTailScreenPosition(screenPosition:atom.Point, properties:Dynamic<Dynamic>):Dynamic;
	function hasTail():Bool;
	/**
		Plants the marker's tail at the current head position. After calling
		the marker's tail position will be its head position at the time of the
		call, regardless of where the marker's head is moved.
	**/
	function plantTail(properties:Dynamic<Dynamic>):Dynamic;
	/**
		Removes the marker's tail. After calling the marker's head position
		will be reported as its current tail position until the tail is planted
		again.
	**/
	function clearTail(properties:Dynamic<Dynamic>):Dynamic;
}