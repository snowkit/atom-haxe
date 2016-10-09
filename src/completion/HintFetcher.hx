package completion;

import tides.parse.Haxe;

import completion.Query;

import utils.Promise;
import utils.HTML;
import utils.Log;

using StringTools;

    /** Current (type) hint fetcher from file contents and position.
        TODO Move to tides eventually? */
class HintFetcher {

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

/// State

    public var status:HintStatus = NONE;

    var fetch_promise:Promise<HintFetcher> = null;

    var fetch_reject:String->Void = null;

    public function new(options:HintFetcherOptions) {

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
                if (position_info.brace_start != null &&
                    (position_info.partial_key != null ||
                    (position_info.key_path != null && position_info.key_path.length > 0) ||
                    (position_info.used_keys != null && position_info.used_keys.length > 0))) {
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

            // Make the hints less agressive, only display
            // them after ( and , for call arguments
            // and : after structure key values
        if (hint_kind != NONE) {
            var trimmedPrefix = text.substr(completion_index).trim();
            if (hint_kind == CALL_ARGUMENTS) {
                if (trimmedPrefix != '' && !trimmedPrefix.endsWith(',')) {
                    hint_kind = NONE;
                }
            }
            else if (hint_kind == STRUCTURE_KEY_VALUE) {
                if (!trimmedPrefix.endsWith(':')) {
                    hint_kind = NONE;
                }
            }
        }

            // TODO remove/move node.js dependency
        completion_byte = utils.Bytes.string_length(file_content.substr(0, completion_index));

    } //compute_info

/// Query fetching

    public function fetch(?previous_fetcher:HintFetcher):Promise<HintFetcher> {

            // Create fetch promise
        if (fetch_promise == null) {

            status = FETCHING;

                // Check that we don't just need the same information as previous fetcher
            if (can_use_previous_fetcher(previous_fetcher)) {
                    // If so, fetch info from it
                fetch_promise = fetch_from_previous_fetcher(previous_fetcher);
            }
            else {
                    // Cancel previous fetcher fetching if needed
                if (previous_fetcher != null && previous_fetcher.status == FETCHING) {
                    previous_fetcher.cancel_fetch();
                }

                    // Otherwise perform "fresh" fetch
                fetch_promise = new Promise<HintFetcher>(function(resolve, reject) {

                    if (status == CANCELED) {
                        reject("Fetch was canceled");
                        return;
                    }

                    fetch_reject = reject;

                    haxe.Timer.delay(function() {

                        var query:Promise<QueryResult> = null;

                        if (hint_kind == CALL_ARGUMENTS && position_info.paren_start != null) {

                            var options:QueryOptions = {
                                file: file_path,
                                stdin: file_content,
                                byte: position_info.paren_start + 1
                            };

                            query = Query.run(options);
                        }
                        else if (hint_kind == STRUCTURE_KEY_VALUE) {

                            query = QueryExtras.run_type_then_type_for_key_path({
                                file: file_path,
                                stdin: file_content,
                                byte: position_info.paren_start + 1,
                                key_path: position_info.key_path,
                                arg_index: position_info.number_of_args - 1
                            });

                        }

                        if (query != null) {
                            query.then(function(result:QueryResult) {

                                    // At fetch result/error
                                if (status != CANCELED) {

                                    if (result.kind == TYPE) {

                                        type_query_result = result;

                                        compute_hint();
                                    }

                                    status = FETCHED;
                                    resolve(this);
                                }
                            })
                            .catchError(function(error) {

                                Log.warn('No hint found');

                                // TODO log server error, when
                                // hint debug is enabled
                                Log.error(error);

                                    // At fetch result/error
                                if (status != CANCELED) {
                                    status = BROKEN;
                                    reject('No hint found');
                                }

                            });
                        }
                        else {
                                // Nothing to query/fetch
                            if (status != CANCELED) {
                                status = BROKEN;
                                reject('No hint found');
                            }
                        }

                    }, 0); // Explicit delay to ensure the order of fetcher completion/cancelation

                }); //Promise
            }
        }

        return fetch_promise;

    } //fetch

    public function can_use_previous_fetcher(previous_fetcher:HintFetcher):Bool {

        return previous_fetcher != null
            && previous_fetcher.completion_index == completion_index
            && previous_fetcher.hint_kind == hint_kind
            ;

    } //can_use_previous_fetcher

    function fetch_from_previous_fetcher(previous_fetcher:HintFetcher):Promise<HintFetcher> {

        return new Promise<HintFetcher>(function(resolve, reject) {

            if (status == CANCELED) {
                reject("Fetch was canceled");
                return;
            }

            fetch_reject = reject;

            previous_fetcher.fetch().then(function(previous_fetcher) {

                    // At fetch result
                if (status != CANCELED) {

                    status = FETCHED;

                    type_query_result = previous_fetcher.type_query_result;

                    compute_hint();

                    resolve(this);
                }

            }).catchError(function(error) {

                if (status != CANCELED) {
                    status = BROKEN;

                    reject(error);
                }

            }); //fetch

        }); //Promise

    } //fetch_from_previous_fetcher

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

/// Hint

    function compute_hint():Void {

        if (hint_kind == STRUCTURE_KEY_VALUE) {

            if (type_query_result.parsed_type != null) {
                var type = Haxe.string_from_parsed_type(type_query_result.parsed_type, {hide_params: true, unwrap_nulls: true});

                var flat_arg = position_info.key_path[position_info.key_path.length - 1];

                flat_arg = '<span class="haxe-hint-name">' + HTML.escape(flat_arg) + '</span>';

                if (type_query_result.parsed_type.optional || type_query_result.parsed_type.type == 'Null') {
                    flat_arg = '?' + flat_arg;
                }

                flat_arg += ':<span class="haxe-hint-type">' + HTML.escape(type) + '</span>';

                flat_arg = '<span class="haxe-hint-selected">' + flat_arg + '</span>';

                hint = flat_arg;
            }
        }
        else {

            if (type_query_result.parsed_type.args != null) {

                if (type_query_result.parsed_type.args.length > 0) {

                    var flat_args = [];

                    for (arg in type_query_result.parsed_type.args) {
                        var name = arg.name;
                        if (name == null) name = 'arg' + flat_args.length + 1;
                        var type = null;
                        if (arg.composed_type != null) {
                            type = Haxe.string_from_parsed_type(arg.composed_type, {hide_params: true, unwrap_nulls: true});
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
                            } else {
                                flat_args[i] = '<span class="haxe-hint-not-selected">' + flat_args[i] + '</span>';
                            }
                        }
                    }

                    hint = flat_args.join(',');
                }
                else {
                    hint = '<span class="haxe-hint-no-args">(no arguments)</span>';
                }

            } else {
                hint = null;
            }
        }

    } //compute_hint

}

typedef HintFetcherOptions = {

    var file_path:String;

    var file_content:String;

    var cursor_index:Int;

} //SuggestionsFetcherOptions

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
