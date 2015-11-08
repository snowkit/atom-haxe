/**
	A mutable text container with undo/redo support and the ability to
	annotate logical regions in the text. 
**/
package atom;
@:jsRequire("atom", "TextBuffer") extern class TextBuffer {
	/**
		Create a new buffer with the given params.
	**/
	function new(params:{ var load : Bool; var text : String; }):Void;
	/**
		Invoke the given callback synchronously _before_ the content of the
		buffer changes.
	**/
	function onWillChange(callback:{ var oldRange : atom.Range; var newRange : atom.Range; var oldText : String; var newText : String; } -> Dynamic):atom.Disposable;
	/**
		Invoke the given callback synchronously when the content of the
		buffer changes.
	**/
	function onDidChange(callback:{ var oldRange : atom.Range; var newRange : atom.Range; var oldText : String; var newText : String; } -> Dynamic):atom.Disposable;
	/**
		Invoke the given callback asynchronously following one or more
		changes after {::getStoppedChangingDelay} milliseconds elapse without an
		additional change.
	**/
	function onDidStopChanging(callback:haxe.Constraints.Function):atom.Disposable;
	/**
		Invoke the given callback when the in-memory contents of the
		buffer become in conflict with the contents of the file on disk.
	**/
	function onDidConflict(callback:haxe.Constraints.Function):atom.Disposable;
	/**
		Invoke the given callback the value of {::isModified} changes.
	**/
	function onDidChangeModified(callback:Bool -> Dynamic):atom.Disposable;
	/**
		Invoke the given callback when all marker `::onDidChange`
		observers have been notified following a change to the buffer.
	**/
	function onDidUpdateMarkers(callback:haxe.Constraints.Function):atom.Disposable;
	/**
		Invoke the given callback when a marker is created.
	**/
	function onDidCreateMarker(callback:atom.Marker -> Dynamic):atom.Disposable;
	/**
		Invoke the given callback when the value of {::getPath} changes.
	**/
	function onDidChangePath(callback:String -> Dynamic):atom.Disposable;
	/**
		Invoke the given callback when the value of {::getEncoding} changes.
	**/
	function onDidChangeEncoding(callback:String -> Dynamic):atom.Disposable;
	/**
		Invoke the given callback before the buffer is saved to disk.
	**/
	function onWillSave(callback:haxe.Constraints.Function):atom.Disposable;
	/**
		Invoke the given callback after the buffer is saved to disk.
	**/
	function onDidSave(callback:{ var path : Dynamic; } -> Dynamic):atom.Disposable;
	/**
		Invoke the given callback after the file backing the buffer is
		deleted.
	**/
	function onDidDelete(callback:haxe.Constraints.Function):atom.Disposable;
	/**
		Invoke the given callback before the buffer is reloaded from the
		contents of its file on disk.
	**/
	function onWillReload(callback:haxe.Constraints.Function):atom.Disposable;
	/**
		Invoke the given callback after the buffer is reloaded from the
		contents of its file on disk.
	**/
	function onDidReload(callback:haxe.Constraints.Function):atom.Disposable;
	/**
		Invoke the given callback when the buffer is destroyed.
	**/
	function onDidDestroy(callback:haxe.Constraints.Function):atom.Disposable;
	/**
		Invoke the given callback when there is an error in watching the
		file.
	**/
	function onWillThrowWatchError(callback:{ var error : Dynamic<Dynamic>; var handle : haxe.Constraints.Function; } -> Dynamic):atom.Disposable;
	/**
		Get the number of milliseconds that will elapse without a change
		before {::onDidStopChanging} observers are invoked following a change.
	**/
	function getStoppedChangingDelay():Float;
	/**
		Determine if the in-memory contents of the buffer differ from its
		contents on disk.
	**/
	function isModified():Bool;
	/**
		Determine if the in-memory contents of the buffer conflict with the
		on-disk contents of its associated file.
	**/
	function isInConflict():Bool;
	/**
		Get the path of the associated file.
	**/
	function getPath():String;
	/**
		Set the path for the buffer's associated file.
	**/
	function setPath(filePath:String):Dynamic;
	/**
		Sets the character set encoding for this buffer.
	**/
	function setEncoding(encoding:String):Dynamic;
	function getEncoding():String;
	/**
		Get the path of the associated file.
	**/
	function getUri():String;
	/**
		Determine whether the buffer is empty.
	**/
	function isEmpty():Bool;
	/**
		Get the entire text of the buffer.
	**/
	function getText():String;
	/**
		Get the text in a range.
	**/
	function getTextInRange(range:atom.Range):String;
	/**
		Get the text of all lines in the buffer, without their line endings.
	**/
	function getLines():Array<Dynamic>;
	/**
		Get the text of the last line of the buffer, without its line
		ending.
	**/
	function getLastLine():String;
	/**
		Get the text of the line at the given row, without its line ending.
	**/
	function lineForRow(row:Float):String;
	/**
		Get the line ending for the given 0-indexed row.
	**/
	function lineEndingForRow(row:Float):String;
	/**
		Get the length of the line for the given 0-indexed row, without its
		line ending.
	**/
	function lineLengthForRow(row:Float):Float;
	/**
		Determine if the given row contains only whitespace.
	**/
	function isRowBlank(row:Float):Bool;
	/**
		Given a row, find the first preceding row that's not blank.
	**/
	function previousNonBlankRow(startRow:Float):Float;
	/**
		Given a row, find the next row that's not blank.
	**/
	function nextNonBlankRow(startRow:Float):Float;
	/**
		Replace the entire contents of the buffer with the given text.
	**/
	function setText(text:String):atom.Range;
	/**
		Replace the current buffer contents by applying a diff based on the
		given text.
	**/
	function setTextViaDiff(text:String):Dynamic;
	/**
		Set the text in the given range.
	**/
	function setTextInRange(range:atom.Range, text:String, options:{ @:optional
	var normalizeLineEndings : Bool; @:optional
	var undo : String; }):atom.Range;
	/**
		Insert text at the given position.
	**/
	function insert(position:atom.Point, text:String, options:{ @:optional
	var normalizeLineEndings : Bool; @:optional
	var undo : String; }):atom.Range;
	/**
		Append text to the end of the buffer.
	**/
	function append(text:String, options:{ @:optional
	var normalizeLineEndings : Bool; @:optional
	var undo : String; }):atom.Range;
	/**
		Delete the text in the given range.
	**/
	function delete(range:atom.Range):atom.Range;
	/**
		Delete the line associated with a specified row.
	**/
	function deleteRow(row:Float):atom.Range;
	/**
		Delete the lines associated with the specified row range.
	**/
	function deleteRows(startRow:Float, endRow:Float):atom.Range;
	/**
		Create a marker with the given range. This marker will maintain
		its logical location as the buffer is changed, so if you mark a particular
		word, the marker will remain over that word even if the word's location in
		the buffer changes.
	**/
	function markRange(range:atom.Range, properties:Dynamic):atom.Marker;
	/**
		Create a marker at the given position with no tail.
	**/
	function markPosition(position:atom.Point, properties:Dynamic):atom.Marker;
	/**
		Get all existing markers on the buffer.
	**/
	function getMarkers():Array<Dynamic>;
	/**
		Get an existing marker by its id.
	**/
	function getMarker(id:Float):atom.Marker;
	/**
		Find markers conforming to the given parameters.
	**/
	function findMarkers(params:Dynamic):Array<Dynamic>;
	/**
		Get the number of markers in the buffer.
	**/
	function getMarkerCount():Float;
	/**
		Undo the last operation. If a transaction is in progress, aborts it. 
	**/
	function undo():Dynamic;
	/**
		Redo the last operation 
	**/
	function redo():Dynamic;
	/**
		Batch multiple operations as a single undo/redo step.
	**/
	function transact(groupingInterval:Float, fn:haxe.Constraints.Function):Dynamic;
	/**
		Clear the undo stack. 
	**/
	function clearUndoStack():Dynamic;
	/**
		Create a pointer to the current state of the buffer for use
		with {::revertToCheckpoint} and {::groupChangesSinceCheckpoint}.
	**/
	function createCheckpoint():Dynamic;
	/**
		Revert the buffer to the state it was in when the given
		checkpoint was created.
	**/
	function revertToCheckpoint():Bool;
	/**
		Group all changes since the given checkpoint into a single
		transaction for purposes of undo/redo.
	**/
	function groupChangesSinceCheckpoint():Bool;
	/**
		Scan regular expression matches in the entire buffer, calling the
		given iterator function on each match.
	**/
	function scan(regex:js.RegExp, iterator:Dynamic -> String -> atom.Range -> haxe.Constraints.Function -> haxe.Constraints.Function -> Dynamic):Dynamic;
	/**
		Scan regular expression matches in the entire buffer in reverse
		order, calling the given iterator function on each match.
	**/
	function backwardsScan(regex:js.RegExp, iterator:Dynamic -> String -> atom.Range -> haxe.Constraints.Function -> haxe.Constraints.Function -> Dynamic):Dynamic;
	/**
		Scan regular expression matches in a given range , calling the given
		iterator function on each match.
	**/
	function scanInRange(regex:js.RegExp, range:atom.Range, iterator:Dynamic -> String -> atom.Range -> haxe.Constraints.Function -> haxe.Constraints.Function -> Dynamic):Dynamic;
	/**
		Scan regular expression matches in a given range in reverse order,
		calling the given iterator function on each match.
	**/
	function backwardsScanInRange(regex:js.RegExp, range:atom.Range, iterator:Dynamic -> String -> atom.Range -> haxe.Constraints.Function -> haxe.Constraints.Function -> Dynamic):Dynamic;
	/**
		Replace all regular expression matches in the entire buffer.
	**/
	function replace(regex:js.RegExp, replacementText:String):Float;
	/**
		Get the range spanning from `[0, 0]` to {::getEndPosition}.
	**/
	function getRange():atom.Range;
	/**
		Get the number of lines in the buffer.
	**/
	function getLineCount():Float;
	/**
		Get the last 0-indexed row in the buffer.
	**/
	function getLastRow():Float;
	/**
		Get the first position in the buffer, which is always `[0, 0]`.
	**/
	function getFirstPosition():atom.Point;
	/**
		Get the maximal position in the buffer, where new text would be
		appended.
	**/
	function getEndPosition():atom.Point;
	/**
		Get the length of the buffer in characters.
	**/
	function getMaxCharacterIndex():Float;
	/**
		Get the range for the given row
	**/
	function rangeForRow(row:Float, includeNewline:Bool):atom.Range;
	/**
		Convert a position in the buffer in row/column coordinates to an
		absolute character offset, inclusive of line ending characters.
	**/
	function characterIndexForPosition(position:atom.Point):Float;
	/**
		Convert an absolute character offset, inclusive of newlines, to a
		position in the buffer in row/column coordinates.
	**/
	function positionForCharacterIndex(offset:Float):atom.Point;
	/**
		Clip the given range so it starts and ends at valid positions.
	**/
	function clipRange(range:atom.Range):atom.Range;
	/**
		Clip the given point so it is at a valid position in the buffer.
	**/
	function clipPosition(position:atom.Point):atom.Point;
	/**
		Save the buffer. 
	**/
	function save():Dynamic;
	/**
		Save the buffer at a specific path.
	**/
	function saveAs(filePath:Dynamic):Dynamic;
	/**
		Reload the buffer's contents from disk.
	**/
	function reload():Dynamic;
}