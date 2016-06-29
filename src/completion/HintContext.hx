package completion;

import tides.parse.Haxe;

import completion.Query;

import utils.Promise;
import utils.HTML;

import js.node.Buffer;

using StringTools;

    /** Current (type) hint context from file contents and position.
        TODO Move to tides eventually? */
class HintContext {

/// Initial info

    public var file_path(default,null):String;

    public var file_content(default,null):String;

    public var cursor_index(default,null):Int;

/// Computed info

    public var hint(default,null):String;

    public var completion_index(default,null):Int = -1;

    public var completion_byte(default,null):Int = -1;

    public var hint_kind(default,null):HintKind = null;

    public var position_info(default,null):HaxeCursorInfo;

    public var type_query_result(default,null):QueryResult;

    public var status:HintStatus = NONE;

    public function new(options:HintContextOptions) {

        file_path = options.file_path;
        file_content = options.file_content;
        cursor_index = options.cursor_index;

        compute_info();

    } //new

    function compute_info():Void {

            // We only care about the text before index
        var text = file_content.substr(0, cursor_index);
            // Compute position info
        position_info = Haxe.parse_cursor_info(text, cursor_index);

        completion_index = -1;
        hint_kind = NONE;

        switch (position_info.kind) {
            case FUNCTION_CALL:
                if (position_info.brace_start != null) {
                    completion_index = position_info.brace_start + 1;
                    if (position_info.partial_key == null) {
                        hint_kind = STRUCTURE_KEY_VALUE;
                    }

                } else if (position_info.paren_start != null) {
                    completion_index = position_info.paren_start + 1;
                    hint_kind = CALL_ARGUMENTS;
                }

            default:
        }

            // TODO remove/move node.js dependency
        completion_byte = Buffer.byteLength(file_content.substr(0, completion_index), 'utf8');

    } //compute_info

    public function fetch(previous_context:HintContext):Promise<HintContext> {

        return new Promise<HintContext>(function(resolve, reject) {

            compute_hint().then(function(result) {
                    // Set hint
                hint = result;
                    // Resolve with hint
                if (status != CANCELED) {
                    status = FETCHED;
                    resolve(this);
                }
            })
            .catchError(function(error) {
                    // Still resolve, even without hint
                if (status != CANCELED) {
                    status = FETCHED;
                    resolve(this);
                }
            });

        });
    } //fetch

    public function can_use_previous_context(previous_context:HintContext):Bool {

        return previous_context != null
            && previous_context.completion_index == completion_index
            && previous_context.hint_kind == hint_kind
            && hint_kind == CALL_ARGUMENTS // TODO remove this line/handle other cases
            ;

    } //can_use_previous_context

    function compute_hint():Promise<String> {

        return new Promise<String>(function(resolve, reject) {

            if (hint_kind == CALL_ARGUMENTS && position_info.paren_start != null) {
                var options:QueryOptions = {
                    file: file_path,
                    stdin: file_content,
                    byte: position_info.paren_start + 1
                };

                Query.run(options).then(function(result:QueryResult) {
                    if (result.kind == TYPE) {
                        type_query_result = result;

                        if (result.parsed_type.args != null) {

                            var flat_args = [];

                            for (arg in result.parsed_type.args) {
                                var name = arg.name;
                                if (name == null) name = 'arg' + flat_args.length + 1;
                                var type = null;
                                if (arg.composed_type != null) {
                                    type = Haxe.string_from_parsed_type(arg.composed_type, {compact: true});
                                } else if (arg.type != null) {
                                    type = arg.type;
                                }
                                var flat_arg = name;

                                flat_arg = '<span class="haxe-hint-name">' + HTML.escape(flat_arg) + '</span>';

                                if (arg.optional) {
                                    flat_arg = '?' + flat_arg;
                                }

                                if (type != null && type.length > 0) {
                                    flat_arg += ':<span class="haxe-hint-type">' + HTML.escape(type) + '</span>';
                                }

                                flat_args.push(flat_arg);
                            }

                            if (position_info.number_of_args != null) {
                                for (i in 0...flat_args.length) {
                                    if (position_info.number_of_args == i + 1) {
                                        flat_args[i] = '<span class="haxe-hint-selected">' + flat_args[i] + '</span>';
                                    }
                                }
                            }

                            resolve(flat_args.join(', '));

                        } else {
                            resolve(null);
                        }
                    }
                    else {
                        resolve(null);
                    }

                }).catchError(function(error) {
                    reject(error);
                });
            }
            else {

                resolve(null);
            }

        }); // Promise

    } //compute_hint

}

typedef HintContextOptions = {

    var file_path:String;

    var file_content:String;

    var cursor_index:Int;

} //SuggestionsContextOptions

enum HintKind {
    NONE;
    CALL_ARGUMENTS;
    STRUCTURE_KEY_VALUE;
}

enum HintStatus {
    NONE;
    FETCHING;
    FETCHED;
    CANCELED;
    BROKEN;
}
