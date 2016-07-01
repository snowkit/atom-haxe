package completion;

import completion.Query;
import completion.QueryResult;
import haxe.io.Path;

import utils.Promise;
import utils.TemporaryFile;

import tides.parse.Haxe;

import plugin.Plugin.state;

using StringTools;

    /** Extra utilities to query haxe server */
class QueryExtras {

    static var contents_template = "package tmpcompletion;\nclass TmpCompletion_ { function tmp(){|} }";

        /** Get fields for the given type path. */
    public static function run_fields_for_type(options:{type_path:String, is_instance:Bool, ?imports:Array<String>, ?key_path: Array<String>}):Promise<QueryResult> {

        if (options.is_instance) {
            if (options.imports != null) {
                var tmp_contents = contents_template.substr(0, contents_template.indexOf('|'));

                    // Add imports
                var imports_code = [];
                for (item in options.imports) {
                    imports_code.push('import ' + item + ';');
                }
                tmp_contents =
                    tmp_contents.substring(0, tmp_contents.indexOf(';')) + ";\n" +
                    imports_code.join("\n") + "\n" +
                    tmp_contents.substring(tmp_contents.indexOf(';') + 1)
                ;

                var dot_index = options.type_path.lastIndexOf('.');
                if (dot_index == -1) {
                    tmp_contents += 'var v:' + options.type_path + '; v.';
                } else {
                    tmp_contents += 'var v:' + options.type_path.substring(dot_index + 1) + '; v.';
                }

                if (options.key_path != null && options.key_path.length > 0) {
                    tmp_contents += options.key_path.join('.') + '.';
                }

                var file_path = TemporaryFile.get_or_create(Path.join(['tmpcompletion', 'TmpCompletion_.hx']), contents_template.replace('|', ''));

                var options = {
                    file: file_path,
                    stdin: tmp_contents,
                    byte: utils.Bytes.string_length(tmp_contents)
                };

                return Query.run(options);

            } else {
                var last_dot_index = options.type_path.lastIndexOf('.');
                if (last_dot_index != -1) {
                    var package_name = options.type_path.substr(0, last_dot_index);
                    return new Promise<QueryResult>(function(resolve, reject) {
                        run_fields_for_type({
                            type_path: package_name,
                            is_instance: false,
                            key_path: options.key_path
                        })
                        .then(function(result:QueryResult) {
                            var imports = [];
                            if (result.kind == LIST) {
                                for (item_ in result.parsed_list) {
                                    if (item_.kind == TYPE) {
                                        var item:QueryResultListCompletionItem = cast item_;
                                        imports.push(package_name + '.' + item.name);
                                    }
                                }
                            }

                            run_fields_for_type({
                                type_path: options.type_path,
                                is_instance: true,
                                imports: imports,
                                key_path: options.key_path
                            })
                            .then(function(result) {
                                resolve(result);
                            })
                            .catchError(function(error) {
                                reject(error);
                            });
                        })
                        .catchError(function(error) {
                            reject(error);
                        });
                    });
                }
                else {
                    return run_fields_for_type({
                        type_path: options.type_path,
                        is_instance: true,
                        imports: [],
                        key_path: options.key_path
                    });
                }
            }
        }
        else {
            var tmp_contents = contents_template.substr(0, contents_template.indexOf('|'));
            tmp_contents += options.type_path + '.';

            var file_path = TemporaryFile.get_or_create(Path.join(['tmpcompletion', 'TmpCompletion_.hx']), contents_template.replace('|', ''));

            var options = {
                file: file_path,
                stdin: tmp_contents,
                byte: utils.Bytes.string_length(tmp_contents)
            };

            return Query.run(options);
        }

    } //run_fields_for_type

        /** Get fields from a given key path after
            getting type of a function argument. */
    public static function run_type_then_fields_for_key_path(options:QueryWithKeyPathOptions):Promise<QueryResult> {

        return new Promise<QueryResult>(function(resolve, reject) {

            Query.run(options).then(function(result:QueryResult) {

                if (result.kind == TYPE) {
                    if (result.parsed_type.args != null) {
                        if (result.parsed_type.args.length > options.arg_index) {

                            var full_type = Haxe.string_from_parsed_type(result.parsed_type.args[options.arg_index]);

                            run_fields_for_type({
                                type_path: full_type,
                                is_instance: true,
                                key_path: options.key_path
                            }).then(function(result:QueryResult) {
                                resolve(result);
                            }).catchError(function(error) {
                                reject(error);
                            });
                        }
                        else {
                            reject('Result function type doesn\'t have enough arguments');
                        }
                    }
                    else {
                        reject('Result type is not a function');
                    }

                }
                else {
                    reject('Result is not a type');
                }

            }).catchError(function(error) {

                reject(error);

            });

        }); //Promise

    } //run_type_then_key_path

}

typedef QueryWithKeyPathOptions = {
    > QueryOptions,

    var key_path:Array<String>;
    var arg_index:Int;
}
