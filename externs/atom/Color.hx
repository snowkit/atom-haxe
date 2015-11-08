/**
	A simple color class returned from {Config::get} when the value
	at the key path is of type 'color'. 
**/
package atom;
@:jsRequire("atom", "Color") extern class Color {
	/**
		Parse a {String} or {Object} into a {Color}.
	**/
	static function parse(value:String):atom.Color;
	function toHexString():String;
	function toRGBAString():String;
}