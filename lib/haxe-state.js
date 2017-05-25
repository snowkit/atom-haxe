
        //node built in
var   path = require('path')
        //lib code
    , log = require('./utils/log')
    , hxml_utils = require('./utils/hxml')
        //dep code
    , tmp = require('temporary')

module.exports = {

        //convenience for external
    valid:false,
        //the active consumer
    consumer:null,
        //the active hxml data
    hxml_file:null,
    hxml_content:null,
    hxml_cwd:null,
        //the temp file cache path
    tmp_path:null,

//lifecycle

    init: function(state) {

        this.set(state);

        this.tmp_dir = new tmp.Dir('atom-haxe');
        this.tmp_path = path.normalize(this.tmp_dir.path);

        log.debug('state set cache path ' + this.tmp_path);

    },

    dispose:function() {
        this.tmp_dir.rmdir();
    },

    serialize:function() {

        var o = {
            hxml_file: this.hxml_file,
            hxml_cwd: this.hxml_cwd,
            hxml_content: this.hxml_content
        }

        // console.log('state',o);

        return o;
    },

//Consumer

    set_consumer: function(opt) {

            //notify existing
        if(this.consumer && this.consumer.onConsumerLost) {
            this.consumer.onConsumerLost();
        }

            //set new
        this.consumer = opt;

            //apply
        if(opt) {

            log.debug('consumer; set external consumer to ' + this.consumer.name);

            if(this.consumer.hxml_content) {
                this.set_hxml_content(opt.hxml_content, opt.hxml_cwd);
            } else if(opt.hxml_file) {
                this.set_hxml_file(opt.hxml_file, opt.hxml_cwd);
            }
        } else {
            log.debug('consumer; unset external consumer');
        }

    }, //set_consumer

//State queries

    as_args:function(plus_args) {

        if(!this.valid) return null;

        var args = [];

        if(this.hxml_cwd) {
            args.push('--cwd');
            args.push(this.hxml_cwd);
        }

        args = args.concat(this.hxml_as_args());

        if(plus_args) {
            args = args.concat(plus_args);
        }

        return args;

    }, //as_args


    hxml_as_args:function(options) {

        if(!this.valid) return null;

        options = options || {};

        var args = [];
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

            args = hxml_utils.parse_hxml_args(hxml);

        }

        return args;

    }, //hxml_as_args

//State updates

    set_hxml_file:function(file, cwd) {
        this.unset(true);
        this.hxml_file = file;
        this.hxml_cwd = cwd || path.dirname(file);
        log.debug('state hxml file to ' + this.hxml_file);
        log.debug('state hxml cwd to ' + this.hxml_cwd);
        this.valid = true;
    },

    set_hxml_cwd:function(cwd) {
        this.hxml_cwd = cwd || path.dirname(file);
        log.debug('state hxml cwd to ' + this.hxml_cwd);
    },

    set_hxml_content:function(file_content, cwd) {
        this.unset(true);
        this.hxml_content = file_content;
        this.hxml_cwd = cwd;
        // log.debug('state hxml file content set to ' + this.hxml_content);
        log.debug('state set hxml, and cwd: ' + this.hxml_cwd);
        this.valid = true;
    },

    unset:function(internal) {
        this.hxml_file = null;
        this.hxml_content = null;
        this.hxml_cwd = null;
        this.valid = false;
        if(!internal) log.debug('state unset');
    },

    set:function(state) {

        if(state) {

                //:todo: possibly more resilient since
                //this may be called from elsewhere later.
                //right now it's only called internally.
            var cwd = state.hxml_cwd;

            if(state.hxml_file) {
                this.set_hxml_file(state.hxml_file, cwd);
            } else if(state.hxml_content) {
                this.set_hxml_content(state.hxml_content, cwd);
            }

            this.valid = true;

        } //if state

    }, //set


} //module.exports
