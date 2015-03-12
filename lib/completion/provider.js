
        // node built in
var   path = require('path')
        // lib code
    , query = require('./query')
    , debug = require('./debug')
    , signatures = require('../parsing/signatures')
        // dep code
    , xml2js = require('xml2js')
    , fs = require('fs-extra')


module.exports = {

    selector: '.source.haxe',
    disableForSelector: '.source.haxe .comment',
    inclusionPriority: 1,
    excludeLowerPriority: true,
    prefixes:['.','('],

    getSuggestions : function(opt) {

        var _file = opt.editor.buffer.file.path;

        if(!_file) {
            // console.log('haxe / completion / completion on a non file?');
            return [];
        }

        if(this.prefixes.indexOf(opt.prefix) == -1) {
            // console.log('haxe / completion / completion non-prefix ' + opt.prefix);
            return [];
        }

        var _bufferpos = opt.bufferPosition.toArray();
        var _pretext = opt.editor.getTextInBufferRange([[0,0],_bufferpos]);
        var _byte = _pretext.length;

        var _filepath = path.dirname(_file);
        var _filename = path.basename(_file);
        var _tempfile = path.join(_filepath, '.'+_filename+'.tmp');
        var _compfile = _file;

        this.save_for_completion(_compfile, _tempfile, opt.editor.getText());

        return new Promise( function(resolve, reject) {

            var fetch = query.get({
                file:_compfile,
                byte:_byte
            });

            fetch.then(function(data) {

                var parse = this.parseSuggestions(data);

                    parse.then(function(result){
                        resolve(result);
                    }).catch(function(e) {
                        reject(e);
                    });

            }.bind(this)).catch(reject).then(function() {

                this.restore_post_completion(_compfile, _tempfile);

            }.bind(this)); //then

        }.bind(this));  //promise

    }, //getSuggestions

    save_for_completion:function(_file, _tempfile, _code) {

        //   //:todo: switch to jeremyfa temp paths
        // debug.query('write ' + _file +' ' + _code.length);
        //
        // var b = new Buffer(_code, 'utf-8');
        // fs.copySync(_file, _tempfile);
        //
        // var freal = fs.openSync(_file, 'w');
        //             fs.writeSync(freal, b, 0, b.length, 0);
        //             fs.closeSync(freal);
        //     freal = null;

    }, //save_for_completion

    restore_post_completion:function(_file, _tempfile) {

        debug.query('remove ' + _tempfile);

        if(fs.existsSync(_tempfile)) {
          // fs.deleteSync(_tempfile);
        }

    }, //restore_post_completion

    parseSuggestions: function(content) {

        return new Promise(function(resolve,reject) {

            if(content.indexOf('<list>') == -1) {

                    //usually an error, like "No completion point" etc.
                resolve([{text:content, rightLabel:'?'}]);

            } else {

                xml2js.parseString(content, function (err, json) {

                        //:todo: care about err
                    this.parseJSON(json, resolve);

                }.bind(this)); //parseString

            } //contains <list>

        }.bind(this)); //promise

    }, //parseSuggestions

    parseJSON: function(json, resolve) {

        var results = [];
        console.log(json);

        var cnt = json.list.i.length;
        for(var idx = 0; idx < cnt; ++idx) {

            var node = json.list.i[idx];
            var name = node.$.n;
            var type = node.t.length ? node.t[0] : null;

            var info = signatures.parseType(type);

            // console.log(info);
            var _right = info.sig;
            if(info.ret) {
                _right = info.ret;
                name += info.sig;
            }

            var suggestion = {
              text: name, // OR
              // snippet: '',
              rightLabel: _right, // (optional)
              // rightLabelHTML: 'function<br/><i>...</i></span>', // (optional)
              // type: 'function' // (optional)
            }

            results.push(suggestion);

        } //for each in list

        resolve(results);

    }, //parseJSON

} //module.exports
