/**
	Represents the clipboard used for copying and pasting in Atom.
**/
package atom;
@:jsRequire("atom", "Clipboard") extern class Clipboard {
	/**
		Write the given text to the clipboard.
	**/
	function write(text:String, metadata:Dynamic):Dynamic;
	/**
		Read the text from the clipboard.
	**/
	function read():String;
	/**
		Read the text from the clipboard and return both the text and the
		associated metadata.
	**/
	function readWithMetadata():Dynamic<Dynamic>;
}