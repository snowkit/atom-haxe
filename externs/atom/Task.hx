/**
	Run a node script in a separate process.
**/
package atom;
@:jsRequire("atom", "Task") extern class Task {
	/**
		A helper method to easily launch and run a task once.
	**/
	static function once(taskPath:String, args:Dynamic):atom.Task;
	/**
		Creates a task. You should probably use {.once}
	**/
	function new(taskPath:String):Void;
	/**
		Starts the task.
	**/
	function start(args:Dynamic, callback:haxe.Constraints.Function):Dynamic;
	/**
		Send message to the task.
	**/
	function send(message:Dynamic):Dynamic;
	/**
		Call a function when an event is emitted by the child process
	**/
	function on(eventName:String, callback:haxe.Constraints.Function):atom.Disposable;
	/**
		Forcefully stop the running task.
	**/
	function terminate():Dynamic;
}