package lib;

@:jsRequire("ansi-to-html", "Convert")
extern class AnsiToHtml {

    function new();

        /** Convert ANSI input to HTML string */
    function toHtml(input:String):String;

}
