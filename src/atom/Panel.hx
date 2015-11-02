/**
	A container representing a panel on the edges of the editor window.
	You should not create a `Panel` directly, instead use {Workspace::addTopPanel}
	and friends to add panels.
**/
package atom;
@:jsRequire("atom", "Panel") extern class Panel {
	/**
		Destroy and remove this panel from the UI. 
	**/
	function destroy():Dynamic;
	/**
		Invoke the given callback when the pane hidden or shown.
	**/
	function onDidChangeVisible(callback:Bool -> Dynamic):atom.Disposable;
	/**
		Invoke the given callback when the pane is destroyed.
	**/
	function onDidDestroy(callback:atom.Panel -> Dynamic):atom.Disposable;
	function getItem():Dynamic;
	function getPriority():Float;
	function isVisible():Bool;
	/**
		Hide this panel 
	**/
	function hide():Dynamic;
	/**
		Show this panel 
	**/
	function show():Dynamic;
}