/**
	Registry containing one or more grammars. 
**/
package atom;
@:jsRequire("atom", "GrammarRegistry") extern class GrammarRegistry {
	/**
		Invoke the given callback when a grammar is added to the registry.
	**/
	function onDidAddGrammar(callback:atom.Grammar -> Dynamic):atom.Disposable;
	/**
		Invoke the given callback when a grammar is updated due to a grammar
		it depends on being added or removed from the registry.
	**/
	function onDidUpdateGrammar(callback:atom.Grammar -> Dynamic):atom.Disposable;
	/**
		Get all the grammars in this registry.
	**/
	function getGrammars():Array<Dynamic>;
	/**
		Get a grammar with the given scope name.
	**/
	function grammarForScopeName(scopeName:String):atom.Grammar;
	/**
		Add a grammar to this registry.
	**/
	function addGrammar(grammar:atom.Grammar):atom.Disposable;
	/**
		Remove the grammar with the given scope name.
	**/
	function removeGrammarForScopeName(scopeName:String):atom.Grammar;
	/**
		Read a grammar synchronously but don't add it to the registry.
	**/
	function readGrammarSync(grammarPath:String):atom.Grammar;
	/**
		Read a grammar asynchronously but don't add it to the registry.
	**/
	function readGrammar(grammarPath:String, callback:js.Error -> atom.Grammar -> Dynamic):Dynamic;
	/**
		Read a grammar synchronously and add it to this registry.
	**/
	function loadGrammarSync(grammarPath:String):atom.Grammar;
	/**
		Read a grammar asynchronously and add it to the registry.
	**/
	function loadGrammar(grammarPath:String, callback:js.Error -> atom.Grammar -> Dynamic):Dynamic;
}