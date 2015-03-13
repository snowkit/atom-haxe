
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


module.exports = {

    selector: '.source.haxe',
    disableForSelector: '.source.haxe .comment',
    inclusionPriority: 1,
    excludeLowerPriority: true,
    prefixes:['.','('],

    rootIndex: null,

    getSuggestions : function(opt) {

        if(!state.hxml_cwd) return [];
        if(!state.hxml_content && !state.hxml_file) return [];

        var _file = opt.editor.buffer.file.path;
        if(!_file) return [];

        return new Promise( function(resolve, reject) {

            var buffer_pos = opt.bufferPosition.toArray();
            var pretext = opt.editor.getTextInBufferRange( [ [0,0], buffer_pos] );
            var index = pretext.length;

            // var info = this.infoFromIndexInText(index, text);
            // if(info) {
            //     index = info.index
            // }
            //
            // console.log(info);
            //
            //     // Check if we should run haxe autocomplete again
            // if(this.rootIndex !== null) {
            //     if(this.rootIndex == index) {
            //         var filtered = this.filter(this.suggestions, opt, info);
            //         return resolve(filtered);
            //     }
            // }

            // var suggestions = []

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

            if(content.indexOf('<list>') == -1) {

                    //usually an error, like "No completion point" etc.
                resolve([{text:content, rightLabel:'?'}]);

            } else {

                xml2js.parseString(content, function (err, json) {

                        //:todo: care about err
                    var items = this.parseJSON(json);
                    var suggestions = [];

                    for(var i = 0; i < items.length; ++i) {

                        var item = items[i];
                        var name = item.name;
                        var right = item.info.sig;

                        if(item.info.ret) {
                            right = item.info.ret;
                            name += item.info.sig;
                        }

                        suggestions.push({
                             text: escape(name),
                             rightLabel: right
                        });

                    } //each item

                    resolve(suggestions);

                }.bind(this)); //parseString

            } //contains <list>

        }.bind(this)); //promise

    }, //parseSuggestions

    parseJSON: function(json) {

        var results = [];
        var cnt = json.list.i.length;

        for(var idx = 0; idx < cnt; ++idx) {

            var node = json.list.i[idx];
            var name = node.$.n;
            var type = node.t.length ? node.t[0] : null;

            results.push({
                name:name,
                info:signatures.parseType(type)
            });

        } //for each in list

        return results;

    }, //parseJSON

} //module.exports
