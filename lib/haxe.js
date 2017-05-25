
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

    // Ensure 'haxe' and 'haxelib' default binaries can be found
    // (OSX El Capitan launchctl PATH related solution, for now)
if(process.platform == 'darwin') {
    process.env.PATH = ["/usr/local/bin", process.env.PATH].join(":");
}

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

//Menu handling

    display_context: function(event) {
        var editor = atom.workspace.getActiveTextEditor();
        var scope = editor.getRootScopeDescriptor();
        return (scope.scopes.indexOf('source.hxml') != -1);
    },

    display_context_tree: function(event) {
        var key = '.hxml';
        var val = event.target.innerText || '';
        return val.indexOf(key, val.length - key.length) !== -1;
    },

//Commands

    set_hxml_file_from_treeview: function(opt) {

        var treeview = atom.packages.getLoadedPackage('tree-view');
        if(!treeview) return;

        treeview = require(treeview.mainModulePath);
        if(!treeview.serialize)
            treeview = treeview.getTreeViewInstance();

        var package_obj = treeview.serialize();
        var file_path = package_obj.selectedPath;

            //we are the consumer now
        state.set_hxml_file( file_path );
        state.set_consumer(null);

    }, //set_hxml_file_from_treeview

    set_hxml_cwd_from_treeview: function(opt) {

        var treeview = atom.packages.getLoadedPackage('tree-view');
        if(!treeview) return;

        treeview = require(treeview.mainModulePath);

        var package_obj = treeview.serialize();
        var file_path = package_obj.selectedPath;

        state.set_hxml_cwd( file_path );

    }, //set_hxml_cwd_from_treeview

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

        //provides the haxe linter
    provide_linter: function() {
        var provider = {
            grammarScopes: ['source.haxe', 'source.hx'],
            scope: 'project',
            lintOnFly: false,
            lint: function(text_editor) {
                return new Promise(function(resolve, reject) {
                    lint.lint_project(text_editor, resolve);
                });
            }
        }
        return provider;
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

        this._command('set-hxml-cwd',
            this.set_hxml_cwd_from_treeview.bind(this) );

        this._command('clear-project',
            state.unset.bind(state) );

        this._command('go-to-declaration',
            decl.jump.bind(decl), 'symbols-view' );

    }, //_init_commands

    _init_menus:function() {

        atom.contextMenu.add({
            "atom-text-editor" : [
                { type: 'separator' },
                { label: 'Set as active HXML file', command: 'haxe:set-haxe-file', shouldDisplay:this.display_context.bind(this) },
                { type: 'separator' }
            ],
            ".tree-view .file": [
                { type: 'separator' },
                { label: 'Set as active HXML file', command: 'haxe:set-hxml-file', shouldDisplay:this.display_context_tree.bind(this) },
                { type: 'separator' }
            ],
            ".tree-view .directory > div": [
                { type: 'separator' },
                { label: 'Set Haxe build working directory', command: 'haxe:set-hxml-cwd' },
                { type: 'separator' }
            ]
        });

    },

    _init_internal:function() {

        this._init_commands();
        this._init_menus();

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
