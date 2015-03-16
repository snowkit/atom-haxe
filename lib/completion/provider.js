
        // node built in
var   path = require('path')
    , crypto = require('crypto')
        // lib code
    , query = require('./query')
    , debug = require('./debug')
    , state = require('../haxe-state')
    , signatures = require('../parsing/signatures')
    , escape = require('../utils/escape-html')
        // dep code
    , xml2js = require('xml2js')
    , fs = require('fs-extra')
    , filter = require('fuzzaldrin').filter


var REGEX_ENDS_WITH_DOT_IDENTIFIER = /\.([a-zA-Z_0-9]*)$/;


module.exports = {

    selector: '.source.haxe',
    disableForSelector: '.source.haxe .comment',
    inclusionPriority: 1,
    excludeLowerPriority: true,
    prefixes:['.','('],

    last_completion_index: null,
    last_suggestions: null,
    last_suggestions_kind: null,

    getSuggestions : function(opt) {

        if(!state.hxml_cwd) return [];
        if(!state.hxml_content && !state.hxml_file) return [];

        var _file = opt.editor.buffer.file.path;
        if(!_file) return [];

        return new Promise( function(resolve, reject) {

            var buffer_pos = opt.bufferPosition.toArray();
            var pretext = opt.editor.getTextInBufferRange( [ [0,0], buffer_pos] );
            var index = pretext.length;

            var position_info = this._position_info_from_text_and_index(pretext, index);

                // If a new index is provided, use it
            if (position_info) {
                index = position_info.index;
            }

                // Check if we should run haxe autocomplete again
            if (this.last_completion_index != null) {
                if (this.last_completion_index === index) {
                        // No need to recompute haxe completion
                        // Just filter and resolve
                    var filtered = this._filter_suggestions(this.last_suggestions, this.last_suggestions_kind, opt, position_info);
                    return resolve(filtered);
                }
            }
            this.last_completion_index = index;

                // We need to perform a new haxe query
                // Save file first
            var save_info = this._save_for_completion(opt.editor, _file);

            var fetch = query.get({
                file: save_info.file,
                byte: index,
                add_args:[]
            });

            fetch.then(function(data) {

                var parse = this._parse_suggestions(opt, data, position_info);

                    parse.then(function(result){
                        resolve(result);
                    }).catch(function(e) {
                        reject(e);
                    });

            }.bind(this)).catch(reject).then(function() {

                this._restore_post_completion(save_info);

            }.bind(this)); //then

        }.bind(this));  //promise

    }, //getSuggestions

    onDidInsertSuggestion: function(options) {

            // When inserting a signature as snippet, remove the contents of the signature
            // because it is usually annoying, especially with optional arguments.
            // The type hinting should be enough to know what to type next
            // And in case the developer really wants to restore the full snippet,
            // ctrl/cmd + z shortcut will do this job
        var editor = options.editor;
        var position = options.triggerPosition;
        var buffer_pos = editor.getLastCursor().getBufferPosition().toArray();
        var range = [ [position.row,position.column], buffer_pos ];
        var inserted_text = editor.getTextInBufferRange(range);
        var sig_start = inserted_text.indexOf('(');
        if (sig_start > -1) {
            var following_text = editor.getTextInBufferRange([ [position.row,position.column], editor.getBuffer().getEndPosition().toArray() ])
            var sig_end = following_text.indexOf(')')
            if (sig_end != -1) {
                inserted_text = following_text.slice(sig_start + 1, sig_end);
                editor.setTextInBufferRange([ [position.row,position.column+sig_start+1], [position.row,position.column+sig_start+inserted_text.length+1] ], '');

                    // Ensure the cursor is inside the parenthesis
                editor.setCursorBufferPosition([position.row,position.column+sig_start+1]);
            }
        }
    }, //onDidInsertSuggestion

        // Compute and return the position info from the current text and index
        // such as the current replacement prefix
    _position_info_from_text_and_index: function(text, index) {
        REGEX_ENDS_WITH_DOT_IDENTIFIER.lastIndex = -1;
        var m, call_info;

            // Look for a dot
        if (m = text.match(REGEX_ENDS_WITH_DOT_IDENTIFIER)) {
            return {
                index:  (index - m[1].length),
                prefix: m[1]
            };
        }

            // Look for parens open
        if (call_info = signatures.parse_partial_call(text, index)) {
            return {
                index:  (call_info.signature_start + 1),
                prefix: '',
                call:   call_info
            };
        }

        return null;
    }, //_position_info_from_text_and_index

    _save_for_completion: function(_editor, _file) {

        var filepath = path.dirname(_file);
        var filename = path.basename(_file);
        var tmpname = '.' + filename;
        var tempfile = path.join(filepath, tmpname);

        fs.copySync(_file, tempfile);

        var _code = _editor.getText();
        var b = new Buffer(_code, 'utf-8');
        var freal = fs.openSync(_file, 'w');
                    fs.writeSync(freal, b, 0, b.length, 0);
                    fs.closeSync(freal);
            freal = null;

        return {
            tempfile: tempfile,
            file: _file
        }

    }, //_save_for_completion

    _restore_post_completion: function(save_info) {

        debug.query('remove ' + save_info.tempfile);

        if(fs.existsSync(save_info.tempfile)) {
            fs.deleteSync(save_info.tempfile);
        }

    }, //_restore_post_completion

    _parse_suggestions: function(opt, content, position_info) {

        return new Promise(function(resolve,reject) {

            var has_list = content.indexOf('<list>') != -1;
            var has_type = content.indexOf('<type>') != -1;
            if(!has_list && !has_type) {

                    //usually an error, like "No completion point" etc.
                resolve([]);
                debug.query('autocomplete response: ' + content);

                    // because the error could come from the server not being ready
                    // or other temporary state, reset completion info to be clean during next call
                this.last_completion_index = null;
                this.last_suggestions = null;
                this.last_suggestions_kind = null;

            } else {

                xml2js.parseString(content, function (err, json) {

                        //:todo: care about err
                    var info = this._parse_haxe_completion_json(json);
                    var suggestions = [];

                        // If the info is a list
                    if (info.list != null) {
                        this._add_suggestions_with_list(info.list, suggestions);
                        this.last_suggestions_kind = 'list';
                    }
                    else if (info.type != null) {
                        this._add_suggestion_with_type(info.type, suggestions);
                        this.last_suggestions_kind = 'type';
                    }

                        // Keep computed suggestions for later use
                    this.last_suggestions = suggestions;

                        // Filter and resolve
                    var filtered = this._filter_suggestions(this.last_suggestions, this.last_suggestions_kind, opt, position_info);
                    resolve(filtered);

                }.bind(this)); //parseString

            } //contains <list>

        }.bind(this)); //promise

    }, //_parse_suggestions

    _parse_haxe_completion_json: function(json) {

        var result;

        if (json.list) {
            result = {list: []};
            for (var i = 0; i < json.list.i.length; ++i) {
                var node = json.list.i[i];
                var name = node.$.n;
                var type = node.t.length ? node.t[0] : null;

                result.list.push({
                    name: name,
                    type: type
                });
            }
            return result;

        } else if (json.type) {
            var argtypes = String(json.type).trim();
            var info = signatures.parse_composed_type(argtypes);
            return {
                type: info
            };
        }

        return results;

    }, //parse_haxe_completion_json

    _add_suggestions_with_list: function(list, suggestions) {

        for (var i = 0; i < list.length; ++i) {

            var item = list[i];

            var name = item.name;
            var type = signatures.parse_composed_type(item.type);

            var right = null, text = null, snippet = null;

                // If the type is a method type
            if (type.args != null) {
                    // Format method arguments
                var dumped_args = [];
                for (var j = 0; j < type.args.length; j++) {
                    var arg = type.args[j];
                    var arg_str = '';
                    if (arg != null) {
                        if (arg.name != null) {
                            arg_str += arg.name;
                        }
                        else {
                            arg_str += 'arg' + (i+1)
                        }
                        arg_str = '${' + (j + 1) + ':' + arg_str + '}';
                    }
                    dumped_args.push(arg_str);
                }

                    // When suggesting a function, use a snippet in order to get nicer output
                    // and to have the cursor put inside the parenthesis when confirming
                right = signatures.string_from_parsed_type(type.type);
                if (dumped_args.length > 0) {
                    snippet = name + '(' + dumped_args.join(', ') + ')';
                } else {
                    text = name + '()';
                }
            }
            else {
                    // Otherwise just format the type
                right = signatures.string_from_parsed_type(type);
                text = name;
            }

                // Create final suggestion
            var suggestion = {
                replacementPrefix:  '',
                rightLabel:         right,
                className:          'haxe-autocomplete-suggestion-list-item'
            };

            if (snippet != null) {
                suggestion.snippet = snippet;
            }
            else {
                suggestion.text = text;
            }

            suggestions.push(suggestion);

        } //each item*/
    }, //_add_suggestions_with_list

    _add_suggestion_with_type: function(type, suggestions) {

            // Compute list of arguments in signature
        var displayed_type;
        if (type.args != null && type.args.length > 0) {
            var call_args = [];
            for (var i = 0; i < type.args.length; i++) {
                var arg = type.args[i];
                var arg_str = arg.name;
                if (arg_str == null) {
                    arg_str = 'arg' + (i + 1)
                }
                if (arg.type != null) {
                    arg_str = arg_str + ': ' + signatures.string_from_parsed_type(arg.type);
                }
                call_args.push(arg_str);
            }

            displayed_type = call_args.join(', ');
        }
        else {
            displayed_type = 'no parameters';
        }

        suggestions.push({
            _call_args:         call_args, // for later argument highlighting when filtering
            rightLabelHTML:     escape(displayed_type),
            text:               '', // No text as we will perform no replacemennt and only label will be visible
            replacementPrefix:  '',
            className:          'haxe-autocomplete-suggestion-type-hint'
        });

    },

    _filter_suggestions: function(prev_suggestions, prev_suggestions_kind, options, position_info) {

        var suggestion, i;

            // No sugggestions to filter? return empty array
        if (prev_suggestions == null) {
            return [];
        }

            // Update prefix if needed
        var prefix = options.prefix;
        if (position_info != null && position_info.prefix != null) {
            prefix = position_info.prefix;
        }
        else if (this.prefixes.indexOf(prefix) != -1) {
            prefix = '';
        }

            // Create filterable suggestions
        var suggestions = []
        for (i = 0; i < prev_suggestions.length; i++) {
            var prev_suggestion = prev_suggestions[i];
            suggestion = {};

                // text
            if (prev_suggestion.text != null) {
                suggestion.text = prev_suggestion.text;
            }
                // snippet
            if (prev_suggestion.snippet != null) {
                suggestion.snippet = prev_suggestion.snippet;
            }
                // label
            if (prev_suggestion.rightLabel != null) {
                suggestion.rightLabel = prev_suggestion.rightLabel;
            }
                // label (html)
            if (prev_suggestion.rightLabelHTML != null) {
                suggestion.rightLabelHTML = prev_suggestion.rightLabelHTML;
            }
                // class name
            if (prev_suggestion.className != null) {
                suggestion.className = prev_suggestion.className;
            }
                // replacement prefix
            if (prev_suggestions_kind === 'list') {
                suggestion.replacementPrefix = prefix;
            } else {
                    // When doing type hinting, no replacement will be done
                suggestion.replacementPrefix = '';
            }

                // call args
            if (prev_suggestion._call_args != null) {
                suggestion._call_args = prev_suggestion._call_args;
            }

                // filter key for fuzzaldrin
            if (suggestion.snippet != null) {
                suggestion._filter = suggestion.snippet;
            } else if (suggestion.text != null) {
                suggestion._filter = suggestion.text;
            }

            suggestions.push(suggestion);
        }

            // Filter suggestions if needed
        if (prev_suggestions_kind === 'list' && prefix != null && prefix.length > 0) {
            suggestions = filter(suggestions, prefix, {key: '_filter'});
        }

            // Highlight argument if doing type hinting
        if (prev_suggestions_kind === 'type' && position_info != null && position_info.call != null && suggestions.length === 1) {
            suggestion = suggestions[0];
            if (suggestion._call_args != null && suggestion._call_args.length > 0) {
                var formatted_args = [];
                var current_arg_index = position_info.call.number_of_args - 1;
                for (i = 0; i < suggestion._call_args.length; i++) {
                    var arg = suggestion._call_args[i];
                    if (i === current_arg_index) {
                        formatted_args.push('<span class="current-argument">' + escape(arg) + '</span>');
                    } else {
                        formatted_args.push(escape(arg));
                    }
                }
                suggestion.rightLabelHTML = formatted_args.join(', ');
            }
        }

        return suggestions;

    } //_filter_suggestions

} //module.exports
