package completion;

import utils.Promise;

import plugin.Plugin.haxe_server;

enum CompletionKind {
    FIELD_ACCESS;
    CALL_ARGUMENT;
    TYPE_PATH;
    USAGE;
    POSITION;
    TOP_LEVEL;
}

typedef QueryOptions = {

}

    /** Query haxe server/compiler to get completion about the code */
class Query {

    public static function run_query(kind:CompletionKind, options:QueryOptions):Promise<String> {

        return new Promise<String>(function(resolve, reject) {



        }); //Promise

    } //run_query

}
