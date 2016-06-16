package completion;

import utils.Promise;
import utils.Log;

import plugin.Plugin.haxe_server;
import plugin.Plugin.state;

enum CompletionKind {
    DEFAULT;
    USAGE;
    POSITION;
    TOP_LEVEL;
    TYPE;
}

typedef QueryOptions = {

    @:optional var byte:Int;

    @:optional var file:String;

    @:optional var stdin:String;

    @:optional var cwd:String;

    @:optional var args:Array<String>;

}

    /** Query haxe server/compiler to get completion about the code */
class Query {

    public static function run(kind:CompletionKind, options:QueryOptions):Promise<String> {

        return new Promise<String>(function(resolve, reject) {

            var byte = options.byte != null ? options.byte : 0;
            var file = options.file != null ? options.file : '';
            var stdin = options.stdin != null ? options.stdin : null;
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

                // TODO only do this when really needed
                //      We could try without first, then if some
                //      specific error "not in class path" try
                //      again with the added -cp path
                
                // Add -cp file's path because haxe compiler
                // is a bit too picky on lib code if we don't
            if (file != null) {
                args.push('-cp');
                args.push(file.substr(0, file.lastIndexOf('/')));
            }

                // Allow custom args
            if (options.args != null) {
                args = args.concat(options.args);
            }

            args.push('--no-output');
            args.push('--display');

            switch (kind) {
                case USAGE:
                    args.push(file + '@' + byte + '@usage');
                case POSITION:
                    args.push(file + '@' + byte + '@position');
                case TOP_LEVEL:
                    args.push(file + '@' + byte + '@toplevel');
                case TYPE:
                    args.push(file + '@' + byte + '@type');
                default: // FIELD_ACCESS, CALL_ARGUMENT, TYPE_PATH
                    args.push(file + '@' + byte);
            }

            args.push('-D');
            args.push('display-details');

            haxe_server.send(args, stdin).then(function(result) {

                resolve(result);

            }).catchError(function(error) {

                reject(error);

            });

        }); //Promise

    } //run_query

}
