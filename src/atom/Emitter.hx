/**
	Utility class to be used when implementing event-based APIs that
	allows for handlers registered via `::on` to be invoked with calls to
	`::emit`. Instances of this class are intended to be used internally by
	classes that expose an event-based API.
**/
package atom;
@:jsRequire("atom", "Emitter") extern class Emitter {
	/**
		Construct an emitter.
	**/
	function new():Void;
	/**
		Unsubscribe all handlers. 
	**/
	function dispose():Dynamic;
	/**
		Register the given handler function to be invoked whenever events by
		the given name are emitted via {::emit}.
	**/
	function on(eventName:String, handler:haxe.Constraints.Function):atom.Disposable;
	/**
		Register the given handler function to be invoked *before* all
		other handlers existing at the time of subscription whenever events by the
		given name are emitted via {::emit}.
	**/
	function preempt(eventName:String, handler:haxe.Constraints.Function):atom.Disposable;
	/**
		Invoke handlers registered via {::on} for the given event name.
	**/
	function emit(eventName:Dynamic, value:Dynamic):Dynamic;
}