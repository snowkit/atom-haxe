/**
	Associates listener functions with commands in a
	context-sensitive way using CSS selectors. You can access a global instance of
	this class via `atom.commands`, and commands registered there will be
	presented in the command palette.
**/
package atom;
@:jsRequire("atom", "CommandRegistry") extern class CommandRegistry {
	/**
		Add one or more command listeners associated with a selector.
	**/
	@:overload(function(target:String, commands:Dynamic<Dynamic>):atom.Disposable { })
	function add(target:String, commandName:String, callback:Dynamic -> Dynamic):atom.Disposable;
	/**
		Find all registered commands matching a query.
	**/
	function findCommands(params:{ var target : Dynamic; }):Array<Dynamic>;
	/**
		Simulate the dispatch of a command on a DOM node.
	**/
	function dispatch(target:Dynamic, commandName:String):Dynamic;
	/**
		Invoke the given callback before dispatching a command event.
	**/
	function onWillDispatch(callback:Dynamic -> Dynamic):Dynamic;
	/**
		Invoke the given callback after dispatching a command event.
	**/
	function onDidDispatch(callback:Dynamic -> Dynamic):Dynamic;
}