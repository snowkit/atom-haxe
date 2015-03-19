
        // node built in
var   path = require('path')
    , crypto = require('crypto')
        // lib code
    , query = require('./query')
    , debug = require('./debug')
    , file = require('./file')
    , state = require('../haxe-state')
    , signatures = require('../parsing/signatures')
    , escape = require('../utils/escape-html')
    , code = require('../utils/haxe-code')
    , compiler = require('../parsing/compiler')
        // dep code
    , xml2js = require('xml2js')
    , fs = require('fs-extra')
    , filter = require('fuzzaldrin').filter


var REGEX_ENDS_WITH_DOT_IDENTIFIER = /\.([a-zA-Z_0-9]*)$/;
var REGEX_ENDS_WITH_PARTIAL_PACKAGE_DECL = /[^a-zA-Z0-9_]package\s+([a-zA-Z_0-9]+(\.[a-zA-Z_0-9]+)*)\.([a-zA-Z_0-9]*)$/;
var REGEX_BEGINS_WITH_KEY = /^([a-zA-Z0-9_]+)\s*\:/;


module.exports = {

    selector: '.source.haxe',
    disableForSelector: '.source.haxe .comment',
    inclusionPriority: 1,
    excludeLowerPriority: true,
    prefixes:['.','('],

    last_completion_index: null,
    last_key_path: null,
    last_has_partial_key: false,
    last_suggestions: null,
    last_suggestions_kind: null,
    last_pretext: null,

        // Set to true to use extended completion
        // on anonymous structures as argument
    use_extended_completion: true,

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
            if (position_info != null) {
                index = position_info.index;

                //if (position_info.call != null) {
                //    console.log(position_info.call);
                //}
            } else {
                    // Nothing to query from the current index
                return resolve([]);
            }

                // Get current key_path and partial_key
            var key_path = null, has_partial_key = false;
            if (position_info != null && position_info.call != null) {
                key_path = position_info.call.key_path;
                has_partial_key = (position_info.call.partial_key != null);
            }

                // Check if we should run haxe autocomplete again
            if (this.last_completion_index != null) {
                if (this.last_completion_index === index && this.last_pretext.slice(0, index) === pretext.slice(0, index)) {
                    var should_recompute_completion = true;

                        // Compare last key path/partial key with the current one
                    if (((key_path != null && this.last_key_path != null && key_path.join(',') === this.last_key_path.join(','))
                    || (key_path == null && this.last_key_path == null)) && this.last_has_partial_key == has_partial_key) {
                            // Key path is the same as before
                        should_recompute_completion = false;
                    }

                    if (!should_recompute_completion) {
                            // No need to recompute haxe completion
                            // Just filter and resolve
                        var filtered = this._filter_suggestions(this.last_suggestions, this.last_suggestions_kind, opt, position_info);
                        return resolve(filtered);
                    }
                }
            }

                // Keep useful values for later completion
            this.last_pretext = pretext;
            this.last_completion_index = index;
            this.last_key_path = key_path;
            this.last_has_partial_key = has_partial_key;

                // We need to perform a new haxe query
                // Save file first
            var fetch, save_info;
            var use_external_file = atom.config.get('haxe.completion_avoid_saving_original_file');
            if (use_external_file) {

                    // Completion using an external file
                save_info = file.save_tmp_file_for_completion_of_original_file(opt.editor.buffer.file.path, pretext.slice(0, index));

                fetch = query.get({
                    file: save_info.file_path,
                    byte: Buffer.byteLength(save_info.contents, 'utf8'),
                    add_args: ['-cp', save_info.cp_path]
                });
            }
            else {

                    // `classic` way of saving the file
                save_info = this._save_for_completion(opt.editor, _file);

                fetch = query.get({
                    file: save_info.file,
                    byte: Buffer.byteLength(pretext.slice(0, index), 'utf8'),
                    add_args:[]
                });
            }

            fetch.then(function(data) {

                var parse = this._parse_suggestions(opt, data, position_info);

                    parse.then(function(result) {
                        resolve(result);
                    }).catch(function(e) {
                    console.log("REJECT");
                        reject(e);
                    });

            }.bind(this)).catch(reject).then(function() {

                if (use_external_file) {
                    file.remove_tmp_file(save_info);
                }
                else {
                    this._restore_post_completion(save_info);
                }

            }.bind(this)); //then

        }.bind(this));  //promise

    }, //getSuggestions

    onDidInsertSuggestion: function(options) {
            // Get editor state
        var editor = options.editor;
        var position = options.triggerPosition;
        var buffer_pos = editor.getLastCursor().getBufferPosition().toArray();
        var suggestion = options.suggestion;

        if (this.use_extended_completion && (this.last_key_path != null || this.last_has_partial_key) && suggestion.className != 'haxe-autocomplete-suggestion-type-hint') {
                // When inserting a structure key, add a colon, unless it already exists
            var following_text = editor.getTextInBufferRange([ [position.row,position.column], editor.getBuffer().getEndPosition().toArray() ]);
            REGEX_BEGINS_WITH_KEY.lastIndex = -1;
            if (!REGEX_BEGINS_WITH_KEY.test(following_text)) {
                editor.insertText(': ');
            }

        } else {
                // When inserting a signature as snippet, remove the contents of the signature
                // because it is usually annoying, especially with optional arguments.
                // The type hinting should be enough to know what to type next
                // And in case the developer really wants to restore the full snippet,
                // ctrl/cmd + z shortcut will do this job
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
        }
    }, //onDidInsertSuggestion

        // Compute and return the position info from the current text and index
        // such as the current replacement prefix
    _position_info_from_text_and_index: function(text, index) {
        REGEX_ENDS_WITH_DOT_IDENTIFIER.lastIndex = -1;
        var m, call_info;

            // We only care about the text before index
        text = text.slice(0, index);

            // Look for a dot
        if (m = text.match(REGEX_ENDS_WITH_DOT_IDENTIFIER)) {

                // Don't query haxe when writing a package declaration
            REGEX_ENDS_WITH_PARTIAL_PACKAGE_DECL.lastIndex = -1;
            if ((' '+text).match(REGEX_ENDS_WITH_PARTIAL_PACKAGE_DECL)) {
                return null;
            }

            return {
                index:  (index - m[1].length),
                prefix: m[1]
            };
        }

            // Look for parens open
        if (call_info = code.parse_partial_call(text, index)) {
            var prefix = '';

            if (call_info.partial_key != null) {
                prefix = call_info.partial_key;
            }

            return {
                index:  (call_info.signature_start + 1),
                prefix: prefix,
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
        var b = new Buffer(_code, 'utf8');
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
                    // Apparently no completion from this point
                var suggestions = [];

                    // Try to extract haxe errors from output
                var haxe_errors = compiler.parse_output(content);

                if (haxe_errors.length > 0) {
                    suggestions.push({
                        rightLabelHTML:     escape(haxe_errors[0].message),
                        text:               '', // No text as we will perform no replacemennt and only label will be visible
                        replacementPrefix:  '',
                        className:          'haxe-autocomplete-suggestion-error'
                    });
                }

                resolve(suggestions);

                debug.query('autocomplete response: ' + content);

                    // because the error could come from the server not being ready
                    // or other temporary state, reset completion info to be clean during next call
                this.last_completion_index = null;
                this.last_suggestions = null;
                this.last_suggestions_kind = null;

            } else {

                xml2js.parseString(content, function (err, json) {
                    // TODO care about err

                    var info = this._parse_haxe_completion_json(json);

                    if (this.use_extended_completion && position_info != null && position_info.call != null && position_info.call.key_path != null) {
                            // Extended completion with key path

                        if (info.type != null && info.type.args != null) {

                                // Extract the type we want to use to get key path completion
                            var structure_type = info.type.args[position_info.call.number_of_args - 1];
                            if (structure_type == null) {
                                return resolve([]);
                            }
                            if (typeof(structure_type) == 'object' && structure_type.type != null) {
                                structure_type = structure_type.type;
                            }
                            structure_type = code.string_from_parsed_type(structure_type);

                                // When having no partial key, we just want
                                // to hint the current type
                            var used_key_path = [].concat(position_info.call.key_path);
                            if (position_info.call.partial_key == null) {
                                used_key_path.pop();
                            }

                                // Create a temporary file to get completion list
                            var save_info = file.save_tmp_file_for_completion_list_of_instance_type(structure_type, used_key_path);

                                // Query completion server
                            var fetch = query.get({
                                file: save_info.file_path,
                                byte: Buffer.byteLength(save_info.contents, 'utf8'),
                                add_args: ['-cp', save_info.cp_path]
                            });

                            fetch.then(function(content) {

                                    // Remove temporary file
                                file.remove_tmp_file(save_info);

                                var has_list = content.indexOf('<list>') != -1;
                                if (!has_list) {
                                    return resolve([]);
                                }

                                xml2js.parseString(content, function(err, json) {
                                    // TODO care about err

                                    var info = this._parse_haxe_completion_json(json);
                                    if (info.list != null) {
                                        var suggestions = [];

                                            // Fill suggestions
                                        this._add_suggestions_with_list(info.list, suggestions, {ignore_methods: true});
                                        this.last_suggestions_kind = 'list';

                                            // Keep computed suggestions for later use
                                        this.last_suggestions = suggestions;

                                        var filtered = this._filter_suggestions(this.last_suggestions, this.last_suggestions_kind, opt, position_info);
                                        resolve(filtered);

                                    } else {
                                        resolve([]);
                                    }
                                }.bind(this));

                            }.bind(this)).catch(reject);
                        }
                        else {
                            return resolve([]);
                        }

                    } else {
                            // Regular completion
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
                    }

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
            var info = code.parse_composed_type(argtypes);
            return {
                type: info
            };
        }

        return results;

    }, //parse_haxe_completion_json

    _add_suggestions_with_list: function(list, suggestions, options) {

        for (var i = 0; i < list.length; ++i) {

            var item = list[i];

            var name = item.name;
            var type = code.parse_composed_type(item.type);

            var right = null, text = null, snippet = null;

                // If the type is a method type
            if (type.args != null) {
                    // Ignore methods?
                if (options != null && options.ignore_methods) {
                    continue;
                }

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
                            arg_str += 'arg' + (j+1)
                        }

                        if (arg.optional) {
                            arg_str = '?' + arg_str;
                        }

                        arg_str = '${' + (j + 1) + ':' + arg_str + '}';
                    }
                    dumped_args.push(arg_str);
                }

                    // When suggesting a function, use a snippet in order to get nicer output
                    // and to have the cursor put inside the parenthesis when confirming
                right = code.string_from_parsed_type(type.type);
                if (dumped_args.length > 0) {
                    snippet = name + '(' + dumped_args.join(', ') + ')';
                } else {
                    text = name + '()';
                }
            }
            else {
                    // Otherwise just format the type
                right = code.string_from_parsed_type(type);
                text = name;
            }

                // Don't display Unknown types
            if (right === 'Unknown' || right.slice(0, 8) === 'Unknown<') {
                right = '';
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

                if (arg.optional) {
                    arg_str = '?' + arg_str;
                }

                if (arg.type != null) {
                    var type_str = code.string_from_parsed_type(arg.type);

                        // Don't display Unknown types
                    if (type_str !== 'Unknown' && type_str.slice(0, 8) !== 'Unknown<') {
                        arg_str = arg_str + ': ' + type_str;
                    }
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

        var prev_suggestion, suggestion, i;

            // No sugggestions to filter? return empty array
        if (prev_suggestions == null) {
            return [];
        }

            // Return key path type hint if needed
        if (position_info.call != null
            && position_info.call.partial_key == null
            && position_info.call.key_path != null
            && position_info.call.key_path.length > 0) {
            var key = position_info.call.key_path[position_info.call.key_path.length - 1];
                // Look for a completion element with the same key
            for (i = 0; i < prev_suggestions.length; i++) {
                prev_suggestion = prev_suggestions[i];

                if (prev_suggestion.text == key) {

                    if (prev_suggestion.rightLabel != null) {
                            // Found it. Create a type hint element from it and return only this one
                        return [{
                            rightLabelHTML:     '<span class="current-argument">' + escape(prev_suggestion.text) + ': ' + escape(prev_suggestion.rightLabel) + '</span>',
                            text:               '', // No text as we will perform no replacemennt and only label will be visible
                            replacementPrefix:  '',
                            className:          'haxe-autocomplete-suggestion-type-hint'
                        }];
                    }

                    return [];
                }
            }
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
            prev_suggestion = prev_suggestions[i];
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

            // When making suggestions for anonymous structures,
            // remove suggestions that match the already used keys
        if (prev_suggestions_kind === 'list'
        && position_info != null
        && position_info.call != null
        && position_info.call.used_keys != null
        && position_info.call.used_keys.length > 0) {
            var filtered_suggestions = [];
            var forbidden_keys = {};
            for (i = 0; i < position_info.call.used_keys.length; i++) {
                forbidden_keys[position_info.call.used_keys[i]] = true;
            }
            for (i = 0; i < suggestions.length; i++) {
                suggestion = suggestions[i];
                if (!forbidden_keys[suggestion.text]) {
                    filtered_suggestions.push(suggestion);
                }
            }
            suggestions = filtered_suggestions;
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
