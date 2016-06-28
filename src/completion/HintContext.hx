package completion;

import tides.parse.Haxe;

import completion.Query;

import utils.Promise;

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

    public var status:HintStatus = NONE;

    public function new() {

    } //new

    public function fetch():Promise<HintContext> {

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
    }

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
                        resolve(Haxe.string_from_parsed_type(result.parsed_type));
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

enum HintKind {
    CALL_ARGUMENTS;
}

enum HintStatus {
    NONE;
    FETCHING;
    FETCHED;
    CANCELED;
    BROKEN;
}
