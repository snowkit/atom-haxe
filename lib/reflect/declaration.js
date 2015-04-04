
        // lib code
var   state = require('../haxe-state')
    , run   = require('../haxe-call')
    , uuid = require('../utils/uuid')
    , code = require('../utils/haxe-code')
    , compiler = require('../parsing/compiler')
        // node built in
    , path  = require('path')
        // dep code
    , xml2js = require('xml2js')
    , fs = require('fs-extra')


var REGEX_TYPE_PATH_AFTER = /^([\.A-Za-z0-9_]+)/;
var REGEX_TYPE_PATH_BEFORE = /([\.A-Za-z0-9_]+)$/;

module.exports = {

    init: function() {

            // Don't try anything without valid hxml data
        if(!state.hxml_cwd) return;
        if(!state.hxml_content && !state.hxml_file) return;

            // Extract info from XML once, one second after the haxe server is supposed to be started
            // A better option could be to have an explicit event to catch when the server is ready
        var time = atom.config.get('haxe.server_activation_start_delay');
        setTimeout(this._extract_info_from_xml_output.bind(this), (time + 1) * 1000.0);
    },

    dispose: function() {
        this.info = null;
        this.hxml_for_info = null;
    },

    jump: function() {

            // Don't try anything without valid hxml data
        if(!state.hxml_cwd) return;
        if(!state.hxml_content && !state.hxml_file) return;

        var editor = atom.workspace.getActiveTextEditor();
        var file_path = editor.getPath();

        if(!file_path) return;

        var buffer_pos = editor.getLastCursor().getBufferPosition().toArray();
        var pretext = editor.getTextInBufferRange( [ [0,0], buffer_pos] );
        var text = editor.getText();
        var index = pretext.length;
        var posttext = text.slice(index);

            // Extract selected word (composed), if any
        REGEX_TYPE_PATH_BEFORE.lastIndex = -1;
        REGEX_TYPE_PATH_AFTER.lastIndex = -1;
        var word = '';
        var m;
        if (m = pretext.match(REGEX_TYPE_PATH_BEFORE)) {
            word = m[1];
        }
        if (m = posttext.match(REGEX_TYPE_PATH_AFTER)) {
            word += m[1];
        }
        word = word.replace(/^\.+/, '').replace(/\.+$/, '');

            // By checking if word is uppercase or not, we can
            // deduct whether it can be a type or not
        var word_is_uppercase_type = false;
        var word_last_dot_index = -1;
        var last_word_element = word;
        if (word.length > 0) {
            word_last_dot_index = word.lastIndexOf('.');
            if (word_last_dot_index == -1) {
                if (word.charAt(0).toUpperCase() == word.charAt(0)) {
                    word_is_uppercase_type = true;
                }
            }
            else {
                last_word_element = word.slice(word_last_dot_index + 1);
                if (last_word_element.charAt(0) != null
                && last_word_element.charAt(0).toUpperCase() == last_word_element.charAt(0)) {
                    word_is_uppercase_type = true;
                }
            }
        }


            // Extract end of expression
        var expr_end = code.parse_end_of_expression(text, index);

        var imports = code.extract_imports(text);

            // First, try to query haxe to get position as this is `the good way` to get our job done.
            // Unfortunately it doesn't work in all cases yet
            // If it fails, we fall back to a combination of compiler XML output and @type/@toplevel information
            // Overall, this rather quick implementation should still work in most common cases
        var find_declaration_from_position = function(word) {

            var display_arg = file_path + '@' + Buffer.byteLength(text.slice(0, index + expr_end.length), 'utf8') + '@position';
            this._run_haxe_display(display_arg).then(function(result) {

                xml2js.parseString(result.err, function(err, json) {

                    if (json != null) {
                            // Position got resolved, let's jump!
                        if (json.list != null && json.list.pos != null && json.list.pos.length > 0) {
                            var parsed_pos = compiler.parse_output(json.list.pos[0], {allow_empty_message: true});
                            if (parsed_pos.length > 0) {
                                parsed_pos = parsed_pos[0];
                                this._open({
                                    file: parsed_pos.file_path,
                                    line: parsed_pos.line,
                                    name: word
                                });
                                return;
                            }
                        }
                    }

                        // Fall back to the XML/@type/@toplevel resolution
                    find_declaration_from_xml(word);

                }.bind(this));

            }.bind(this));

        }.bind(this);


        var find_declaration_from_xml = function(word) {

            this._extract_info_from_xml_output().then(function(info) {

                    // Query haxe to get type
                var display_arg = file_path + '@' + Buffer.byteLength(text.slice(0, index + expr_end.length), 'utf8') + '@type';
                this._run_haxe_display(display_arg).then(function(result) {

                    xml2js.parseString(result.err, function(err, json) {

                        if (json != null) {
                                // Type got resolved, let's jump!
                            if (json.type != null && info[json.type.trim()] != null) {
                                this._open(info[json.type.trim()]);
                                return;
                            }
                        }
                        else {
                                // No? Then use @toplevel to try to resolve identifier
                            var index_for_toplevel = code.index_of_closest_block(text, index);

                            display_arg = file_path + '@' + Buffer.byteLength(text.slice(0, index_for_toplevel), 'utf8') + '@toplevel';
                            this._run_haxe_display(display_arg).then(function(result) {

                                xml2js.parseString(result.err, function(err, json) {

                                    if (json != null) {
                                        var types = this._parse_toplevel_list(json);

                                        if (types[word] != null && info[types[word].type] != null) {
                                            this._open(info[types[word].type]);
                                            return;
                                        }

                                    }

                                        // Try to extract file from raw word directly
                                    if (info[word] != null) {
                                        this._open(info[word]);
                                        return;
                                    }
                                    else {
                                            // Last hope, play with packages

                                            // Does it come from an alias?
                                        if (imports[word] != null && info[imports[word]] != null) {
                                            this._open(info[imports[word]]);
                                            return;
                                        }

                                            // Does it come from an imported package?
                                        for (var key in imports) {
                                            var imported_type = imports[key] + '.' + last_word_element;
                                            if (info[imported_type] != null) {
                                                this._open(info[imported_type]);
                                                return;
                                            }
                                        }

                                            // Is it a type of a parent package?
                                        var package_name = code.extract_package(text);
                                        var resolved_type;
                                        while (package_name.length > 0) {
                                                // Is it a type in the current package
                                            if (info[package_name + '.' + last_word_element] != null) {
                                                this._open(info[package_name + '.' + last_word_element]);
                                                return;
                                            }

                                            if (package_name.lastIndexOf('.') != -1) {
                                                package_name = package_name.slice(0, package_name.lastIndexOf('.'));
                                            } else {
                                                break;
                                            }
                                        }

                                            // Is there any other package having this type?
                                        for (var key in info) {
                                            if (key.slice(key.length - last_word_element.length - 1) == ('.' + last_word_element)) {
                                                this._open(info[key]);
                                                return;
                                            }
                                        }

                                            // If the word is composed of multiple identifiers, try removing one element
                                        if (word.lastIndexOf('.') != -1) {
                                            find_declaration_from_xml(word.slice(0, word.lastIndexOf('.')));
                                        }
                                    }

                                }.bind(this));

                            }.bind(this));
                        }

                    }.bind(this));

                }.bind(this));

            }.bind(this));

        }.bind(this);

            // Start resolution
        find_declaration_from_position(word);
    },

    _open: function(info) {
        var file_path;
        var cwd = state.hxml_cwd;

        if (typeof(info) == 'string') {
                // Just open the file
            file_path = info;
            if (!path.isAbsolute(file_path)) {
                file_path = path.join(cwd, file_path);
            }
            atom.workspace.open(info);
        }
        else {
            file_path = info.file;
            if (!path.isAbsolute(file_path)) {
                file_path = path.join(cwd, file_path);
            }

                // Find identifier in content
            var identifier = info.name;
            if (identifier.lastIndexOf('.') != -1) {
                identifier = identifier.slice(identifier.lastIndexOf('.') + 1);
            }

            var contents = String(fs.readFileSync(file_path));

            if (info.line != null) {
                    // Find the characters in line from identifier
                var lines = contents.slice(0, index).split("\n");
                var target_line = lines[info.line-1];

                var regex = new RegExp('[^A-Za-z0-9_]' + identifier + '[^A-Za-z0-9_]');
                var match;
                if (match = target_line.match(regex)) {
                    var line = info.line - 1;
                    var column = target_line.indexOf(match[0]) + match[0].length - identifier.length - 1;
                        // We found it, let's open at the exact location
                    atom.workspace.open(file_path, {
                        initialLine: line,
                        initialColumn: column

                    }).then(function() {

                            // Select the identifier
                        var editor = atom.workspace.getActiveTextEditor();
                        editor.selectToEndOfWord();

                            // Workaround to ensure the editor will be centered to the identifier
                            // Without it, the identifier is often too much at the bottom of the screen
                        editor.scrollToBottom();
                        editor.scrollToCursorPosition();

                    });
                }
                else {
                    atom.workspace.open(file_path, {
                        initialLine: info.line - 1
                    });
                }
            }
            else {
                var cleaned_contents = code.code_with_empty_comments_and_strings(contents);
                var keyword = info.kind;
                if (keyword === 'class') {
                    keyword = '(?:class|interface)';
                }
                var regex = new RegExp(keyword + '\\s+' + identifier + '[^A-Za-z0-9_]');
                var match;
                if (match = cleaned_contents.match(regex)) {
                    var index = cleaned_contents.indexOf(match[0]);
                    var lines = contents.slice(0, index).split("\n");
                    var line = lines.length - 1;
                    var column = lines[lines.length - 1].length + match[0].length - identifier.length - 1;

                        // We found it, let's open at the exact location
                    atom.workspace.open(file_path, {
                        initialLine: line,
                        initialColumn: column

                    }).then(function() {

                            // Select the identifier
                        var editor = atom.workspace.getActiveTextEditor();
                        editor.selectToEndOfWord();

                            // Workaround to ensure the editor will be centered to the identifier
                            // Without it, the identifier is often too much at the bottom of the screen
                        editor.scrollToBottom();
                        editor.scrollToCursorPosition();

                    }.bind(this));

                }
                else {
                    atom.workspace.open(file_path);
                }
            }

        }
    },

    _extract_info_from_xml_output: function() {
        return new Promise(function(resolve, reject) {

                // If info is already extracted, just return it
            if (this.info != null) {
                    // Reset info if hxml is different than previous run
                if (this.hxml_for_info != state.hxml_content) {
                    this.info = null;
                } else {
                    return resolve(this.info);
                }
            }

            var port = atom.config.get('haxe.server_port');
            var tmp_path = state.tmp_path;
            var hash = uuid.v1();
            var xml_path = path.join(tmp_path, hash, 'info.xml');

            fs.ensureDirSync(path.dirname(xml_path));

            var args = [];
            args.push('--no-output');

            if (port) {
                args.push('--connect');
                args.push(String(port));
            }

            args.push('-xml');
            args.push(xml_path);

            args = state.as_args(args);

            run.haxe(args).then((function(result) {

                    // Get xml contents
                var content = fs.readFileSync(xml_path);
                    // Remove file
                fs.removeSync(path.dirname(xml_path));

                xml2js.parseString(content, function (err, json) {

                    if (json == null) return resolve({});

                        // Parse xml result
                    var info = {};
                    var kinds = ['abstract', 'class', 'enum', 'typedef'];
                    for (var i = 0; i < kinds.length; i++) {
                        var kind = kinds[i];
                        var kind_entries = json.haxe[kind];
                        for (var j = 0; j < kind_entries.length; j++) {
                            var entry = kind_entries[j];
                            info[entry.$.path] = {
                                kind: kind,
                                file: entry.$.file,
                                module: entry.$.module,
                                name: entry.$.path
                            };
                        }
                    }

                    var has_keys = false;
                    for (var key in info) {
                        has_keys = true;
                        break;
                    }

                    if (has_keys) {
                        this.hxml_for_info = state.hxml_content;
                        this.info = info;
                        resolve(this.info);
                    } else {
                        resolve({});
                    }

                }.bind(this));

            }).bind(this));

        }.bind(this));
    },

    _parse_toplevel_list: function(json) {

        var types = {};

            // If json is not valid, return empty list
        if (json.il == null || json.il.i == null) return types;

        for (var i = 0; i < json.il.i.length; i++) {
            var raw_entry = json.il.i[i];
            var name = raw_entry._;
            if (types[name] == null) {
                types[name] = {
                    type:   (raw_entry.$.t || raw_entry.$.p),
                    kind:   raw_entry.$.k
                };
            }
        }

        return types;
    },

        // Query haxe server to display information (type, toplevel, position)
    _run_haxe_display: function(display_arg) {

        var port = atom.config.get('haxe.server_port');
        var args = [];
        args.push('--no-output');

        if (port) {
            args.push('--connect');
            args.push(String(port));
        }

        args.push('--display');
        args.push(display_arg);

        args = state.as_args(args);

        return run.haxe(args);
    }

}
