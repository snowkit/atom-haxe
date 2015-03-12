
        // lib code
var   server     = require('./completion/server')
    , query      = require('./completion/query')
    , comp_debug = require('./completion/debug')
    , lint       = require('./linting/lint')
    , log        = require('./utils/log')



module.exports = {

    cmds : [],
    config: require('./haxe-config'),

//Lifecycle

        //This is automatic, don't add anything heavy in here
    activate: function(state) {
        this._add_commands();
        log.init();
        comp_debug.init();
        server.init();
        query.init(state);
        lint.init();
    },

    deactivate:function() {
        this._destroy_commands();
        query.dispose();
        server.dispose();
        comp_debug.dispose();
        log.dispose();
        lint.dispose();
    },

    serialize: function() {
        return query.state;
    },

//Commands

        //log test command
    test_logs: function() {
        log.info(JSON.stringify(query.state));
        log.success('yay');
        log.error('awe');
        log.msg('msg');
    },

    //this command is triggered by right clicking the tree view
    //and is using a selector to only have the .hxml files
    set_hxml_file_from_treeview: function(opt) {
        var el = window.document.getElementsByClassName('file entry list-item selected');
        if(el && el.length) {
            el = el[0];
            query.set_hxml_file(el.getPath());
        }
    },

//Providers

        //provides a query api
        //:todo: see #4
    query:function(options) {
        return query.get(options);
    },

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
