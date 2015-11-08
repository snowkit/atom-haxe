/**
	Represents a selection in the {TextEditor}. 
**/
package atom;
@:jsRequire("atom", "Selection") extern class Selection {
	/**
		Calls your `callback` when the selection was moved.
	**/
	function onDidChangeRange(callback:{ var oldBufferRange : atom.Range; var oldScreenRange : atom.Range; var newBufferRange : atom.Range; var newScreenRange : atom.Range; var selection : atom.Selection; } -> Dynamic):atom.Disposable;
	/**
		Calls your `callback` when the selection was destroyed
	**/
	function onDidDestroy(callback:haxe.Constraints.Function):atom.Disposable;
	function getScreenRange():atom.Range;
	/**
		Modifies the screen range for the selection.
	**/
	function setScreenRange(screenRange:atom.Range, options:Dynamic<Dynamic>):Dynamic;
	function getBufferRange():atom.Range;
	/**
		Modifies the buffer {Range} for the selection.
	**/
	function setBufferRange(bufferRange:atom.Range, options:{ var preserveFolds : Dynamic; var autoscroll : Bool; }):Dynamic;
	function getBufferRowRange():Dynamic;
	/**
		Determines if the selection contains anything. 
	**/
	function isEmpty():Dynamic;
	/**
		Determines if the ending position of a marker is greater than the
		starting position.
	**/
	function isReversed():Dynamic;
	function isSingleScreenLine():Dynamic;
	function getText():Dynamic;
	/**
		Identifies if a selection intersects with a given buffer range.
	**/
	function intersectsBufferRange(bufferRange:atom.Range):Bool;
	/**
		Identifies if a selection intersects with another selection.
	**/
	function intersectsWith(otherSelection:atom.Selection):Bool;
	/**
		Clears the selection, moving the marker to the head.
	**/
	function clear(options:{ var autoscroll : Bool; }):Dynamic;
	/**
		Selects the text from the current cursor position to a given screen
		position.
	**/
	function selectToScreenPosition(position:atom.Point):Dynamic;
	/**
		Selects the text from the current cursor position to a given buffer
		position.
	**/
	function selectToBufferPosition(position:atom.Point):Dynamic;
	/**
		Selects the text one position right of the cursor.
	**/
	function selectRight(columnCount:Float):Dynamic;
	/**
		Selects the text one position left of the cursor.
	**/
	function selectLeft(columnCount:Float):Dynamic;
	/**
		Selects all the text one position above the cursor.
	**/
	function selectUp(rowCount:Float):Dynamic;
	/**
		Selects all the text one position below the cursor.
	**/
	function selectDown(rowCount:Float):Dynamic;
	/**
		Selects all the text from the current cursor position to the top of
		the buffer. 
	**/
	function selectToTop():Dynamic;
	/**
		Selects all the text from the current cursor position to the bottom
		of the buffer. 
	**/
	function selectToBottom():Dynamic;
	/**
		Selects all the text in the buffer. 
	**/
	function selectAll():Dynamic;
	/**
		Selects all the text from the current cursor position to the
		beginning of the line. 
	**/
	function selectToBeginningOfLine():Dynamic;
	/**
		Selects all the text from the current cursor position to the first
		character of the line. 
	**/
	function selectToFirstCharacterOfLine():Dynamic;
	/**
		Selects all the text from the current cursor position to the end of
		the line. 
	**/
	function selectToEndOfLine():Dynamic;
	/**
		Selects all the text from the current cursor position to the
		beginning of the word. 
	**/
	function selectToBeginningOfWord():Dynamic;
	/**
		Selects all the text from the current cursor position to the end of
		the word. 
	**/
	function selectToEndOfWord():Dynamic;
	/**
		Selects all the text from the current cursor position to the
		beginning of the next word. 
	**/
	function selectToBeginningOfNextWord():Dynamic;
	/**
		Selects text to the previous word boundary. 
	**/
	function selectToPreviousWordBoundary():Dynamic;
	/**
		Selects text to the next word boundary. 
	**/
	function selectToNextWordBoundary():Dynamic;
	/**
		Selects text to the previous subword boundary. 
	**/
	function selectToPreviousSubwordBoundary():Dynamic;
	/**
		Selects text to the next subword boundary. 
	**/
	function selectToNextSubwordBoundary():Dynamic;
	/**
		Selects all the text from the current cursor position to the
		beginning of the next paragraph. 
	**/
	function selectToBeginningOfNextParagraph():Dynamic;
	/**
		Selects all the text from the current cursor position to the
		beginning of the previous paragraph. 
	**/
	function selectToBeginningOfPreviousParagraph():Dynamic;
	/**
		Modifies the selection to encompass the current word.
	**/
	function selectWord():atom.Range;
	/**
		Expands the newest selection to include the entire word on which
		the cursors rests. 
	**/
	function expandOverWord():Dynamic;
	/**
		Selects an entire line in the buffer.
	**/
	function selectLine(row:Float):Dynamic;
	/**
		Expands the newest selection to include the entire line on which
		the cursor currently rests.
	**/
	function expandOverLine():Dynamic;
	/**
		Replaces text at the current selection.
	**/
	function insertText(text:String, options:{ var select : Dynamic; var autoIndent : Dynamic; var autoIndentNewline : Dynamic; var autoDecreaseIndent : Dynamic; @:optional
	var normalizeLineEndings : Bool; var undo : Dynamic; }):Dynamic;
	/**
		Removes the first character before the selection if the selection
		is empty otherwise it deletes the selection. 
	**/
	function backspace():Dynamic;
	/**
		Removes the selection or, if nothing is selected, then all
		characters from the start of the selection back to the previous word
		boundary. 
	**/
	function deleteToPreviousWordBoundary():Dynamic;
	/**
		Removes the selection or, if nothing is selected, then all
		characters from the start of the selection up to the next word
		boundary. 
	**/
	function deleteToNextWordBoundary():Dynamic;
	/**
		Removes from the start of the selection to the beginning of the
		current word if the selection is empty otherwise it deletes the selection. 
	**/
	function deleteToBeginningOfWord():Dynamic;
	/**
		Removes from the beginning of the line which the selection begins on
		all the way through to the end of the selection. 
	**/
	function deleteToBeginningOfLine():Dynamic;
	/**
		Removes the selection or the next character after the start of the
		selection if the selection is empty. 
	**/
	function delete():Dynamic;
	/**
		If the selection is empty, removes all text from the cursor to the
		end of the line. If the cursor is already at the end of the line, it
		removes the following newline. If the selection isn't empty, only deletes
		the contents of the selection. 
	**/
	function deleteToEndOfLine():Dynamic;
	/**
		Removes the selection or all characters from the start of the
		selection to the end of the current word if nothing is selected. 
	**/
	function deleteToEndOfWord():Dynamic;
	/**
		Removes the selection or all characters from the start of the
		selection to the end of the current word if nothing is selected. 
	**/
	function deleteToBeginningOfSubword():Dynamic;
	/**
		Removes the selection or all characters from the start of the
		selection to the end of the current word if nothing is selected. 
	**/
	function deleteToEndOfSubword():Dynamic;
	/**
		Removes only the selected text. 
	**/
	function deleteSelectedText():Dynamic;
	/**
		Removes the line at the beginning of the selection if the selection
		is empty unless the selection spans multiple lines in which case all lines
		are removed. 
	**/
	function deleteLine():Dynamic;
	/**
		Joins the current line with the one below it. Lines will
		be separated by a single space.
	**/
	function joinLines():Dynamic;
	/**
		Removes one level of indent from the currently selected rows. 
	**/
	function outdentSelectedRows():Dynamic;
	/**
		Sets the indentation level of all selected rows to values suggested
		by the relevant grammars. 
	**/
	function autoIndentSelectedRows():Dynamic;
	/**
		Wraps the selected lines in comments if they aren't currently part
		of a comment.
	**/
	function toggleLineComments():Dynamic;
	/**
		Cuts the selection until the end of the line. 
	**/
	function cutToEndOfLine():Dynamic;
	/**
		Copies the selection to the clipboard and then deletes it.
	**/
	function cut(maintainClipboard:Bool, fullLine:Bool):Dynamic;
	/**
		Copies the current selection to the clipboard.
	**/
	function copy(maintainClipboard:Bool, fullLine:Bool):Dynamic;
	/**
		Creates a fold containing the current selection. 
	**/
	function fold():Dynamic;
	/**
		If the selection spans multiple rows, indent all of them. 
	**/
	function indentSelectedRows():Dynamic;
	/**
		Moves the selection down one row. 
	**/
	function addSelectionBelow():Dynamic;
	/**
		Moves the selection up one row. 
	**/
	function addSelectionAbove():Dynamic;
	/**
		Combines the given selection into this selection and then destroys
		the given selection.
	**/
	function merge(otherSelection:atom.Selection, options:Dynamic<Dynamic>):Dynamic;
	/**
		Compare this selection's buffer range to another selection's buffer
		range.
	**/
	function compare(otherSelection:atom.Selection):Dynamic;
}