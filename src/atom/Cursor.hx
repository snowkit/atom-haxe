/**
	The `Cursor` class represents the little blinking line identifying
	where text can be inserted.
**/
package atom;
@:jsRequire("atom", "Cursor") extern class Cursor {
	/**
		Calls your `callback` when the cursor has been moved.
	**/
	function onDidChangePosition(callback:{ var oldBufferPosition : atom.Point; var oldScreenPosition : atom.Point; var newBufferPosition : atom.Point; var newScreenPosition : atom.Point; var textChanged : Bool; var Cursor : atom.Cursor; } -> Dynamic):atom.Disposable;
	/**
		Calls your `callback` when the cursor is destroyed
	**/
	function onDidDestroy(callback:haxe.Constraints.Function):atom.Disposable;
	/**
		Calls your `callback` when the cursor's visibility has changed
	**/
	function onDidChangeVisibility(callback:Bool -> Dynamic):atom.Disposable;
	/**
		Moves a cursor to a given screen position.
	**/
	function setScreenPosition(screenPosition:Array<Dynamic>, options:{ var autoscroll : atom.TextEditor; }):Dynamic;
	function getScreenPosition():Dynamic;
	/**
		Moves a cursor to a given buffer position.
	**/
	function setBufferPosition(bufferPosition:Array<Dynamic>, options:{ var autoscroll : Bool; }):Dynamic;
	function getBufferPosition():Dynamic;
	function getScreenRow():Dynamic;
	function getScreenColumn():Dynamic;
	/**
		Retrieves the cursor's current buffer row. 
	**/
	function getBufferRow():Dynamic;
	function getBufferColumn():Dynamic;
	function getCurrentBufferLine():Dynamic;
	function isAtBeginningOfLine():Dynamic;
	function isAtEndOfLine():Dynamic;
	function getMarker():atom.Marker;
	/**
		Identifies if the cursor is surrounded by whitespace.
	**/
	function isSurroundedByWhitespace():Bool;
	function isBetweenWordAndNonWord():Dynamic;
	function isInsideWord(options:{ var wordRegex : js.RegExp; }):Dynamic;
	function getIndentLevel():Dynamic;
	/**
		Retrieves the scope descriptor for the cursor's current position.
	**/
	function getScopeDescriptor():atom.ScopeDescriptor;
	function hasPrecedingCharactersOnLine():Dynamic;
	/**
		Identifies if this cursor is the last in the {TextEditor}.
	**/
	function isLastCursor():Bool;
	/**
		Moves the cursor up one screen row.
	**/
	function moveUp(rowCount:Float, options:{ var moveToEndOfSelection : Dynamic; }):Dynamic;
	/**
		Moves the cursor down one screen row.
	**/
	function moveDown(rowCount:Float, options:{ var moveToEndOfSelection : Dynamic; }):Dynamic;
	/**
		Moves the cursor left one screen column.
	**/
	function moveLeft(columnCount:Float, options:{ var moveToEndOfSelection : Dynamic; }):Dynamic;
	/**
		Moves the cursor right one screen column.
	**/
	function moveRight(columnCount:Float, options:{ var moveToEndOfSelection : Dynamic; }):Dynamic;
	/**
		Moves the cursor to the top of the buffer. 
	**/
	function moveToTop():Dynamic;
	/**
		Moves the cursor to the bottom of the buffer. 
	**/
	function moveToBottom():Dynamic;
	/**
		Moves the cursor to the beginning of the line. 
	**/
	function moveToBeginningOfScreenLine():Dynamic;
	/**
		Moves the cursor to the beginning of the buffer line. 
	**/
	function moveToBeginningOfLine():Dynamic;
	/**
		Moves the cursor to the beginning of the first character in the
		line. 
	**/
	function moveToFirstCharacterOfLine():Dynamic;
	/**
		Moves the cursor to the end of the line. 
	**/
	function moveToEndOfScreenLine():Dynamic;
	/**
		Moves the cursor to the end of the buffer line. 
	**/
	function moveToEndOfLine():Dynamic;
	/**
		Moves the cursor to the beginning of the word. 
	**/
	function moveToBeginningOfWord():Dynamic;
	/**
		Moves the cursor to the end of the word. 
	**/
	function moveToEndOfWord():Dynamic;
	/**
		Moves the cursor to the beginning of the next word. 
	**/
	function moveToBeginningOfNextWord():Dynamic;
	/**
		Moves the cursor to the previous word boundary. 
	**/
	function moveToPreviousWordBoundary():Dynamic;
	/**
		Moves the cursor to the next word boundary. 
	**/
	function moveToNextWordBoundary():Dynamic;
	/**
		Moves the cursor to the previous subword boundary. 
	**/
	function moveToPreviousSubwordBoundary():Dynamic;
	/**
		Moves the cursor to the next subword boundary. 
	**/
	function moveToNextSubwordBoundary():Dynamic;
	/**
		Moves the cursor to the beginning of the buffer line, skipping all
		whitespace. 
	**/
	function skipLeadingWhitespace():Dynamic;
	/**
		Moves the cursor to the beginning of the next paragraph 
	**/
	function moveToBeginningOfNextParagraph():Dynamic;
	/**
		Moves the cursor to the beginning of the previous paragraph 
	**/
	function moveToBeginningOfPreviousParagraph():Dynamic;
	function getPreviousWordBoundaryBufferPosition(options:{ var wordRegex : js.RegExp; }):Dynamic;
	function getNextWordBoundaryBufferPosition(options:{ var wordRegex : js.RegExp; }):Dynamic;
	/**
		Retrieves the buffer position of where the current word starts.
	**/
	function getBeginningOfCurrentWordBufferPosition(options:{ var wordRegex : js.RegExp; var includeNonWordCharacters : Bool; var allowPrevious : Bool; }):atom.Range;
	/**
		Retrieves the buffer position of where the current word ends.
	**/
	function getEndOfCurrentWordBufferPosition(options:{ var wordRegex : js.RegExp; var includeNonWordCharacters : Dynamic; }):atom.Range;
	/**
		Retrieves the buffer position of where the next word starts.
	**/
	function getBeginningOfNextWordBufferPosition(options:{ var wordRegex : js.RegExp; }):atom.Range;
	function getCurrentWordBufferRange(options:{ var wordRegex : js.RegExp; }):Dynamic;
	function getCurrentLineBufferRange(options:{ var includeNewline : Bool; }):Dynamic;
	/**
		Retrieves the range for the current paragraph.
	**/
	function getCurrentParagraphBufferRange():atom.Range;
	function getCurrentWordPrefix():Dynamic;
	/**
		Sets whether the cursor is visible. 
	**/
	function setVisible():Dynamic;
	function isVisible():Dynamic;
	/**
		Compare this cursor's buffer position to another cursor's buffer position.
	**/
	function compare(otherCursor:atom.Cursor):Dynamic;
	/**
		Prevents this cursor from causing scrolling. 
	**/
	function clearAutoscroll():Dynamic;
	/**
		Deselects the current selection. 
	**/
	function clearSelection():Dynamic;
	/**
		Get the RegExp used by the cursor to determine what a "word" is.
	**/
	function wordRegExp(options:{ var includeNonWordCharacters : Bool; }):js.RegExp;
	/**
		Get the RegExp used by the cursor to determine what a "subword" is.
	**/
	function subwordRegExp(options:{ var backwards : Bool; }):js.RegExp;
}