package completion;

import utils.Promise;
import utils.Log;

import plugin.Plugin.haxe_server;
import plugin.Plugin.state;

import completion.QueryResult;

typedef QueryOptionsMore = {

    var test: String;

    var youpi: Int;

}

typedef QueryOptions = {

    @:optional var byte:Int;

    @:optional var file:String;

    @:optional var stdin:String;

    @:optional var cwd:String;

    @:optional var kind:String;

    @:optional var args:Array<String>;

    @:optional var more:QueryOptionsMore;

}

    /** Query haxe server/compiler to get completion about the code */
class Query {

        // A registry of files that needs to be linked with '-cp'
        // when running completion on them. That allows us to prevent adding
        // useless '-cp' on files that don't need it.
    static var cp_files:Map<String,Bool> = new Map<String,Bool>();

    public static function run(options:QueryOptions):Promise<QueryResult> {

        return new Promise<QueryResult>(function(resolve, reject) {

            var byte = options.byte != null ? options.byte : 0;
            var file = options.file != null ? options.file : '';
            var stdin = options.stdin != null ? options.stdin : null;
            var kind = options.kind != null ? options.kind : null;
            var cwd = options.cwd != null ? options.cwd : (state.hxml != null ? state.hxml.cwd : null);
            var args = [];

            if (cwd != null) {
                args.push('--cwd');
                args.push(cwd);
            }

            var hxml_args = state.hxml_as_args();
            if (hxml_args == null) {
                reject('No completion hxml is configured');
                return;
            }

            args = args.concat(hxml_args);

                // Add -cp file's path because haxe compiler
                // is a bit too picky on lib code if we don't
            if (file != null && cp_files.exists(file)) {
                args.push('-cp');
                args.push(file.substr(0, file.lastIndexOf('/')));
            }

                // Allow custom args
            if (options.args != null) {
                args = args.concat(options.args);
            }

            args.push('--no-output');
            args.push('--display');

            if (kind != null && kind.length > 0) {
                args.push(file + '@' + byte + '@' + kind);
            } else {
                args.push(file + '@' + byte);
            }

            args.push('-D');
            args.push('display-details');

            haxe_server.send(args, stdin).then(function(result) {

                resolve(new QueryResult(result));

            }).catchError(function(error) {

                    // Kind of hacky, but when having this error, we can try again
                    // to get completion for this file by adding a -cp entry in hxml
                if (error == 'Error: Display file was not found in class path') {

                    if (!cp_files.exists(file)) {

                        cp_files.set(file, true);
                        run(options).then(resolve).catchError(reject);

                        return;
                    }
                }

                reject(error);

            });

        }); //Promise

    } //run_query

}
