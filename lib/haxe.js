
        // lib code
var   server     = require('./completion/server')
    , query      = require('./completion/query')
    , comp_debug = require('./completion/debug')
    , lint       = require('./linting/lint')
    , log        = require('./utils/log')
    , state      = require('./haxe-state')



module.exports = {

    cmds : [],
    config: require('./haxe-config'),

//Lifecycle

        //This is automatic, don't add anything heavy in here
    activate: function(serialized_state) {
        this._add_commands();
        log.init();
        comp_debug.init();
        server.init();
        query.init();
        lint.init();
        state.init(serialized_state);
    },

    deactivate:function() {
        this._destroy_commands();
        state.dispose();
        query.dispose();
        server.dispose();
        comp_debug.dispose();
        log.dispose();
        lint.dispose();
    },

    serialize: function() {
        return state.serialize();
    },

//Commands

        //log test command
    test_logs: function() {
        log.info(JSON.stringify(state.serialize()));
        log.success('yay');
        log.error('awe');
        log.msg('msg');
        log.debug('debug message');
    },

    set_hxml_file_from_treeview: function(opt) {

        var treeview = atom.packages.getLoadedPackage('tree-view')
            treeview = require(treeview.mainModulePath)
        var package_obj = treeview.serialize();
        var file_path = package_obj.selectedPath

        state.set_hxml_file( file_path );

    },

//Providers

        //provides this plugin to the consumers,
        //allowing them to call set_completion_state
        //with options, to config the haxe query completion state
    completion_service:function() {
        return this;
    },

    set_completion_state:function( options ) {

        if(options.hxml_content) {

            if(!options.hxml_cwd) {
                log.error('failed to set hxml_content from plugin ' + options.name);
                log.error('When setting hxml_content, hxml_cwd is required!');
            } else if(options.hxml_file) {
                log.error('failed to set hxml_content from plugin ' + options.name);
                log.error('When setting hxml_content, hxml_file should be left out!');
            } else {
                state.set_hxml_content(options.hxml_content, options.hxml_cwd);
            }

        } else if(options.hxml_file) {

            state.set_hxml_file(options.hxml_file, options.hxml_cwd);

        } else {
            log.error('invalid options specified from completion service, from ' + options.name);
        }

    }, //set_completion_state

        //handles the completion provider
        //for autocomplete-plus
    provide: function() {
        return require('./completion/provider');
    },


//Internal conveniences

    _add_commands:function() {
        this._add_command('test-logs', this.test_logs.bind(this) );
        this._add_command('reset-server', server.reset.bind(server) );
        this._add_command('stop-server', server.stop.bind(server) );
        this._add_command('toggle-completion-debug', comp_debug.toggle.bind(comp_debug) );
        this._add_command('set-hxml-file', this.set_hxml_file_from_treeview.bind(this) );
    },

    _destroy_commands:function() {
        for(var i = 0; i < this.cmds.length; ++i) {
            atom.commands.remove(this.cmds[i]);
        }
    },

    _add_command:function(name, func) {
        var cmd = atom.commands.add('atom-workspace', 'haxe:'+name, func);
        this.cmds.push(cmd);
        return cmd;
    }

} //module.exports
