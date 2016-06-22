package completion;

import tides.parse.Haxe;

import completion.Query;
import completion.QueryResult;

import utils.Promise;
import utils.Fuzzaldrin;
import utils.Log;

import js.node.Buffer;

typedef CompletionContextOptions = {

    var file_path:String;

    var file_content:String;

    var cursor_index:Int;

} //CompletionContextOptions

    /** Every possible kinds of completion. This enum doesn't
        necessarily reflect what is possible with haxe compiler/server queries.
        Plugin could decide to use or not use the haxe compiler depending
        on the completion kind at the current position. */
enum CompletionKind {
    DOT_PACKAGE;
    DOT_PROPERTY;
    STRUCTURE_KEYS;
    STRUCTURE_KEY_VALUE;
    ASSIGN_VALUE;
    CALL_ARGUMENTS;
    TOP_LEVEL;
}

enum CompletionStatus {
    NONE;
    FETCHING;
    FETCHED;
    CANCELED;
    BROKEN;
}

    /** Suggestion object. Mainly inspired from atom's autocomplete-plus
        suggestion format, but should ideally provide all the
        required data for any code completion/IDE API. */
typedef Suggestion = {

        /** A snippet string. This will allow users to tab through
            function arguments or other options. */
    @:optional var snippet:String;

        /** The text which will be inserted into the editor,
            in place of the prefix */
    @:optional var text:String;

        /** A string that will show in the UI for this suggestion. */
    @:optional var display_text:String;

        /** The type of suggestion. May change the display in UI like
            adding an icon etc... */
    @:optional var type:String;

        /** Text displayed before the suggestion. */
    @:optional var left_label:String;

        /** Text displayed after the suggestion. */
    @:optional var right_label:String;

        /** Additional description/documentation to be displayed. */
    @:optional var description:String;

        /** Url to read further documentation. */
    @:optional var url:String;

        /** Related haxe query result item, if any. */
    @:optional var query_result_item:QueryResultListItem;

} //Suggestion

    /** Current completion context: file contents, cursor position...
        and related utilities to provide additional info. */
class CompletionContext {

/// Initial info

    public var file_path(default,null):String;

    public var file_content(default,null):String;

    public var cursor_index(default,null):Int;

/// Computed info

    public var completion_index(default,null):Int = -1;

    public var completion_byte(default,null):Int = -1;

    public var completion_kind(default,null):CompletionKind = null;

    public var position_info(default,null):HaxeCursorInfo;

    public var prefix(default,null):String = '';

    public var tooltip(default,null):String;

    public var suggestions(default,null):Array<Suggestion>;

    public var filtered_suggestions(default,null):Array<Suggestion>;

/// State

    public var status:CompletionStatus = NONE;

    var fetch_promise:Promise<CompletionContext> = null;

    var fetch_reject:String->Void = null;

    public function new(options:CompletionContextOptions) {

        file_path = options.file_path;
        file_content = options.file_content;
        cursor_index = options.cursor_index;

        compute_info();

    } //new

/// Contextual info

    function compute_info():Void {

            // We only care about the text before index
        var text = Haxe.code_with_empty_comments_and_strings(file_content.substr(0, cursor_index));
            // Compute position info
        position_info = Haxe.parse_cursor_info(text, cursor_index);

        trace(position_info);

        switch (position_info.kind) {

            case DOT_ACCESS:
                completion_index = position_info.dot_start + 1;
                completion_kind = DOT_PROPERTY;

            case FUNCTION_CALL:
                if (position_info.brace_start != null) {
                    completion_index = position_info.brace_start + 1;
                    if (position_info.partial_key != null) {
                        completion_kind = STRUCTURE_KEYS;
                    } else {
                        completion_kind = STRUCTURE_KEY_VALUE;
                    }

                } else {
                    if (position_info.identifier_start != null) {
                        completion_index = position_info.identifier_start;
                    } else {
                        completion_index = position_info.paren_start + 1;
                    }
                    completion_kind = CALL_ARGUMENTS;
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
                    if (position_info.identifier_start != null) {
                        completion_index = position_info.identifier_start;
                    } else {
                        completion_index = cursor_index;
                    }
                    completion_kind = TOP_LEVEL;
                }

            default:
                if (position_info.identifier_start != null) {
                    completion_index = position_info.identifier_start;
                } else {
                    completion_index = cursor_index;
                }
                completion_kind = TOP_LEVEL;

        }

        if (position_info.identifier_start != null && cursor_index > position_info.identifier_start) {
            prefix = text.substring(position_info.identifier_start, cursor_index);
            trace('cursor_index='+cursor_index + ' completion_index='+completion_index + ' prefix='+text.substring(position_info.identifier_start, cursor_index));
        }

            // TODO remove/move node.js dependency
        completion_byte = Buffer.byteLength(file_content.substr(0, completion_index), 'utf8');

        trace('kind: ' + completion_kind + ' / index: ' + completion_index);

    } //compute_info

/// Query fetching

