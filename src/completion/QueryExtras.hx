package completion;

import completion.Query;
import completion.QueryResult;
import haxe.io.Path;

import utils.Promise;
import utils.TemporaryFile;

import plugin.Plugin.state;

    /** Extra utilities to query haxe server */
class QueryExtras {

        /** Get fields for the given type path. */
    public static function run_fields_for_type(type_path:String):Promise<QueryResult> {

        var default_contents = 'package tmpcompletion;' + "\nclass TmpCompletion_ { function tmp(){} }";
        var tmp_contents = 'package tmpcompletion;' + "\nclass TmpCompletion_ { function tmp(){" + type_path + '.';
        var file_path = TemporaryFile.get_or_create(Path.join(['tmpcompletion', 'TmpCompletion_.hx']), default_contents);

        var options = {
            file: file_path,
            stdin: tmp_contents,
            byte: utils.Bytes.string_length(tmp_contents)
        };

        return Query.run(options);

    } //run_fields_for_type

}
