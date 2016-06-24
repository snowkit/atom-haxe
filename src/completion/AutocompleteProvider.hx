package completion;

import utils.CancellationToken;
import utils.Promise;
import utils.HTML;

import completion.Query;
import completion.CompletionContext;

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

typedef AutocompletePlusSuggestion = {

    @:optional var text:String;

    @:optional var snippet:String;

    @:optional var displayText:String;

    @:optional var replacementPrefix:String;

    @:optional var type:String;

    @:optional var leftLabel:String;

    @:optional var leftLabelHTML:String;

    @:optional var rightLabel:String;

    @:optional var rightLabelHTML:String;

    @:optional var className:String;

    @:optional var iconHTML:String;

    @:optional var description:String;

    @:optional var descriptionMoreURL:String;

} //Suggestion

    /** Provide code completion to atom's autocomplete-plus plugin */
class AutocompleteProvider {

    var context:CompletionContext = null;

    public function new() {

    } //new

    public function get_suggestions(options:GetSuggestionsOptions):Promise<Array<AutocompletePlusSuggestion>> {

        Log.debug('Get suggestions...');

        return new Promise<Array<AutocompletePlusSuggestion>>(function(resolve, reject) {

            var buffer_pos = options.bufferPosition;
            var text_before_cursor = options.editor.getTextInBufferRange(new Range(new Point(0,0), buffer_pos));
            var text = options.editor.getText();
            var index = text_before_cursor.length;

            var previous_context = context;
            context = new CompletionContext({
                file_path: options.editor.getBuffer().file.path,
                file_content: text,
                cursor_index: index
            });

            context.fetch(previous_context).then(function(context:CompletionContext) {

                if (options.activatedManually ||
                    context.position_info.dot_start != null ||
                    context.position_info.identifier_start != null) {

                    Log.success('Suggestions: ' + context.filtered_suggestions.length + ', Tooltip: ' + context.tooltip);
                    resolve(convert_suggestions(context));
                }
                else {

                    Log.debug('Valid context but better not to display it yet');
                    resolve([]);
                }

            }).catchError(function(error) {

                Log.error(error);

                resolve([]);

            }); //fetch

        }); //Promise

    } //get_suggestions

        /** Get autocomplete-plus suggestions from completion context's suggestions */
    function convert_suggestions(context:CompletionContext):Array<AutocompletePlusSuggestion> {

        var suggestions:Array<AutocompletePlusSuggestion> = [];

        for (item in context.filtered_suggestions) {

            var suggestion:AutocompletePlusSuggestion = {};

            suggestion.text = item.text;
            suggestion.snippet = item.snippet;
            suggestion.displayText = item.display_text;
            suggestion.replacementPrefix = context.prefix;

            if (item.kind == 'static') {
                suggestion.type = 'property';
                suggestion.iconHTML = '<span class="icon-letter">s</span>';
            } else {
                suggestion.type = item.kind;
            }

            suggestion.rightLabel = item.type;
            suggestion.description = item.description;
            suggestion.descriptionMoreURL = item.url;

            suggestions.push(suggestion);

        }

        return suggestions;

    } //convert_suggestions

} //AutocompleteProvider
