/**
	Represents the state of the user interface for the entire window.
	An instance of this class is available via the `atom.workspace` global.
**/
package atom;
@:jsRequire("atom", "Workspace") extern class Workspace {
	/**
		Invoke the given callback with all current and future text
		editors in the workspace.
	**/
	function observeTextEditors(callback:atom.TextEditor -> Dynamic):atom.Disposable;
	/**
		Invoke the given callback with all current and future panes items
		in the workspace.
	**/
	function observePaneItems(callback:Dynamic -> Dynamic):atom.Disposable;
	/**
		Invoke the given callback when the active pane item changes.
	**/
	function onDidChangeActivePaneItem(callback:Dynamic -> Dynamic):atom.Disposable;
	/**
		Invoke the given callback with the current active pane item and
		with all future active pane items in the workspace.
	**/
	function observeActivePaneItem(callback:Dynamic -> Dynamic):atom.Disposable;
	/**
		Invoke the given callback whenever an item is opened. Unlike
		{::onDidAddPaneItem}, observers will be notified for items that are already
		present in the workspace when they are reopened.
	**/
	function onDidOpen(callback:{ var uri : String; var item : Dynamic; var pane : Dynamic; var index : Dynamic; } -> Dynamic):atom.Disposable;
	/**
		Invoke the given callback when a pane is added to the workspace.
	**/
	function onDidAddPane(callback:{ var pane : Dynamic; } -> Dynamic):atom.Disposable;
	/**
		Invoke the given callback before a pane is destroyed in the
		workspace.
	**/
	function onWillDestroyPane(callback:{ var pane : Dynamic; } -> Dynamic):atom.Disposable;
	/**
		Invoke the given callback when a pane is destroyed in the
		workspace.
	**/
	function onDidDestroyPane(callback:{ var pane : Dynamic; } -> Dynamic):atom.Disposable;
	/**
		Invoke the given callback with all current and future panes in the
		workspace.
	**/
	function observePanes(callback:atom.Pane -> Dynamic):atom.Disposable;
	/**
		Invoke the given callback when the active pane changes.
	**/
	function onDidChangeActivePane(callback:atom.Pane -> Dynamic):atom.Disposable;
	/**
		Invoke the given callback with the current active pane and when
		the active pane changes.
	**/
	function observeActivePane(callback:atom.Pane -> Dynamic):atom.Disposable;
	/**
		Invoke the given callback when a pane item is added to the
		workspace.
	**/
	function onDidAddPaneItem(callback:{ var item : Dynamic; var pane : atom.Pane; var index : Float; } -> Dynamic):atom.Disposable;
	/**
		Invoke the given callback when a pane item is about to be
		destroyed, before the user is prompted to save it.
	**/
	function onWillDestroyPaneItem(callback:{ var item : Dynamic; var pane : atom.Pane; var index : Float; } -> Dynamic):atom.Disposable;
	/**
		Invoke the given callback when a pane item is destroyed.
	**/
	function onDidDestroyPaneItem(callback:{ var item : Dynamic; var pane : atom.Pane; var index : Float; } -> Dynamic):atom.Disposable;
	/**
		Invoke the given callback when a text editor is added to the
		workspace.
	**/
	function onDidAddTextEditor(callback:{ var textEditor : atom.TextEditor; var pane : atom.Pane; var index : Float; } -> Dynamic):atom.Disposable;
	/**
		Opens the given URI in Atom asynchronously.
		If the URI is already open, the existing item for that URI will be
		activated. If no URI is given, or no registered opener can open
		the URI, a new empty {TextEditor} will be created.
	**/
	function open(uri:String, options:{ var initialLine : Float; var initialColumn : Float; var split : Dynamic; var activatePane : Bool; var searchAllPanes : Bool; }):atom.TextEditor;
	/**
		Asynchronously reopens the last-closed item's URI if it hasn't already been
		reopened.
	**/
	function reopenItem():Dynamic;
	/**
		Register an opener for a uri.
	**/
	function addOpener(opener:haxe.Constraints.Function):atom.Disposable;
	/**
		Get all pane items in the workspace.
	**/
	function getPaneItems():Array<Dynamic>;
	/**
		Get the active {Pane}'s active item.
	**/
	function getActivePaneItem():Dynamic<Dynamic>;
	/**
		Get all text editors in the workspace.
	**/
	function getTextEditors():Array<Dynamic>;
	/**
		Get the active item if it is an {TextEditor}.
	**/
	function getActiveTextEditor():atom.TextEditor;
	/**
		Get all panes in the workspace.
	**/
	function getPanes():Array<Dynamic>;
	/**
		Get the active {Pane}.
	**/
	function getActivePane():atom.Pane;
	/**
		Make the next pane active. 
	**/
	function activateNextPane():Dynamic;
	/**
		Make the previous pane active. 
	**/
	function activatePreviousPane():Dynamic;
	/**
		Get the first {Pane} with an item for the given URI.
	**/
	function paneForURI(uri:String):atom.Pane;
	/**
		Get the {Pane} containing the given item.
	**/
	function paneForItem(item:Dynamic):atom.Pane;
	/**
		Get an {Array} of all the panel items at the bottom of the editor window. 
	**/
	function getBottomPanels():Dynamic;
	/**
		Adds a panel item to the bottom of the editor window.
	**/
	function addBottomPanel(options:{ var item : Dynamic; @:optional
	var visible : Bool; @:optional
	var priority : Float; }):atom.Panel;
	/**
		Get an {Array} of all the panel items to the left of the editor window. 
	**/
	function getLeftPanels():Dynamic;
	/**
		Adds a panel item to the left of the editor window.
	**/
	function addLeftPanel(options:{ var item : Dynamic; @:optional
	var visible : Bool; @:optional
	var priority : Float; }):atom.Panel;
	/**
		Get an {Array} of all the panel items to the right of the editor window. 
	**/
	function getRightPanels():Dynamic;
	/**
		Adds a panel item to the right of the editor window.
	**/
	function addRightPanel(options:{ var item : Dynamic; @:optional
	var visible : Bool; @:optional
	var priority : Float; }):atom.Panel;
	/**
		Get an {Array} of all the panel items at the top of the editor window. 
	**/
	function getTopPanels():Dynamic;
	/**
		Adds a panel item to the top of the editor window above the tabs.
	**/
	function addTopPanel(options:{ var item : Dynamic; @:optional
	var visible : Bool; @:optional
	var priority : Float; }):atom.Panel;
	/**
		Get an {Array} of all the modal panel items 
	**/
	function getModalPanels():Dynamic;
	/**
		Adds a panel item as a modal dialog.
	**/
	function addModalPanel(options:{ var item : Dynamic; @:optional
	var visible : Bool; @:optional
	var priority : Float; }):atom.Panel;
	function panelForItem(item:Dynamic):Dynamic;
	/**
		Performs a search across all the files in the workspace.
	**/
	function scan(regex:js.RegExp, options:{ var paths : Array<Dynamic>; @:optional
	var onPathsSearched : haxe.Constraints.Function; }, iterator:haxe.Constraints.Function):Dynamic;
	/**
		Performs a replace across all the specified files in the project.
	**/
	function replace(regex:js.RegExp, replacementText:Dynamic, filePaths:Dynamic, iterator:Dynamic<Dynamic> -> Dynamic):Dynamic;
}