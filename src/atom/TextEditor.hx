/**
	This class represents all essential editing state for a single
	{TextBuffer}, including cursor and selection positions, folds, and soft wraps.
	If you're manipulating the state of an editor, use this class. If you're
	interested in the visual appearance of editors, use {TextEditorView} instead.
**/
package atom;
@:jsRequire("atom", "TextEditor") extern class TextEditor {
	/**
		Calls your `callback` when the buffer's title has changed.
	**/
	function onDidChangeTitle(callback:haxe.Constraints.Function):atom.Disposable;
	/**
		Calls your `callback` when the buffer's path, and therefore title, has changed.
	**/
	function onDidChangePath(callback:haxe.Constraints.Function):atom.Disposable;
	/**
		Invoke the given callback synchronously when the content of the
		buffer changes.
	**/
	function onDidChange(callback:haxe.Constraints.Function):atom.Disposable;
	/**
		Invoke `callback` when the buffer's contents change. It is
		emit asynchronously 300ms after the last buffer change. This is a good place
		to handle changes to the buffer without compromising typing performance.
	**/
	function onDidStopChanging(callback:haxe.Constraints.Function):atom.Disposable;
	/**
		Calls your `callback` when a {Cursor} is moved. If there are
		multiple cursors, your callback will be called for each cursor.
	**/
	function onDidChangeCursorPosition(callback:{ var oldBufferPosition : atom.Point; var oldScreenPosition : atom.Point; var newBufferPosition : atom.Point; var newScreenPosition : atom.Point; var textChanged : Bool; var cursor : atom.Cursor; } -> Dynamic):atom.Disposable;
	/**
		Calls your `callback` when a selection's screen range changes.
	**/
	function onDidChangeSelectionRange(callback:{ var oldBufferRange : atom.Range; var oldScreenRange : atom.Range; var newBufferRange : atom.Range; var newScreenRange : atom.Range; var selection : atom.Selection; } -> Dynamic):atom.Disposable;
	/**
		Calls your `callback` when soft wrap was enabled or disabled.
	**/
	function onDidChangeSoftWrapped(callback:haxe.Constraints.Function):atom.Disposable;
	/**
		Calls your `callback` when the buffer's encoding has changed.
	**/
	function onDidChangeEncoding(callback:haxe.Constraints.Function):atom.Disposable;
	/**
		Calls your `callback` when the grammar that interprets and
		colorizes the text has been changed. Immediately calls your callback with
		the current grammar.
	**/
	function observeGrammar(callback:atom.Grammar -> Dynamic):atom.Disposable;
	/**
		Calls your `callback` when the grammar that interprets and
		colorizes the text has been changed.
	**/
	function onDidChangeGrammar(callback:atom.Grammar -> Dynamic):atom.Disposable;
	/**
		Calls your `callback` when the result of {::isModified} changes.
	**/
	function onDidChangeModified(callback:haxe.Constraints.Function):atom.Disposable;
	/**
		Calls your `callback` when the buffer's underlying file changes on
		disk at a moment when the result of {::isModified} is true.
	**/
	function onDidConflict(callback:haxe.Constraints.Function):atom.Disposable;
	/**
		Calls your `callback` before text has been inserted.
	**/
	function onWillInsertText(callback:{ var text : String; var cancel : haxe.Constraints.Function; } -> Dynamic):atom.Disposable;
	/**
		Calls your `callback` after text has been inserted.
	**/
	function onDidInsertText(callback:{ var text : String; } -> Dynamic):atom.Disposable;
	/**
		Invoke the given callback after the buffer is saved to disk.
	**/
	function onDidSave(callback:{ var path : Dynamic; } -> Dynamic):atom.Disposable;
	/**
		Invoke the given callback when the editor is destroyed.
	**/
	function onDidDestroy(callback:haxe.Constraints.Function):atom.Disposable;
	/**
		Calls your `callback` when a {Cursor} is added to the editor.
		Immediately calls your callback for each existing cursor.
	**/
	function observeCursors(callback:atom.Cursor -> Dynamic):atom.Disposable;
	/**
		Calls your `callback` when a {Cursor} is added to the editor.
	**/
	function onDidAddCursor(callback:atom.Cursor -> Dynamic):atom.Disposable;
	/**
		Calls your `callback` when a {Cursor} is removed from the editor.
	**/
	function onDidRemoveCursor(callback:atom.Cursor -> Dynamic):atom.Disposable;
	/**
		Calls your `callback` when a {Selection} is added to the editor.
		Immediately calls your callback for each existing selection.
	**/
	function observeSelections(callback:atom.Selection -> Dynamic):atom.Disposable;
	/**
		Calls your `callback` when a {Selection} is added to the editor.
	**/
	function onDidAddSelection(callback:atom.Selection -> Dynamic):atom.Disposable;
	/**
		Calls your `callback` when a {Selection} is removed from the editor.
	**/
	function onDidRemoveSelection(callback:atom.Selection -> Dynamic):atom.Disposable;
	/**
		Calls your `callback` with each {Decoration} added to the editor.
		Calls your `callback` immediately for any existing decorations.
	**/
	function observeDecorations(callback:atom.Decoration -> Dynamic):atom.Disposable;
	/**
		Calls your `callback` when a {Decoration} is added to the editor.
	**/
	function onDidAddDecoration(callback:atom.Decoration -> Dynamic):atom.Disposable;
	/**
		Calls your `callback` when a {Decoration} is removed from the editor.
	**/
	function onDidRemoveDecoration(callback:atom.Decoration -> Dynamic):atom.Disposable;
	/**
		Calls your `callback` when the placeholder text is changed.
	**/
	function onDidChangePlaceholderText(callback:String -> Dynamic):atom.Disposable;
	/**
		Retrieves the current {TextBuffer}. 
	**/
	function getBuffer():Dynamic;
	/**
		Calls your `callback` when a {Gutter} is added to the editor.
		Immediately calls your callback for each existing gutter.
	**/
	function observeGutters(callback:atom.Gutter -> Dynamic):atom.Disposable;
	/**
		Calls your `callback` when a {Gutter} is added to the editor.
	**/
	function onDidAddGutter(callback:atom.Gutter -> Dynamic):atom.Disposable;
	/**
		Calls your `callback` when a {Gutter} is removed from the editor.
	**/
	function onDidRemoveGutter(callback:atom.Gutter -> Dynamic):atom.Disposable;
	/**
		Get the editor's title for display in other parts of the
		UI such as the tabs.
	**/
	function getTitle():String;
	/**
		Get the editor's long title for display in other parts of the UI
		such as the window title.
	**/
	function getLongTitle():String;
	function getPath():String;
	function getEncoding():String;
	/**
		Set the character set encoding to use in this editor's text
		buffer.
	**/
	function setEncoding(encoding:String):Dynamic;
	function isModified():Bool;
	function isEmpty():Bool;
	/**
		Saves the editor's text buffer.
	**/
	function save():Dynamic;
	/**
		Saves the editor's text buffer as the given path.
	**/
	function saveAs(filePath:String):Dynamic;
	function getText():String;
	/**
		Get the text in the given {Range} in buffer coordinates.
	**/
	function getTextInBufferRange(range:atom.Range):String;
	function getLineCount():Float;
	function getScreenLineCount():Float;
	function getLastBufferRow():Float;
	function getLastScreenRow():Float;
	function lineTextForBufferRow(bufferRow:Float):String;
	function lineTextForScreenRow(screenRow:Float):String;
	/**
		Get the {Range} of the paragraph surrounding the most recently added
		cursor.
	**/
	function getCurrentParagraphBufferRange():atom.Range;
	/**
		Replaces the entire contents of the buffer with the given {String}.
	**/
	function setText(text:String):Dynamic;
	/**
		Set the text in the given {Range} in buffer coordinates.
	**/
	function setTextInBufferRange(range:atom.Range, text:String, options:{ @:optional
	var normalizeLineEndings : Bool; @:optional
	var undo : String; }):atom.Range;
	/**
		For each selection, replace the selected text with the given text.
	**/
	function insertText(text:String, options:Dynamic):haxe.extern.EitherType<atom.Range, Bool>;
	/**
		For each selection, replace the selected text with a newline. 
	**/
	function insertNewline():Dynamic;
	/**
		For each selection, if the selection is empty, delete the character
		following the cursor. Otherwise delete the selected text. 
	**/
	function delete():Dynamic;
	/**
		For each selection, if the selection is empty, delete the character
		preceding the cursor. Otherwise delete the selected text. 
	**/
	function backspace():Dynamic;
	/**
		Mutate the text of all the selections in a single transaction.
	**/
	function mutateSelectedText(fn:haxe.Constraints.Function):Dynamic;
	/**
		For each selection, transpose the selected text.
	**/
	function transpose():Dynamic;
	/**
		Convert the selected text to upper case.
	**/
	function upperCase():Dynamic;
	/**
		Convert the selected text to lower case.
	**/
	function lowerCase():Dynamic;
	/**
		Toggle line comments for rows intersecting selections.
	**/
	function toggleLineCommentsInSelection():Dynamic;
	/**
		For each cursor, insert a newline at beginning the following line. 
	**/
	function insertNewlineBelow():Dynamic;
	/**
		For each cursor, insert a newline at the end of the preceding line. 
	**/
	function insertNewlineAbove():Dynamic;
	/**
		For each selection, if the selection is empty, delete all characters
		of the containing word that precede the cursor. Otherwise delete the
		selected text. 
	**/
	function deleteToBeginningOfWord():Dynamic;
	/**
		Similar to {::deleteToBeginningOfWord}, but deletes only back to the
		previous word boundary. 
	**/
	function deleteToPreviousWordBoundary():Dynamic;
	/**
		Similar to {::deleteToEndOfWord}, but deletes only up to the
		next word boundary. 
	**/
	function deleteToNextWordBoundary():Dynamic;
	/**
		For each selection, if the selection is empty, delete all characters
		of the containing subword following the cursor. Otherwise delete the selected
		text. 
	**/
	function deleteToBeginningOfSubword():Dynamic;
	/**
		For each selection, if the selection is empty, delete all characters
		of the containing subword following the cursor. Otherwise delete the selected
		text. 
	**/
	function deleteToEndOfSubword():Dynamic;
	/**
		For each selection, if the selection is empty, delete all characters
		of the containing line that precede the cursor. Otherwise delete the
		selected text. 
	**/
	function deleteToBeginningOfLine():Dynamic;
	/**
		For each selection, if the selection is not empty, deletes the
		selection; otherwise, deletes all characters of the containing line
		following the cursor. If the cursor is already at the end of the line,
		deletes the following newline. 
	**/
	function deleteToEndOfLine():Dynamic;
	/**
		For each selection, if the selection is empty, delete all characters
		of the containing word following the cursor. Otherwise delete the selected
		text. 
	**/
	function deleteToEndOfWord():Dynamic;
	/**
		Delete all lines intersecting selections. 
	**/
	function deleteLine():Dynamic;
	/**
		Undo the last change. 
	**/
	function undo():Dynamic;
	/**
		Redo the last change. 
	**/
	function redo():Dynamic;
	/**
		Batch multiple operations as a single undo/redo step.
	**/
	function transact(groupingInterval:Float, fn:haxe.Constraints.Function):Dynamic;
	/**
		Abort an open transaction, undoing any operations performed so far
		within the transaction. 
	**/
	function abortTransaction():Dynamic;
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
		Convert a position in buffer-coordinates to screen-coordinates.
	**/
	function screenPositionForBufferPosition(bufferPosition:atom.Point, options:Dynamic):atom.Point;
	/**
		Convert a position in screen-coordinates to buffer-coordinates.
	**/
	function bufferPositionForScreenPosition(bufferPosition:atom.Point, options:Dynamic):atom.Point;
	/**
		Convert a range in buffer-coordinates to screen-coordinates.
	**/
	function screenRangeForBufferRange(bufferRange:atom.Range):atom.Range;
	/**
		Convert a range in screen-coordinates to buffer-coordinates.
	**/
	function bufferRangeForScreenRange(screenRange:atom.Range):atom.Range;
	/**
		Clip the given {Point} to a valid position in the buffer.
	**/
	function clipBufferPosition(bufferPosition:atom.Point):atom.Point;
	/**
		Clip the start and end of the given range to valid positions in the
		buffer. See {::clipBufferPosition} for more information.
	**/
	function clipBufferRange(range:atom.Range):atom.Range;
	/**
		Clip the given {Point} to a valid position on screen.
	**/
	function clipScreenPosition(screenPosition:atom.Point, options:{ var wrapBeyondNewlines : Bool; var wrapAtSoftNewlines : Bool; var screenLine : Bool; }):atom.Point;
	/**
		Clip the start and end of the given range to valid positions on screen.
		See {::clipScreenPosition} for more information.
	**/
	function clipScreenRange(range:atom.Range, options:atom.Range):Dynamic;
	/**
		Adds a decoration that tracks a {Marker}. When the marker moves,
		is invalidated, or is destroyed, the decoration will be updated to reflect
		the marker's state.
	**/
	function decorateMarker(marker:atom.Marker, decorationParams:{ var type : Dynamic; var class_ : Dynamic; @:optional
	var onlyHead : Dynamic; @:optional
	var onlyEmpty : Dynamic; @:optional
	var onlyNonEmpty : Dynamic; @:optional
	var position : Dynamic; }):atom.Decoration;
	/**
		Get all the decorations within a screen row range.
	**/
	function decorationsForScreenRowRange(startScreenRow:Float, endScreenRow:Float):Dynamic;
	/**
		Get all decorations.
	**/
	function getDecorations(propertyFilter:Dynamic<Dynamic>):Array<Dynamic>;
	/**
		Get all decorations of type 'line'.
	**/
	function getLineDecorations(propertyFilter:Dynamic<Dynamic>):Array<Dynamic>;
	/**
		Get all decorations of type 'line-number'.
	**/
	function getLineNumberDecorations(propertyFilter:Dynamic<Dynamic>):Array<Dynamic>;
	/**
		Get all decorations of type 'highlight'.
	**/
	function getHighlightDecorations(propertyFilter:Dynamic<Dynamic>):Array<Dynamic>;
	/**
		Get all decorations of type 'overlay'.
	**/
	function getOverlayDecorations(propertyFilter:Dynamic<Dynamic>):Array<Dynamic>;
	/**
		Create a marker with the given range in buffer coordinates. This
		marker will maintain its logical location as the buffer is changed, so if
		you mark a particular word, the marker will remain over that word even if
		the word's location in the buffer changes.
	**/
	function markBufferRange(range:atom.Range, properties:Dynamic):atom.Marker;
	/**
		Create a marker with the given range in screen coordinates. This
		marker will maintain its logical location as the buffer is changed, so if
		you mark a particular word, the marker will remain over that word even if
		the word's location in the buffer changes.
	**/
	function markScreenRange(range:atom.Range, properties:Dynamic):atom.Marker;
	/**
		Mark the given position in buffer coordinates.
	**/
	function markBufferPosition(position:atom.Point, options:Dynamic):atom.Marker;
	/**
		Mark the given position in screen coordinates.
	**/
	function markScreenPosition(position:atom.Point, options:Dynamic):atom.Marker;
	/**
		Find all {Marker}s that match the given properties.
	**/
	function findMarkers(properties:{ var startBufferRow : Dynamic; var endBufferRow : Dynamic; var containsBufferRange : atom.Range; var containsBufferPosition : atom.Point; }):Dynamic;
	/**
		Observe changes in the set of markers that intersect a particular
		region of the editor.
	**/
	function observeMarkers(callback:{ var insert : Array<Dynamic>; var update : Array<Dynamic>; var remove : Array<Dynamic>; } -> Dynamic):Array<Dynamic>;
	/**
		Get the {Marker} for the given marker id.
	**/
	function getMarker(id:Float):Dynamic;
	/**
		Get all {Marker}s. Consider using {::findMarkers} 
	**/
	function getMarkers():Dynamic;
	/**
		Get the number of markers in this editor's buffer.
	**/
	function getMarkerCount():Float;
	/**
		Get the position of the most recently added cursor in buffer
		coordinates.
	**/
	function getCursorBufferPosition():atom.Point;
	/**
		Get the position of all the cursor positions in buffer coordinates.
	**/
	function getCursorBufferPositions():Array<Dynamic>;
	/**
		Move the cursor to the given position in buffer coordinates.
	**/
	function setCursorBufferPosition(position:atom.Point, options:{ var autoscroll : Dynamic; }):Dynamic;
	/**
		Get a {Cursor} at given screen coordinates {Point}
	**/
	function getCursorAtScreenPosition(position:atom.Point):atom.Cursor;
	/**
		Get the position of the most recently added cursor in screen
		coordinates.
	**/
	function getCursorScreenPosition():atom.Point;
	/**
		Get the position of all the cursor positions in screen coordinates.
	**/
	function getCursorScreenPositions():Array<Dynamic>;
	/**
		Move the cursor to the given position in screen coordinates.
	**/
	function setCursorScreenPosition(position:atom.Point, options:{ var autoscroll : Dynamic; }):Dynamic;
	/**
		Add a cursor at the given position in buffer coordinates.
	**/
	function addCursorAtBufferPosition(bufferPosition:atom.Point):atom.Cursor;
	/**
		Add a cursor at the position in screen coordinates.
	**/
	function addCursorAtScreenPosition(screenPosition:atom.Point):atom.Cursor;
	function hasMultipleCursors():Bool;
	/**
		Move every cursor up one row in screen coordinates.
	**/
	function moveUp(lineCount:Float):Dynamic;
	/**
		Move every cursor down one row in screen coordinates.
	**/
	function moveDown(lineCount:Float):Dynamic;
	/**
		Move every cursor left one column.
	**/
	function moveLeft(columnCount:Float):Dynamic;
	/**
		Move every cursor right one column.
	**/
	function moveRight(columnCount:Float):Dynamic;
	/**
		Move every cursor to the beginning of its line in buffer coordinates. 
	**/
	function moveToBeginningOfLine():Dynamic;
	/**
		Move every cursor to the beginning of its line in screen coordinates. 
	**/
	function moveToBeginningOfScreenLine():Dynamic;
	/**
		Move every cursor to the first non-whitespace character of its line. 
	**/
	function moveToFirstCharacterOfLine():Dynamic;
	/**
		Move every cursor to the end of its line in buffer coordinates. 
	**/
	function moveToEndOfLine():Dynamic;
	/**
		Move every cursor to the end of its line in screen coordinates. 
	**/
	function moveToEndOfScreenLine():Dynamic;
	/**
		Move every cursor to the beginning of its surrounding word. 
	**/
	function moveToBeginningOfWord():Dynamic;
	/**
		Move every cursor to the end of its surrounding word. 
	**/
	function moveToEndOfWord():Dynamic;
	/**
		Move every cursor to the top of the buffer.
	**/
	function moveToTop():Dynamic;
	/**
		Move every cursor to the bottom of the buffer.
	**/
	function moveToBottom():Dynamic;
	/**
		Move every cursor to the beginning of the next word. 
	**/
	function moveToBeginningOfNextWord():Dynamic;
	/**
		Move every cursor to the previous word boundary. 
	**/
	function moveToPreviousWordBoundary():Dynamic;
	/**
		Move every cursor to the next word boundary. 
	**/
	function moveToNextWordBoundary():Dynamic;
	/**
		Move every cursor to the previous subword boundary. 
	**/
	function moveToPreviousSubwordBoundary():Dynamic;
	/**
		Move every cursor to the next subword boundary. 
	**/
	function moveToNextSubwordBoundary():Dynamic;
	/**
		Move every cursor to the beginning of the next paragraph. 
	**/
	function moveToBeginningOfNextParagraph():Dynamic;
	/**
		Move every cursor to the beginning of the previous paragraph. 
	**/
	function moveToBeginningOfPreviousParagraph():Dynamic;
	function getLastCursor():atom.Cursor;
	function getWordUnderCursor(options:Dynamic):Dynamic;
	/**
		Get an Array of all {Cursor}s. 
	**/
	function getCursors():Dynamic;
	/**
		Get all {Cursors}s, ordered by their position in the buffer
		instead of the order in which they were added.
	**/
	function getCursorsOrderedByBufferPosition():Array<Dynamic>;
	/**
		Get the selected text of the most recently added selection.
	**/
	function getSelectedText():String;
	/**
		Get the {Range} of the most recently added selection in buffer
		coordinates.
	**/
	function getSelectedBufferRange():atom.Range;
	/**
		Get the {Range}s of all selections in buffer coordinates.
	**/
	function getSelectedBufferRanges():Array<Dynamic>;
	/**
		Set the selected range in buffer coordinates. If there are multiple
		selections, they are reduced to a single selection with the given range.
	**/
	function setSelectedBufferRange(bufferRange:atom.Range, options:{ var reversed : Bool; var preserveFolds : Bool; }):Dynamic;
	/**
		Set the selected ranges in buffer coordinates. If there are multiple
		selections, they are replaced by new selections with the given ranges.
	**/
	function setSelectedBufferRanges(bufferRanges:Array<Dynamic>, options:{ var reversed : Bool; var preserveFolds : Bool; }):Dynamic;
	/**
		Get the {Range} of the most recently added selection in screen
		coordinates.
	**/
	function getSelectedScreenRange():atom.Range;
	/**
		Get the {Range}s of all selections in screen coordinates.
	**/
	function getSelectedScreenRanges():Array<Dynamic>;
	/**
		Set the selected range in screen coordinates. If there are multiple
		selections, they are reduced to a single selection with the given range.
	**/
	function setSelectedScreenRange(screenRange:atom.Range, options:{ var reversed : Bool; }):Dynamic;
	/**
		Set the selected ranges in screen coordinates. If there are multiple
		selections, they are replaced by new selections with the given ranges.
	**/
	function setSelectedScreenRanges(screenRanges:Array<Dynamic>, options:{ var reversed : Bool; }):Dynamic;
	/**
		Add a selection for the given range in buffer coordinates.
	**/
	function addSelectionForBufferRange(bufferRange:atom.Range, options:{ var reversed : Bool; }):atom.Selection;
	/**
		Add a selection for the given range in screen coordinates.
	**/
	function addSelectionForScreenRange(screenRange:atom.Range, options:{ var reversed : Bool; }):atom.Selection;
	/**
		Select from the current cursor position to the given position in
		buffer coordinates.
	**/
	function selectToBufferPosition(position:atom.Point):Dynamic;
	/**
		Select from the current cursor position to the given position in
		screen coordinates.
	**/
	function selectToScreenPosition(position:atom.Point):Dynamic;
	/**
		Move the cursor of each selection one character upward while
		preserving the selection's tail position.
	**/
	function selectUp(rowCount:Float):Dynamic;
	/**
		Move the cursor of each selection one character downward while
		preserving the selection's tail position.
	**/
	function selectDown(rowCount:Float):Dynamic;
	/**
		Move the cursor of each selection one character leftward while
		preserving the selection's tail position.
	**/
	function selectLeft(columnCount:Float):Dynamic;
	/**
		Move the cursor of each selection one character rightward while
		preserving the selection's tail position.
	**/
	function selectRight(columnCount:Float):Dynamic;
	/**
		Select from the top of the buffer to the end of the last selection
		in the buffer.
	**/
	function selectToTop():Dynamic;
	/**
		Selects from the top of the first selection in the buffer to the end
		of the buffer.
	**/
	function selectToBottom():Dynamic;
	/**
		Select all text in the buffer.
	**/
	function selectAll():Dynamic;
	/**
		Move the cursor of each selection to the beginning of its line
		while preserving the selection's tail position.
	**/
	function selectToBeginningOfLine():Dynamic;
	/**
		Move the cursor of each selection to the first non-whitespace
		character of its line while preserving the selection's tail position. If the
		cursor is already on the first character of the line, move it to the
		beginning of the line.
	**/
	function selectToFirstCharacterOfLine():Dynamic;
	/**
		Move the cursor of each selection to the end of its line while
		preserving the selection's tail position.
	**/
	function selectToEndOfLine():Dynamic;
	/**
		Expand selections to the beginning of their containing word.
	**/
	function selectToBeginningOfWord():Dynamic;
	/**
		Expand selections to the end of their containing word.
	**/
	function selectToEndOfWord():Dynamic;
	/**
		For each selection, move its cursor to the preceding subword
		boundary while maintaining the selection's tail position.
	**/
	function selectToPreviousSubwordBoundary():Dynamic;
	/**
		For each selection, move its cursor to the next subword boundary
		while maintaining the selection's tail position.
	**/
	function selectToNextSubwordBoundary():Dynamic;
	/**
		For each cursor, select the containing line.
	**/
	function selectLinesContainingCursors():Dynamic;
	/**
		Select the word surrounding each cursor. 
	**/
	function selectWordsContainingCursors():Dynamic;
	/**
		For each selection, move its cursor to the preceding word boundary
		while maintaining the selection's tail position.
	**/
	function selectToPreviousWordBoundary():Dynamic;
	/**
		For each selection, move its cursor to the next word boundary while
		maintaining the selection's tail position.
	**/
	function selectToNextWordBoundary():Dynamic;
	/**
		Expand selections to the beginning of the next word.
	**/
	function selectToBeginningOfNextWord():Dynamic;
	/**
		Expand selections to the beginning of the next paragraph.
	**/
	function selectToBeginningOfNextParagraph():Dynamic;
	/**
		Expand selections to the beginning of the next paragraph.
	**/
	function selectToBeginningOfPreviousParagraph():Dynamic;
	/**
		Select the range of the given marker if it is valid.
	**/
	function selectMarker(marker:atom.Marker):atom.Range;
	/**
		Get the most recently added {Selection}.
	**/
	function getLastSelection():atom.Selection;
	/**
		Get current {Selection}s.
	**/
	function getSelections():Array<Dynamic>;
	/**
		Get all {Selection}s, ordered by their position in the buffer
		instead of the order in which they were added.
	**/
	function getSelectionsOrderedByBufferPosition():Array<Dynamic>;
	/**
		Determine if a given range in buffer coordinates intersects a
		selection.
	**/
	function selectionIntersectsBufferRange(bufferRange:atom.Range):Bool;
	/**
		Scan regular expression matches in the entire buffer, calling the
		given iterator function on each match.
	**/
	function scan(regex:js.RegExp, iterator:{ var match : Dynamic; var matchText : String; var range : atom.Range; var stop : haxe.Constraints.Function; var replace : haxe.Constraints.Function; } -> Dynamic):Dynamic;
	/**
		Scan regular expression matches in a given range, calling the given
		iterator function on each match.
	**/
	function scanInBufferRange(regex:js.RegExp, range:atom.Range, iterator:Dynamic -> String -> atom.Range -> haxe.Constraints.Function -> haxe.Constraints.Function -> Dynamic):Dynamic;
	/**
		Scan regular expression matches in a given range in reverse order,
		calling the given iterator function on each match.
	**/
	function backwardsScanInBufferRange(regex:js.RegExp, range:atom.Range, iterator:Dynamic -> String -> atom.Range -> haxe.Constraints.Function -> haxe.Constraints.Function -> Dynamic):Dynamic;
	function getSoftTabs():Bool;
	/**
		Enable or disable soft tabs for this editor.
	**/
	function setSoftTabs(softTabs:Bool):Dynamic;
	/**
		Toggle soft tabs for this editor 
	**/
	function toggleSoftTabs():Dynamic;
	/**
		Get the on-screen length of tab characters.
	**/
	function getTabLength():Float;
	/**
		Set the on-screen length of tab characters. Setting this to a
		{Number} This will override the `editor.tabLength` setting.
	**/
	function setTabLength(tabLength:Float):Dynamic;
	/**
		Determine if the buffer uses hard or soft tabs.
	**/
	function usesSoftTabs():Dynamic;
	/**
		Get the text representing a single level of indent.
	**/
	function getTabText():String;
	/**
		Determine whether lines in this editor are soft-wrapped.
	**/
	function isSoftWrapped():Bool;
	/**
		Enable or disable soft wrapping for this editor.
	**/
	function setSoftWrapped(softWrapped:Bool):Bool;
	/**
		Toggle soft wrapping for this editor
	**/
	function toggleSoftWrapped():Bool;
	/**
		Gets the column at which column will soft wrap 
	**/
	function getSoftWrapColumn():Dynamic;
	/**
		Get the indentation level of the given a buffer row.
	**/
	function indentationForBufferRow():Float;
	/**
		Set the indentation level for the given buffer row.
	**/
	function setIndentationForBufferRow(bufferRow:Float, newLevel:Float, options:{ var preserveLeadingWhitespace : Dynamic; }):Dynamic;
	/**
		Indent rows intersecting selections by one level. 
	**/
	function indentSelectedRows():Dynamic;
	/**
		Outdent rows intersecting selections by one level. 
	**/
	function outdentSelectedRows():Dynamic;
	/**
		Get the indentation level of the given line of text.
	**/
	function indentLevelForLine():haxe.extern.EitherType<String, Float>;
	/**
		Indent rows intersecting selections based on the grammar's suggested
		indent level. 
	**/
	function autoIndentSelectedRows():Dynamic;
	/**
		Get the current {Grammar} of this editor. 
	**/
	function getGrammar():Dynamic;
	/**
		Set the current {Grammar} of this editor.
	**/
	function setGrammar(grammar:atom.Grammar):Dynamic;
	function getRootScopeDescriptor():atom.ScopeDescriptor;
	/**
		Get the syntactic scopeDescriptor for the given position in buffer
		coordinates. Useful with {Config::get}.
	**/
	function scopeDescriptorForBufferPosition(bufferPosition:atom.Point):atom.ScopeDescriptor;
	/**
		Get the range in buffer coordinates of all tokens surrounding the
		cursor that match the given scope selector.
	**/
	function bufferRangeForScopeAtCursor(scopeSelector:String):atom.Range;
	/**
		Determine if the given row is entirely a comment 
	**/
	function isBufferRowCommented():Dynamic;
	/**
		For each selection, copy the selected text. 
	**/
	function copySelectedText():Dynamic;
	/**
		For each selection, cut the selected text. 
	**/
	function cutSelectedText():Dynamic;
	/**
		For each selection, replace the selected text with the contents of
		the clipboard.
	**/
	function pasteText(options:Dynamic):Dynamic;
	/**
		For each selection, if the selection is empty, cut all characters
		of the containing line following the cursor. Otherwise cut the selected
		text. 
	**/
	function cutToEndOfLine():Dynamic;
	/**
		Fold the most recent cursor's row based on its indentation level.
	**/
	function foldCurrentRow():Dynamic;
	/**
		Unfold the most recent cursor's row by one level. 
	**/
	function unfoldCurrentRow():Dynamic;
	/**
		Fold the given row in buffer coordinates based on its indentation
		level.
	**/
	function foldBufferRow(bufferRow:Float):Dynamic;
	/**
		Unfold all folds containing the given row in buffer coordinates.
	**/
	function unfoldBufferRow(bufferRow:Float):Dynamic;
	/**
		For each selection, fold the rows it intersects. 
	**/
	function foldSelectedLines():Dynamic;
	/**
		Fold all foldable lines. 
	**/
	function foldAll():Dynamic;
	/**
		Unfold all existing folds. 
	**/
	function unfoldAll():Dynamic;
	/**
		Fold all foldable lines at the given indent level.
	**/
	function foldAllAtIndentLevel(level:Float):Dynamic;
	/**
		Determine whether the given row in buffer coordinates is foldable.
	**/
	function isFoldableAtBufferRow(bufferRow:Float):Bool;
	/**
		Determine whether the given row in screen coordinates is foldable.
	**/
	function isFoldableAtScreenRow(bufferRow:Float):Bool;
	/**
		Fold the given buffer row if it isn't currently folded, and unfold
		it otherwise. 
	**/
	function toggleFoldAtBufferRow():Dynamic;
	/**
		Determine whether the most recently added cursor's row is folded.
	**/
	function isFoldedAtCursorRow():Bool;
	/**
		Determine whether the given row in buffer coordinates is folded.
	**/
	function isFoldedAtBufferRow(bufferRow:Float):Bool;
	/**
		Determine whether the given row in screen coordinates is folded.
	**/
	function isFoldedAtScreenRow(screenRow:Float):Bool;
	/**
		Add a custom {Gutter}.
	**/
	function addGutter(options:{ var name : String; @:optional
	var priority : Float; @:optional
	var visible : Bool; }):atom.Gutter;
	/**
		Get this editor's gutters.
	**/
	function getGutters():Array<Dynamic>;
	/**
		Get the gutter with the given name.
	**/
	function gutterWithName():atom.Gutter;
	/**
		Scroll the editor to reveal the most recently added cursor if it is
		off-screen.
	**/
	function scrollToCursorPosition(options:{ var center : Dynamic; }):Dynamic;
	/**
		Scrolls the editor to the given buffer position.
	**/
	function scrollToBufferPosition(bufferPosition:Dynamic<Dynamic>, options:{ var center : Dynamic; }):Dynamic;
	/**
		Scrolls the editor to the given screen position.
	**/
	function scrollToScreenPosition(screenPosition:Dynamic<Dynamic>, options:{ var center : Dynamic; }):Dynamic;
	/**
		Scrolls the editor to the top 
	**/
	function scrollToTop():Dynamic;
	/**
		Scrolls the editor to the bottom 
	**/
	function scrollToBottom():Dynamic;
	/**
		Retrieves the greyed out placeholder of a mini editor.
	**/
	function getPlaceholderText():String;
	/**
		Set the greyed out placeholder of a mini editor. Placeholder text
		will be displayed when the editor has no content.
	**/
	function setPlaceholderText(placeholderText:String):Dynamic;
}