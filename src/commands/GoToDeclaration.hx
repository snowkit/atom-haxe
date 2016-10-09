package commands;

import plugin.Plugin.state;
import atom.Atom.atom;

import atom.TextEditor;
import atom.Range;
import atom.Point;

import utils.Run;
import utils.Log;
import utils.Exec;

import tides.parse.Haxe;

import haxe.io.Path;
import sys.io.File;

import npm.Xml2Js;

using StringTools;

class GoToDeclaration {

    public function new() {
        //
    }

    public function run():Void {

        if (state == null || !state.is_valid()) return;

        var editor = atom.workspace.getActiveTextEditor();
        var file_path = editor.getPath();

        if (file_path == null) return;

        var buffer_pos = editor.getLastCursor().getBufferPosition().toArray();
        var pretext = editor.getTextInBufferRange(new Range(new Point(0,0), buffer_pos));
        var text = editor.getText();
        var index = pretext.length;
        var posttext = text.substring(index);
        var info:Dynamic = {};

            // Extract selected word (composed), if any
        var word = '';
        if (RE.TYPE_PATH_BEFORE.match(pretext)) {
            word = RE.TYPE_PATH_BEFORE.matched(1);
        }
        if (RE.TYPE_PATH_AFTER.match(posttext)) {
            word += RE.TYPE_PATH_AFTER.matched(1);
        }
        word = word.trim();

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
                last_word_element = word.substring(word_last_dot_index + 1);
                if (last_word_element.charAt(0) != null
                && last_word_element.charAt(0).toUpperCase() == last_word_element.charAt(0)) {
                    word_is_uppercase_type = true;
                }
            }
        }

            // Extract end of expression
        var expr_end = Haxe.parse_end_of_expression(text, index);
        expr_end = RE.ADDITIONAL_KEY_PATH.replace(expr_end, '.');

            // Imports
        var imports = Haxe.extract_imports(text);

            // First, try to query haxe to get position as this is `the good way` to get our job done.
            // Unfortunately it doesn't work in all cases yet
            // If it fails, we fall back to a combination of compiler XML output and @type/@toplevel information
            // Overall, this rather quick implementation should still work in most common cases
        var find_declaration_from_position = function(word) {

            var display_arg = file_path + '@' + js.node.Buffer.byteLength(text.substring(0, index + expr_end.length), 'utf8') + '@position';
            _run_haxe_display(display_arg).then(function(result) {

                Xml2Js.parseString(result.err, function(err, json:Dynamic) {

                    if (json != null) {
                            // Position got resolved, let's jump!
                        if (json.list != null && json.list.pos != null && json.list.pos.length > 0) {
                            var all_parsed_pos = Haxe.parse_compiler_output(json.list.pos[0], {allow_empty_message: true});
                            if (all_parsed_pos.length > 0) {
                                var parsed_pos = all_parsed_pos[0];
                                _open({
                                    file: parsed_pos.file_path,
                                    line: parsed_pos.line,
                                    name: word
                                });
                                return;
                            }
                        }
                    }

                        // Fall back to the XML/@type/@toplevel resolution
                    //find_declaration_from_xml(word);

                });

            });

        };

            // Start resolution
        find_declaration_from_position(word);

    }

        /** Query haxe server to display information (type, toplevel, position) */
    function _run_haxe_display(display_arg) {

        var port = atom.config.get('haxe.server_port');
        var args = [];
        args.push('--no-output');

        if (port) {
            args.push('--connect');
            args.push(''+port);
        }

        args.push('--display');
        args.push(display_arg);

        args = state.as_args(args);

        return Run.haxe(args);
    }

    function _open(info:Dynamic) {
        var file_path;
        var cwd = state.hxml.cwd;

        if (Std.is(info, String)) {
                // Just open the file
            file_path = info;
            if (!Path.isAbsolute(file_path)) {
                file_path = Path.join([cwd, file_path]);
            }
            atom.workspace.open(info);
        }
        else {
            file_path = info.file;
            if (!Path.isAbsolute(file_path)) {
                file_path = Path.join([cwd, file_path]);
            }

                // Find identifier in content
            var identifier:String = info.name;
            if (identifier.lastIndexOf('.') != -1) {
                identifier = identifier.substring(identifier.lastIndexOf('.') + 1);
            }

            var contents = ''+File.getContent(file_path);

                // Resolve local identifier
            if (info.line == null && info.local_index != null) {
                var index = Haxe.find_local_declaration(contents, identifier, info.local_index);

                if (index != -1) {
                    var lines = contents.substring(0, index).split("\n");
                    var line = lines.length - 1;
                    var column = lines[lines.length - 1].length;
                    this._update_editor(file_path, line, column);
                }
                else {
                    // Nothing found
                }
            }
            else if (info.line != null) {
                    // Find the characters in line from identifier
                var lines = contents.split("\n");
                var target_line = lines[cast info.line-1];

                var regex = new EReg('[^A-Za-z0-9_]' + identifier + '[^A-Za-z0-9_]', '');
                var match;
                if (regex.match(target_line)) {
                    var line = info.line - 1;
                    var column = target_line.indexOf(regex.matched(0)) + regex.matched(0).length - identifier.length - 1;
                        // We found it, let's open at the exact location
                    _update_editor(file_path, cast line, column);
                }
                else {
                    _update_editor(file_path, cast info.line - 1);
                }
            }
            else {
                var cleaned_contents = Haxe.code_with_empty_comments_and_strings(contents);
                var keyword = info.kind;
                if (keyword == 'class') {
                    keyword = '(?:class|interface)';
                }
                var regex = new EReg(keyword + '\\s+' + identifier + '[^A-Za-z0-9_]', '');
                var match;
                if (regex.match(cleaned_contents)) {
                    var index = cleaned_contents.indexOf(regex.matched(0));
                    var lines = contents.substring(0, index).split("\n");
                    var line = lines.length - 1;
                    var column = lines[lines.length - 1].length + regex.matched(0).length - identifier.length - 1;

                        // We found it, let's open at the exact location
                    this._update_editor(file_path, line, column);
                }
                else {
                    this._update_editor(file_path);
                }
            }

        }
    }

    function _update_editor(file_path, ?line, ?column) {

        var params:Dynamic = {};
        if (line != null) params.initialLine = line;
        if (column != null) params.initialColumn = column;

        atom.workspace.open(file_path, params).then(function(_) {

            if (column != null) {
                    // Select the identifier
                var editor = atom.workspace.getActiveTextEditor();
                editor.selectToEndOfWord();

                    // Workaround to ensure the editor will be centered to the identifier
                    // Without it, the identifier is often too much at the bottom of the screen
                untyped editor.scrollToBottom();
                editor.scrollToCursorPosition();
            }

        });
    }

} //GoToDeclaration


@:allow(commands.GoToDeclaration)
private class RE {

        /** Match any single/double quoted string */
    public static var TYPE_PATH_AFTER:EReg = ~/^([A-Za-z0-9_]+)/;
    public static var TYPE_PATH_BEFORE:EReg = ~/([\.A-Za-z0-9_]+)$/;
    public static var ADDITIONAL_KEY_PATH:EReg = ~/(\.[A-Za-z0-9_]+)+(,|;|\(|\)|\s)?$/;
    public static var IS_IDENTIFIER:EReg = ~/^([A-Za-z_][\.A-Za-z0-9_]+)$/;

} //RE
