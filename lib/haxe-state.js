
        //node built in
var   path = require('path')
        //lib code
    , log = require('./utils/log')
        //dep code
    , tmp = require('temporary')

module.exports = {

        //the active hxml data
    hxml_file:null,
    hxml_content:null,
    hxml_cwd:null,
        //the temp file cache path
    tmp_path:null,

//lifecycle

    init: function(state) {

        this.set_state(state);

        this.tmp_dir = new tmp.Dir('atom-haxe');
        this.tmp_path = this.tmp_dir.path;

        log.debug('state set cache path ' + this.tmp_path);

    },

    dispose:function() {
        this.tmp_dir.rmdir();
    },

    serialize:function() {
        return {
            hxml_file: this.hxml_file,
            hxml_cwd: this.hxml_cwd,
            hxml_content: this.hxml_content
        }
    },

//State queries

    hxml_as_args:function(options) {

        var args = null;
            //check if hxml content is set
        var hxml = options.hxml_content || this.hxml_content;

            //if not, check for a file
        if(!hxml) {
                //check if there's a file given instead
            hxml = options.hxml_file || this.hxml_file;
                //if there is, make it relative
            if(hxml) {
                hxml = path.relative(this.hxml_cwd, hxml);
                args = [hxml];
            }

        } else {

            args = hxml.split('\n');
            args = args.filter(function(a) {
                if(a) return true;
            });

        }

        return args;

    }, //hxml_as_args

//State updates

    set_hxml_file:function(file, cwd) {
        this.hxml_file = file;
        this.hxml_cwd = cwd || path.dirname(file);
        this.hxml_content = null;
        log.debug('state hxml file to ' + this.hxml_file);
        log.debug('state hxml cwd to ' + this.hxml_cwd);
    },

    set_hxml_content:function(file_content, cwd) {
        this.hxml_file = null;
        this.hxml_content = file_content;
        this.hxml_cwd = cwd;
        // log.debug('state hxml file content set to ' + this.hxml_content);
        // log.debug('state hxml cwd to ' + this.hxml_cwd);
        log.debug('state set hxml, and cwd: ' + this.hxml_cwd);
    },

    set_state:function(state) {
        if(state) {
            this.hxml_content = state.hxml_content || null;
            this.hxml_file = state.hxml_file || null;
            this.hxml_cwd = state.hxml_cwd || null;
        }
    },

} //module.exports
