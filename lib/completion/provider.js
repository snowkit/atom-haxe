
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


var REGEX_ENDS_WITH_DOT_IDENTIFIER = /\.([a-zA-Z_0-9]*)$/;


module.exports = {

    selector: '.source.haxe',
    disableForSelector: '.source.haxe .comment',
    inclusionPriority: 1,
    excludeLowerPriority: true,
    prefixes:['.','('],

    last_completion_index: null,

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
                    var filtered = this._filter_suggestions(this.suggestions, opt, position_info);
                    return resolve(filtered);
                }
            }

                // We need to perform a new haxe query
                // Save file first
            var save_info = this.save_for_completion(opt.editor, _file);

            var fetch = query.get({
                file: save_info.file,
                byte: index,
                add_args:[]
            });

            fetch.then(function(data) {

                var parse = this.parseSuggestions(opt, data);

                    parse.then(function(result){
                        resolve(result);
                    }).catch(function(e) {
                        reject(e);
                    });

            }.bind(this)).catch(reject).then(function() {

                this.restore_post_completion(save_info);

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

    save_for_completion:function(_editor, _file) {

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

    }, //save_for_completion

    restore_post_completion:function(save_info) {

        debug.query('remove ' + save_info.tempfile);

        if(fs.existsSync(save_info.tempfile)) {
            fs.deleteSync(save_info.tempfile);
        }

    }, //restore_post_completion

    parseSuggestions: function(opt, content) {

        return new Promise(function(resolve,reject) {

            var has_list = content.indexOf('<list>') != -1;
            var has_type = content.indexOf('<type>') != -1;
            if(!has_list && !has_type) {

                    //usually an error, like "No completion point" etc.
                resolve([{
                    text: content,
                    rightLabel: '?',
                    className: 'haxe-autocomplete-suggestion-error'
                }]);

            } else {

                xml2js.parseString(content, function (err, json) {

                        //:todo: care about err
                    var info = this._parse_haxe_completion_json(json);
                    var suggestions = [];

                        // If the info is a list
                    if (info.list != null) {
                        this._add_suggestions_with_list(info.list, suggestions);
                    }
                    else if (info.type != null) {
                        // TODO type hinting
                    }

                    resolve(suggestions);

                }.bind(this)); //parseString

            } //contains <list>

        }.bind(this)); //promise

    }, //parseSuggestions

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
            console.log(type);

            var right, text, snippet;

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
                snippet = name + '(' + dumped_args.join(', ') + ')';
            }
            else {
                    // Otherwise just format the type
                right = signatures.string_from_parsed_type(type);
                text = name;
            }

                // Create final suggestion
            var suggestion = {
                replacementPrefix:  '',
                rightLabel:         right
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

    _filter_suggestions: function(suggestions, position_info) {

        

        return suggestions;

    } //_filter_suggestions

} //module.exports
