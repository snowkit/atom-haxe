
        // lib code
var   server     = require('./completion/server')
    , query      = require('./completion/query')
    , build      = require('./build/build')
    , lint       = require('./linting/lint')
    , decl       = require('./reflect/declaration')
    , state      = require('./haxe-state')
        // lib debugging
    , comp_debug = require('./completion/debug')
    , log        = require('./utils/log')



module.exports = {

    config: require('./haxe-config'),

    failed: false,
    disposables : [],

//Lifecycle

        //This is automatic, don't add anything heavy in here
    activate: function(serialized_state) {

        this.check_dependency().then(function(){

            this._init_internal();
            log.init();
            comp_debug.init();
            server.init();
            query.init();
            lint.init();
            decl.init();
            state.init(serialized_state);

        }.bind(this)).catch(function(e) {

            if(e && e.missing_deps) {
                this.fail(e);
            } else {
                throw e;
            }

        }.bind(this));

    }, //activate

    deactivate:function() {

        if(!this.failed) {
            this._dispose_internal();
            state.dispose();
            query.dispose();
            server.dispose();
            comp_debug.dispose();
            log.dispose();
            decl.dispose();
            lint.dispose();
        }

    }, //deactivate

    serialize: function() {

        if(!this.failed) return state.serialize();

    }, //serialize

    check_dependency: function() {

        var required = ['linter', 'autocomplete-plus', 'language-haxe'];
        return new Promise(function(resolve, reject) {

            var missing = [];
            for(var i = 0; i < required.length; ++i) {
                var req = required[i];
                if(!atom.packages.isPackageLoaded(req)) {
                    missing.push(req);
                }
            }

            if(missing.length) {
                console.log('haxe / missing dependencies', missing);
                reject({ missing_deps:missing });
            } else {
                resolve();
            }

        }); //promise

    }, //check_dependency

    fail: function(e) {

        this.failed = true;
        var message = 'Haxe package is missing dependencies!<br/>';
            message += 'Please install/activate these via Preferences:<br/><br/>';
            message += e.missing_deps.map(function(d){ return '- '+d+' package'; }).join('<br/>');

        atom.notifications.addWarning(message, {dismissable:true});

    }, //fail

//Commands



    set_xml_file_from_treeview: function(opt) {

        var treeview = atom.packages.getLoadedPackage('tree-view');
        if(!treeview) return;

        treeview = require(treeview.mainModulePath);

        var package_obj = treeview.serialize();
        var file_path = package_obj.selectedPath;

    	var node_path = require('path');
    	var node_exec = require('sync-exec');
    	var node_fs = require('fs');

    	var assume_target = 'flash';
    	var default_name = 'openfl_generated.hxml';

    	var file_path_split = file_path.split(node_path.sep);
    	file_path_split.pop();
    	var cwd_path = file_path_split.join(node_path.sep);
    	var check_for_name = cwd_path + node_path.sep + default_name;

    	if (node_fs.existsSync(check_for_name) == true)	{
    	       state.set_hxml_file( check_for_name );
               state.set_consumer(null);
    	}
    	else {
        	var openfl_display = node_exec("openfl display "+assume_target,{cwd:cwd_path});
        	node_fs.writeFileSync(check_for_name,openfl_display.stdout);
        	state.set_hxml_file( check_for_name );
        	state.set_consumer(null);
    	}
    }, //set_xml_file_from_treeview


    set_hxml_file_from_treeview: function(opt) {

        var treeview = atom.packages.getLoadedPackage('tree-view');
        if(!treeview) return;

        treeview = require(treeview.mainModulePath);

        var package_obj = treeview.serialize();
        var file_path = package_obj.selectedPath;

            //we are the consumer now
        state.set_hxml_file( file_path );
        state.set_consumer(null);

    }, //set_hxml_file_from_treeview

    build: function(e) {

            //continue propogation if
            //not set up properly
        if(this.failed) {
            return e.abortKeyBinding();
        }

            //check selectors
        var selectors = atom.config.get('haxe.build_selectors');
            //:todo: resilience
        var list = selectors.split(',');
            list = list.map(function(l) { return l.trim(); });

            //get the consumer selectors
        if(state.consumer && state.consumer.onBuildSelectorQuery) {
            var consumer_list = state.consumer.onBuildSelectorQuery();
            if(consumer_list) {
                list = list.concat(consumer_list);
            }
        }

            //find current scope of file
        var editor = atom.workspace.getActiveTextEditor();
        var scope = editor ? editor.getRootScopeDescriptor() : null;
        if(editor && scope && scope.scopes.length) {

                //filter non scoped ones
            var allowed = list.filter(function(item){
                if(scope.scopes.indexOf(item) != -1) {
                    return true;
                }
            });

                //any left?
            if(allowed.length) {
                build.run_build();
            } else {
                var info = ' - scope: ' + scope.scopes.join(', ');
                    info += ' - allowed: ' + list;
                log.debug('build / scope not in allowed selectors (see settings).' + info);
            }

        } //editor + scope

    },

//Providers

        //provides this plugin to the consumers,
        //allowing them to call set_completion_state
        //with options, to config the haxe query completion state
    completion_service:function() {
        return this;
    },

    set_completion_consumer:function( options ) {

        var _str = JSON.stringify(options);

        var handle_err = function(err) {
            log.error('Failed to set completion consumer. ' + _str);
            log.error(err);
            return false;
        }

        if(!options.name || !options.onConsumerLost) {
            return handle_err('required: name and onConsumerLost(callback) properties');
        }

        if(options.hxml_content && options.hxml_file) {
            return handle_err('error: hxml_content or hxml_file, not both.');
        }

        if(options.hxml_content && !options.hxml_cwd) {
            return handle_err('required: hxml_cwd is needed when giving hxml_content');
        }

        log.debug('set consumer: ' + _str);

        state.set_consumer(options);

        return true;

    }, //set_completion_consumer

        //handles the completion provider
        //for autocomplete-plus
    provide: function() {
        return require('./completion/provider');
    },


//Internal conveniences

    _init_commands:function() {

        this._command('build',
            this.build.bind(this) );

        this._command('toggle-log-view',
            log.toggle.bind(log) );

        this._command('reset-server',
            server.reset.bind(server) );

        this._command('stop-server',
            server.stop.bind(server) );

        this._command('toggle-completion-debug',
            comp_debug.toggle.bind(comp_debug) );

        this._command('set-hxml-file',
            this.set_hxml_file_from_treeview.bind(this) );

        this._command('set-xml-file',
            this.set_xml_file_from_treeview.bind(this) );

        this._command('clear-project',
            state.unset.bind(state) );

        this._command('go-to-declaration',
            decl.jump.bind(decl), 'symbols-view' );

    }, //_init_commands

    _init_internal:function() {

        this._init_commands();

    }, //

    _dispose_internal:function() {

        for(var i = 0; i < this.disposables.length; ++i) {
            this.disposables[i].dispose();
        }

        this.disposables = [];

    }, //

    _command:function(name, func, module) {

        if (module == null) {
            module = 'haxe';
        }

        var cmd = atom.commands.add('atom-workspace', module+':'+name, func);
        this.disposables.push(cmd);

        return cmd;
    } //

} //module.exports
