/**
	A notification to the user containing a message and type. 
**/
package atom;
@:jsRequire("atom", "Notification") extern class Notification {
	/**
		Invoke the given callback when the notification is dismissed.
	**/
	function onDidDismiss(callback:haxe.Constraints.Function):atom.Disposable;
	/**
		Invoke the given callback when the notification is displayed.
	**/
	function onDidDisplay(callback:haxe.Constraints.Function):atom.Disposable;
	function getType():String;
	function getMessage():String;
	/**
		Dismisses the notification, removing it from the UI. Calling this programmatically
		will call all callbacks added via `onDidDismiss`. 
	**/
	function dismiss():Dynamic;
}