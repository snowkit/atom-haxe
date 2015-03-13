
        // node built in
var   path = require('path')
    , crypto = require('crypto')
        // lib code
    , query = require('./query')
    , debug = require('./debug')
    , state = require('../haxe-state')
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

        var tmp = this.save_for_completion(_file, opt.editor.getText());

        return new Promise( function(resolve, reject) {

            var fetch = query.get({
                file: tmp.file,
                byte: _byte,
                add_args:['-cp', tmp.cp_path]
            });

            fetch.then(function(data) {

                var parse = this.parseSuggestions(data);

                    parse.then(function(result){
                        resolve(result);
                    }).catch(function(e) {
                        reject(e);
                    });

            }.bind(this)).catch(reject).then(function() {

                this.restore_post_completion(_file);

            }.bind(this)); //then

        }.bind(this));  //promise

    }, //getSuggestions

    save_for_completion:function(_file, _code) {

        var shasum = crypto.createHash('sha1');
            shasum.update(_file);
        var file_hash = shasum.digest('hex');

            // Create or update temporary haxe file for completion
            // We want to avoid having to save the current file so
            // instead, we make a copy in a temporary directory
            // and add the directory to the class path

        var cp_path = path.join(state.tmp_path, file_hash);
        var relative = path.relative(state.hxml_cwd, _file);
        
        var cache_file = path.join(cp_path, path.basename(relative));
        var cache_file_dir = path.dirname(cache_file);
        var cache_file_exists = fs.existsSync(cache_file);

        fs.ensureFileSync(cache_file);

        var b = new Buffer(_code, 'utf-8');
        var freal = fs.openSync(cache_file, 'w');
                    fs.writeSync(freal, b, 0, b.length, 0);
                    fs.closeSync(freal);
            freal = null;

        return {
            file: cache_file,
            exists: cache_file_exists,
            cp_path: cp_path
        }

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
        // console.log(json);

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
