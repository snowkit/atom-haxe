package completion;

import tides.parse.Haxe;

typedef CompletionContextOptions = {

    var file_path:String;

    var file_content:String;

    var cursor_index:Int;

} //CompletionContextOptions

    /** Current completion context: file contents, cursor position...
        and related utilities to provide additional info. */
class CompletionContext {

/// Initial info

    var file_path(default,null):String;

    var file_content(default,null):String;

    var cursor_index(default,null):Int;

/// Computed info

    var completion_index(default,null):Int;

    public function new(options:CompletionContextOptions) {

        file_path = options.file_path;
        file_content = options.file_content;
        cursor_index = options.cursor_index;

        compute_completion_index();

    } //new

    function compute_completion_index():Void {

            // We only care about the text before index
        var text = file_content.substr(0, cursor_index);
            // Don't provide suggestions if inside a string or comment
        text = Haxe.code_with_empty_comments_and_strings(text);
            // Look for a dot
        if (RE.ENDS_WITH_DOT_IDENTIFIER.match(text)) {

                // Don't query haxe when writing a number containing dots
            if (RE.ENDS_WITH_DOT_NUMBER.match(' '+text)) {
                completion_index = -1;
            }
                // Don't query haxe when writing a package declaration
            else if (RE.ENDS_WITH_PARTIAL_PACKAGE_DECL.match(' '+text)) {
                completion_index = -1;
            }
            else {
                completion_index = cursor_index - RE.ENDS_WITH_DOT_IDENTIFIER.matched(1).length;
            }

        }
        else {
                // Look for parens open
            var position_info = Haxe.parse_position_info(text, cursor_index);

            // TODO
        }

    } //compute_info

}

@:allow(completion.CompletionContext)
private class RE {

    public static var ENDS_WITH_DOT_IDENTIFIER:EReg = ~/\.([a-zA-Z_0-9]*)$/;

    public static var ENDS_WITH_DOT_NUMBER:EReg = ~/[^a-zA-Z0-9_\]\)]([\.0-9]+)$/;

    public static var ENDS_WITH_PARTIAL_PACKAGE_DECL:EReg = ~/[^a-zA-Z0-9_]package\s+([a-zA-Z_0-9]+(\.[a-zA-Z_0-9]+)*)\.([a-zA-Z_0-9]*)$/;

    public static var BEGINS_WITH_KEY:EReg = ~/^([a-zA-Z0-9_]+)\s*:/;

    public static var ENDS_WITH_ALPHANUMERIC:EReg = ~/([A-Za-z0-9_]+)$/;

} //RE
