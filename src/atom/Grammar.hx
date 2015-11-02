/**
	Grammar that tokenizes lines of text.
**/
package atom;
@:jsRequire("atom", "Grammar") extern class Grammar {
	/**
		Invoke the given callback when this grammar is updated due to a
		grammar it depends on being added or removed from the registry.
	**/
	function onDidUpdate(callback:haxe.Constraints.Function):atom.Disposable;
	/**
		Tokenize all lines in the given text.
	**/
	function tokenizeLines(text:String):Array<Dynamic>;
	/**
		Tokenize the line of text.
	**/
	function tokenizeLine(line:String, ruleStack:Array<Dynamic>, firstLine:Bool):Dynamic<Dynamic>;
}