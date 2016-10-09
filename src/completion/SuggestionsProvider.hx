package completion;

import utils.CancellationToken;
import utils.Promise;
import utils.HTML;

import completion.Query;
import completion.SuggestionsFetcher;

import atom.TextEditor;
import atom.Range;
import atom.Point;
import atom.TextBuffer;

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

    /** Provide code completion suggestions.
        Depends on atom. */
class SuggestionsProvider {

    var fetcher:SuggestionsFetcher = null;

    public function new() {

    } //new

    public function get_suggestions(options:GetSuggestionsOptions):Promise<Array<AutocompletePlusSuggestion>> {

        Log.debug('Get suggestions...');

        return new Promise<Array<AutocompletePlusSuggestion>>(function(resolve, reject) {

            var buffer_pos = options.bufferPosition;
            var text_before_cursor = options.editor.getTextInBufferRange(new Range(new Point(0,0), buffer_pos));
            var text = options.editor.getText();
            var index = text_before_cursor.length;

            var previous_fetcher = fetcher;
            fetcher = new SuggestionsFetcher({
                file_path: options.editor.getBuffer().file.path,
                file_content: text,
                cursor_index: index
            });

            fetcher.fetch(previous_fetcher).then(function(fetcher:SuggestionsFetcher) {

                if (options.activatedManually ||
                    fetcher.position_info.dot_start != null ||
                    fetcher.position_info.identifier_start != null ||
                    fetcher.position_info.brace_start != null) {

                    Log.success('Suggestions: ' + fetcher.filtered_suggestions.length);
                    resolve(convert_suggestions(fetcher));
                }
                else {

                    Log.debug('Valid fetcher but better not to display it yet');
                    resolve([]);
                }

            }).catchError(function(error) {

                Log.warn(error);

                resolve([]);

            }); //fetch

        }); //Promise

    } //get_suggestions

        /** Get autocomplete-plus suggestions from completion fetcher's suggestions */
    function convert_suggestions(fetcher:SuggestionsFetcher):Array<AutocompletePlusSuggestion> {

        var suggestions:Array<AutocompletePlusSuggestion> = [];

        for (item in fetcher.filtered_suggestions) {

            var suggestion:AutocompletePlusSuggestion = {};

            suggestion.text = item.text;
            suggestion.snippet = item.snippet;
            suggestion.displayText = item.display_text;
            suggestion.replacementPrefix = fetcher.prefix;

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

    public function did_insert_suggestion(options) {

            // Get editor state
        var editor:TextEditor = options.editor;
        var position = options.triggerPosition;
        var buffer_pos = editor.getLastCursor().getBufferPosition().toArray();
        var suggestion = options.suggestion;

            // When inserting a signature as snippet, remove the contents of the signature
            // because it is usually annoying, especially with optional arguments.
            // The type hinting should be enough to know what to type next
            // And in case the developer really wants to restore the full snippet,
            // ctrl/cmd + z shortcut will do this job
        var range = new Range(new Point(position.row, position.column), buffer_pos);
        var inserted_text:String = editor.getTextInBufferRange(range);
        var sig_start = inserted_text.indexOf('(');
        if (sig_start > -1) {
            var following_text:String = editor.getTextInBufferRange(new Range(new Point(position.row, position.column), editor.getBuffer().getEndPosition().toArray()));
            var sig_end = following_text.indexOf(')');
            if (sig_end != -1) {
                inserted_text = following_text.substring(sig_start + 1, sig_end);
                editor.setTextInBufferRange(new Range(new Point(position.row, position.column+sig_start+1), new Point(position.row, position.column+sig_start+inserted_text.length+1)), '');

                    // Ensure the cursor is inside the parenthesis
                editor.setCursorBufferPosition(new Point(position.row, position.column+sig_start+1));
            }
        }

    } //did_insert_suggestion

} //AutocompleteProvider
