/**
	Like {BufferedProcess}, but accepts a Node script as the command
	to run.
**/
package atom;
@:jsRequire("atom", "BufferedNodeProcess") extern class BufferedNodeProcess extends atom.BufferedProcess {
	/**
		Runs the given Node script by spawning a new child process.
	**/
	function new(options:{ var command : String; var args : Array<Dynamic>; var options : Dynamic<Dynamic>; var stdout : haxe.Constraints.Function; var stderr : haxe.Constraints.Function; var exit : haxe.Constraints.Function; }):Void;
}