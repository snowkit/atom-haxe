package completion;

import utils.CancellationToken;
import utils.Promise;

import completion.Query;

import atom.TextEditor;
import atom.Range;
import atom.Point;

import js.node.Buffer;

import utils.Log;

using StringTools;

typedef GetSuggestionsOptions = {

    var editor:TextEditor;

    var bufferPosition:Point;

    var scopeDescriptor:Array<String>;

    var prefix:String;

    var activatedManually:Bool;

} //GetSuggestionsOptions

typedef Suggestion = {



} //Suggestion

class AutocompleteProvider {

    var last_query_token:CancellationToken;

    public function new() {

    } //new

    public function get_suggestions(options:GetSuggestionsOptions):Promise<Array<Suggestion>> {

        Log.debug('Get suggestions...');

        // TODO cancel previous request when running a new one

        return new Promise<Array<Suggestion>>(function(resolve, reject) {

            var buffer_pos = options.bufferPosition;
            var text_before_cursor = options.editor.getTextInBufferRange(new Range(new Point(0,0), buffer_pos));
            var text = options.editor.getText();
            var index = text_before_cursor.length;

            Query.run(DEFAULT, {
                file: options.editor.getBuffer().file.path,
                stdin: text,
                byte: Buffer.byteLength(text_before_cursor, 'utf8')
            })
            .then(function(result) {

                Log.debug(result);

            })
            .catchError(function(error) {

                Log.warn(error);

            });

        }); //Promise

    } //get_suggestions

} //AutocompleteProvider