        /** Fetch completion data and return a promise. If data is already
            fetched/fetching, returns the related promise instead of fetching
            a second time. */
    public function fetch(?previous_context:CompletionContext):Promise<CompletionContext> {

            // Create fetch promise
        if (fetch_promise == null) {

            status = FETCHING;

                // Check that we don't just need the same information as previous context
            if (can_use_previous_context(previous_context)) {
                    // If so, fetch info from it
                fetch_promise = fetch_from_previous_context(previous_context);
            }
            else {
                    // Cancel previous context fetching if needed
                if (previous_context != null && previous_context.status == FETCHING) {
                    previous_context.cancel_fetch();
                }

                    // Otherwise perform "fresh" fetch
                fetch_promise = new Promise<CompletionContext>(function(resolve, reject) {

                    if (status == CANCELED) {
                        reject("Fetch was canceled");
                        return;
                    }

                    fetch_reject = reject;

                    haxe.Timer.delay(function() {

                        var options:QueryOptions = {
                            file: file_path,
                            stdin: file_content,
                            byte: completion_byte
                        };

                        switch (completion_kind) {
                            case TOP_LEVEL, STRUCTURE_KEY_VALUE, ASSIGN_VALUE:
                                options.kind = 'toplevel';
                            default:
                        }

                        Query.run(options)
                        .then(function(result) {

                                // At fetch result/error
                            if (status != CANCELED) {

                                compute_suggestions_from_query_result(result);

                                tooltip = null;
                                compute_filtered_suggestions();

                                status = FETCHED;
                                resolve(this);
                            }

                        })
                        .catchError(function(error) {

                            Log.warn('No completion found');

                            // TODO log server error, when
                            // completion debug is enabled

                                // At fetch result/error
                            if (status != CANCELED) {
                                status = BROKEN;
                                reject('No completion found');
                            }

                        });

                    }, 0); // Explicit delay to ensure the order of context completion/cancelation

                }); //Promise
            }

        }

        return fetch_promise;

    } //fetch

    function can_use_previous_context(previous_context:CompletionContext):Bool {

        return previous_context != null
            && previous_context.completion_index == completion_index
            && previous_context.completion_kind == completion_kind;

    } //can_use_previous_context

    function fetch_from_previous_context(previous_context:CompletionContext):Promise<CompletionContext> {

        return new Promise<CompletionContext>(function(resolve, reject) {

            if (status == CANCELED) {
                reject("Fetch was canceled");
                return;
            }

            fetch_reject = reject;

            previous_context.fetch().then(function(previous_context) {

                    // At fetch result
                if (status != CANCELED) {

                    status = FETCHED;

                    suggestions = previous_context.suggestions;
                    tooltip = previous_context.tooltip;

                    if (previous_context.prefix == prefix) {
                        filtered_suggestions = previous_context.filtered_suggestions;
                    } else {
                        compute_filtered_suggestions();
                    }

                    resolve(this);
                }

            }).catchError(function(error) {

                if (status != CANCELED) {
                    status = BROKEN;

                    reject(error);
                }

            }); //fetch

        }); //Promise

    } //fetch_from_previous_context

    function cancel_fetch():Void {

        if (status == FETCHING) {
            status = CANCELED;

            if (fetch_reject != null) {
                var reject = fetch_reject;
                fetch_reject = null;
                reject("Fetch was canceled");
            }
        }
        else {
            status = CANCELED;
        }

    } //cancel_fetch

    function compute_filtered_suggestions() {

        filtered_suggestions = Fuzzaldrin.filter(suggestions, prefix, {key: 'text'});

    } //compute_filtered_suggestions

/// Suggestions

    function compute_suggestions_from_query_result(result:QueryResult):Void {

        suggestions = [];

        if (result.kind == LIST) {

            for (item_ in result.parsed_list) {

                switch (item_.kind) {
                    case VARIABLE,
                         METHOD,
                         PACKAGE,
                         LOCAL,
                         GLOBAL,
                         MEMBER,
                         STATIC,
                         TYPE,
                         ENUM,
                         VALUE:

                        var item:QueryResultListCompletionItem = cast item_;

                        var suggestion:Suggestion = {};
                        suggestion.text = item.name;
                        suggestion.display_text = item.name;
                        suggestion.right_label = Haxe.string_from_parsed_type(item.type);
                        suggestion.description = item.description;

                        suggestions.push(suggestion);

                    case POSITION:
                        // Nothing to do
                }

            }

        }

    } //compute_suggestions_from_query_result

}
