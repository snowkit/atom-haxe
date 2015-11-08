/**
	A wrapper which provides standard error/output line buffering for
	Node's ChildProcess.
**/
package atom;
@:jsRequire("atom", "BufferedProcess") extern class BufferedProcess {
	/**
		Runs the given command by spawning a new child process.
	**/
	function new(options:{ var command : String; var args : Array<Dynamic>; var options : Dynamic<Dynamic>; var stdout : String -> Dynamic; var stderr : String -> Dynamic; var exit : Float -> Dynamic; }):Void;
	/**
		Will call your callback when an error will be raised by the process.
		Usually this is due to the command not being available or not on the PATH.
		You can call `handle()` on the object passed to your callback to indicate
		that you have handled this error.
	**/
	function onWillThrowError(callback:{ var error : Dynamic<Dynamic>; var handle : haxe.Constraints.Function; } -> Dynamic):atom.Disposable;
	/**
		Terminate the process. 
	**/
	function kill():Dynamic;
}