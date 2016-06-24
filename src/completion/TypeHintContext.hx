package completion;

class TypeHintContext {

    public var hint(default,null):String;

    public function new() {

    } //new

    public function fetch() {

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
    }

    function compute_hint():Promise<String> {

        trace('COMPUTE HINT');

        return new Promise<String>(function(resolve, reject) {

            if (completion_kind == CALL_ARGUMENTS && position_info.paren_start != null) {
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
