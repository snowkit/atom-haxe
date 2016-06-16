package completion;

import tides.parse.Haxe;

import completion.Query;

typedef CompletionContextOptions = {

    var file_path:String;

    var file_content:String;

    var cursor_index:Int;

} //CompletionContextOptions

enum CompletionKind {
    DOT_PACKAGE;
    DOT_PROPERTY;
    STRUCTURE_KEYS;
    STRUCTURE_KEY_VALUE;
    ASSIGN_VALUE;
    CALL_ARGUMENTS;
    TOP_LEVEL;
}

    /** Current completion context: file contents, cursor position...
        and related utilities to provide additional info. */
class CompletionContext {

/// Initial info

    var file_path(default,null):String;

    var file_content(default,null):String;

    var cursor_index(default,null):Int;

/// Computed info

    var completion_index(default,null):Int = -1;

    var completion_kind(default,null):CompletionKind = null;

    var position_info(default,null):HaxePositionInfo;

    var prefix(default,null):String = '';

    public function new(options:CompletionContextOptions) {

        file_path = options.file_path;
        file_content = options.file_content;
        cursor_index = options.cursor_index;

        compute_completion_index();

    } //new

    function compute_completion_index():Void {

            // We only care about the text before index
        var text = file_content.substr(0, cursor_index);

            // Compute position info
        position_info = Haxe.parse_position_info(text, cursor_index);

        trace(position_info);

        switch (position_info.kind) {

            case DOT_ACCESS:
                completion_index = position_info.dot_start + 1;
                completion_kind = DOT_PROPERTY;

            case FUNCTION_CALL:
                completion_index = position_info.brace_start;
                completion_kind = CALL_ARGUMENTS;
                if (position_info.brace_start != null) {
                    completion_index = position_info.brace_start + 1;
                    if (position_info.partial_key != null) {
                        completion_kind = STRUCTURE_KEYS;
                    } else {
                        completion_kind = STRUCTURE_KEY_VALUE;
                    }

                } else {
                    completion_index = position_info.paren_start + 1;
                    completion_kind = TOP_LEVEL;
                }

            case VARIABLE_ASSIGN:
                if (position_info.brace_start != null) {
                    completion_index = position_info.brace_start + 1;
                    if (position_info.partial_key != null) {
                        completion_kind = STRUCTURE_KEYS;
                    } else {
                        completion_kind = STRUCTURE_KEY_VALUE;
                    }

                } else {
                    completion_index = position_info.assign_start + 1;
                    completion_kind = TOP_LEVEL;
                }

            default:
                completion_index = cursor_index;
                completion_kind = TOP_LEVEL;

        }

        if (cursor_index > completion_index) {
            prefix = text.substring(completion_index, cursor_index);
        }

    } //compute_info

}
