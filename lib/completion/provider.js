
        // node built in
var   path = require('path')
        // lib code
    , query = require('./query')
    , log = require('./log')
        // dep code
    , xml2js = require('xml2js')
    , fs = require('fs-extra')


    //:todo: tidy
var sig_helper = {};
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

      }.bind(this)).catch(function(e){

          reject(e);

      }.bind(this)).then(function() {

          this.restore_post_completion(_compfile, _tempfile);

      }.bind(this)); //then

    }.bind(this));  //promise

  }, //getSuggestions

  save_for_completion:function(_file, _tempfile, _code) {

      //:todo: switch to jeremyfa temp paths
    log.query('write ' + _file +' ' + _code.length);

    var b = new Buffer(_code, 'utf-8');
    fs.copySync(_file, _tempfile);

    var freal = fs.openSync(_file, 'w');
                fs.writeSync(freal, b, 0, b.length, 0);
                fs.closeSync(freal);
        freal = null;

  },

  restore_post_completion:function(_file, _tempfile) {

    log.query('remove ' + _tempfile);

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

            var results = [];
            console.log(json);

            var cnt = json.list.i.length;
            for(var idx = 0; idx < cnt; ++idx) {

                var node = json.list.i[idx];
                var name = node.$.n;
                var type = node.t.length ? node.t[0] : null;

                var info = this.parseType(type);

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

          }.bind(this)); //parseString

        } //contains <list>

      }.bind(this)); //promise

  }, //parseSuggestions


  parseType: function(t) {
    return sig_helper.prepareSignature(t);
  } //parseType

} //module.exports


sig_helper = {

      //String->String
    getCloseChar:function( c ) {
        var r = '';
        switch (c) {
            case "(": r = ")"; break;
            case "<": r = ">"; break;
            case "{": r = "}"; break;
            default: break;
        }
        return r;
    },

      //String->String
    prepareSignature: function(_intype) {

        var groupRegex = /\$(\d)+/g;
        var parenRegex = /^\((.*)\)$/;
        var argNameRegex = /^(\??\w+) : /;
        var monomorphRegex = /^Unknown<\d+>$/;

        // replace arrows to ease parsing ">" in type params
        var type = _intype.replace(/ -> /g, "%");

        // prepare a simple toplevel signature without nested arrows
        // nested arrow can be in () or <> and we don't need to modify them,
        // so we store them separately in `groups` map and replace their occurence
        // with a group name in the toplevel string
        var toplevel = [];//StringBuf
        var groups = {}; //Map
        var closeStack = [];//new haxe.ds.GenericStack();
        var depth = 0;
        var groupId = 0;

        for(var i = 0; i < type.length; ++i) {
            var char = type.charAt(i);
            if (char == "(" || char == "<" || char == "{") {
                depth++;
                closeStack.push(this.getCloseChar(char));
                if (depth == 1) {
                    groupId++;
                    groups[groupId] = [];
                    toplevel.push(char);
                    toplevel.push('$'+groupId);
                    continue;
                }
            } else if (char == closeStack[closeStack.length-1]) {
                closeStack.pop();
                depth--;
            }

            if (depth == 0) {
                toplevel.push(char);
            } else {
                groups[groupId].push(char);
            }

        } //for

        // process a sigle type entry, replacing inner content from groups
        // and removing unnecessary parentheses, String->String
        var processType = function(_in_ptype) {

            var ptype = _in_ptype;
            var gr = groupRegex.exec(ptype);
            if(gr) {

              var swapgr = true;
              var gridx = 1;
              while(swapgr) {

                var grid = gr[gridx];
                if(grid) {
                  var groupId = parseInt(grid);
                  var groupStr = groups[groupId].join('');
                  ptype = ptype.replace('$'+groupId, groupStr);
                  ptype = ptype.replace("%", "->");
                  gridx++;
                } else {
                  swapgr = false;
                }

              } //while swapping
            } //gr

            var pr = parenRegex.exec(ptype);
            if(pr) {
                ptype = pr[1];
            }

            return ptype;

        } //processType

        // split toplevel signature by the "%" (which is actually "->")
        var parts = toplevel.join('').split("%");

        // get a return or variable type
        var returnType = processType(parts.pop());

        // if there is only the return type, it's a variable
        // otherwise `parts` contains function arguments
        var isFunction = parts.length > 0;

        // format function arguments
        var args = [];
        for(var i = 0; i < parts.length; ++i) {
            var part = parts[i];

            // get argument name and type
            // if function is not a method, argument name is generated by its position
            var argname = '';
            var argtype = '';
            var ar = argNameRegex.exec(part);
            if(ar) {
                argname = ar[1];
                argtype = part.substr(ar[0].length, part.length);
            } else {
                argname = 'arg'+i;
                argtype = part;
            }

            argtype = processType(argtype);

            // we don't need to include the Void argument
            // because it represents absence of arguments
            if (argtype == "Void") {
                continue;
            }

            // if type is unknown, include only the argument name
            if(monomorphRegex.test(argtype)) {
                args.push(argname);
            } else {
                args.push(argname+':'+argtype);
            }

        } //each part

        // finally generate the signature
        var result = [];
        var res = { pre:_intype, sig:'', args:null, ret:null };
        if (isFunction) {
            res.sig += "(";
            res.sig += args.join(", ");
            res.sig += ")";
            res.args = args;
            res.ret = returnType;
        } else {
            res.sig = returnType;
        }

        return res;
    }

} //sig_helper
