
        // lib code
var   state = require('../haxe-state')
    , run   = require('../haxe-call')
    , uuid = require('../utils/uuid')
    , code = require('../utils/haxe-code')
        // node built in
    , path  = require('path')
        // dep code
    , xml2js = require('xml2js')
    , fs = require('fs-extra')
    , glob = require('glob')


var REGEX_TYPE_PATH_AFTER = /^([\.A-Za-z0-9_]+)/;
var REGEX_TYPE_PATH_BEFORE = /([\.A-Za-z0-9_]+)$/;

module.exports = {

    jump: function() {
        var editor = atom.workspace.getActiveTextEditor();
        var file_path = editor.getPath();

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

            // Extract end of expression
        var expr_end = code.parse_end_of_expression(posttext, 0);

        this._extract_info_from_xml_output().then(function(info) {

                // Extract file from word (if the word is a type)
            if (info[word] != null) {
                atom.workspace.open(info[word].file);
                return;
            }

                // Otherwise, query haxe to get type
            var port = atom.config.get('haxe.server_port');
            var args = [];
            args.push('--no-output');

            if (port) {
                args.push('--connect');
                args.push(String(port));
            }

            args.push('--display');
            args.push(file_path + '@' + Buffer.byteLength(text.slice(0, index + expr_end.length), 'utf8') + '@type');

            args = state.as_args(args);

            run.haxe(args).then(function(result) {

                xml2js.parseString(result.err, function(err, json) {

                    if (json == null) return;

                    if (json.type != null && info[json.type.trim()] != null) {
                        atom.workspace.open(info[json.type.trim()].file);
                        return;
                    }

                }.bind(this));

            }.bind(this));

        }.bind(this));
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

                    //types = this._parse_toplevel_list(json);
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
                                module: entry.$.module
                            };
                        }
                    }

                    this.hxml_for_info = state.hxml_content;
                    this.info = info;
                    resolve(this.info);

                }.bind(this));

            }).bind(this));

        }.bind(this));
    }

}
