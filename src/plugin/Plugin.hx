package plugin;

import build.Build;

import service.HaxeService;

import atom.Atom.atom;
import atom.CompositeDisposable;
import atom.TextEditor;

import utils.MessagePanel;
import utils.Log;
import utils.Promise;
import utils.TemporaryFile;

import server.HaxeServer;

import commands.GoToDeclaration;

import completion.Query;
import completion.SuggestionsProvider;
import completion.HintProvider;

import js.Node.require;
import js.node.Path;
import js.node.Fs;

import plugin.ui.StatusBar;

import lint.Lint;

import plugin.consumer.HaxeProjectConsumer;

using StringTools;

    /** Consumer interface to feed the haxe service */
typedef Consumer = {

        /** The name of the consumer */
    var name:String;

        /** The contextual hxml info */
    var hxml:HXMLInfo;

        /** The consumer cwd. Not necessarily the same as hxml.cwd */
    var cwd:String;

        /** The builder, if this consumer does build */
    @:optional var builder:Builder;

        /** Custom build command, instead of the default one */
    @:optional var build_command:String;

        /** The linter, if this consumer does lint */
    @:optional var linter:Linter;

        /** Custom lint command, instead of the default one.
            When using default linter, can be any command that
            outputs haxe compiler alike output. */
    @:optional var lint_command:String;

        /** If provided, will be called when this consumer is not used anymore. */
    @:optional function dispose():Void;
}

    /** Custom haxe builder (provided by a consumer) */
typedef Builder = {

        /** Run build */
    function build():Void;
}

    /** Custom haxe linter (provided by a consumer) */
typedef Linter = {

        /** Run lint */
    function lint(editor:TextEditor):Promise<Dynamic>;
}

    /** HXML Info. */
typedef HXMLInfo = {

        /** Populate this with the hxml content for your project */
    var content:String;

        /** The current working directory for the hxml content */
    var cwd:String;

        /** If provided, and if using the default build,
            will be used as argument to build the haxe project.
            The default hxml consumer is providing it. */
    @:optional var file:String;
}

    /** Root plugin module, main entry point for each
        module of the haxe plugin. Also provides a shared state object. */
class Plugin {

    private static var failed:Bool = false;

    private static var subscriptions:CompositeDisposable = null;

    @:allow(AtomHaxe)
    private static var haxe_service(get,null):HaxeService;

    @:allow(AtomHaxe)
    private static var linter_service(get,null):Dynamic;

    @:allow(AtomHaxe)
    private static var autocomplete_provider(get,null):Dynamic;

    private static var hint_provider(default,null):HintProvider;

    public static var state(default,null):State = null;

    @:isVar public static var haxe_server(get,null):HaxeServer = null;
    static function get_haxe_server():HaxeServer {
        return haxe_server;
    }


/// Lifecycle

    public static function init(?serialized_state:Dynamic):Void {
            // Init message panel
        MessagePanel.init();

        check_dependencies().then(function(_) {
                // Init state
            state = new State(serialized_state);
                // Events subscribed to in atom's system can
                // be easily cleaned up with a CompositeDisposable
            subscriptions = new CompositeDisposable();

            init_server();
            init_commands();
            init_menus();
            init_hints();

        }).catchError(function(e:Dynamic) {

            if (e != null && e.missing_deps != null) {
                fail(e);
            } else {
                throw e;
            }

        });

    } //init

    public static function dispose():Void {

        subscriptions.dispose();

        state.destroy();
        state = null;

    } //dispose

    public static function serialize():Dynamic {

        if (!failed) {
            return state != null ? state.serialize() : null;
        } else {
            return null;
        }

    } //dispose

    private static function check_dependencies():Promise<Dynamic> {

        var required = ['linter', 'autocomplete-plus', 'language-haxe'];
        return new Promise(function(resolve, reject) {

            var missing = [];
            for (req in required) {
                if (!atom.packages.isPackageLoaded(req)) {
                    missing.push(req);
                }
            }

            if (missing.length > 0) {
                Log.debug('Missing dependencies: ' + missing.join(', '));
                reject({ missing_deps: missing });
            } else {
                resolve(null);
            }

        }); //promise

    }

    private static function fail(e:Dynamic):Void {

        var missing_deps:Array<String> = e.missing_deps;

        failed = true;
        var message = "Haxe package is missing dependencies!<br />"
                    + "Please install/activate these via Preferences:<br />"
                    + missing_deps.map(function(d) { return '- '+d+' package'; }).join("<br />");

        atom.notifications.addWarning(message, {dismissable: true});

    }

/// Menu handling

    private static function init_menus():Void {

        Log.debug("Init menus");

        atom.contextMenu.add(untyped {
            ".tree-view .file": [
                { type: 'separator' },
                { label: 'Set as active HXML file', command: 'haxe:set-hxml-file', shouldDisplay: should_display_set_hxml_context_tree },
                { type: 'separator' }
            ]
        });

        atom.contextMenu.add(untyped {
            ".tree-view .file": [
                { type: 'separator' },
                { label: 'Set as active Haxe project file', command: 'haxe:set-haxe-project-file', shouldDisplay: should_display_set_haxe_project_context_tree },
                { type: 'separator' }
            ]
        });

    } //init_menus

    private static function should_display_set_hxml_context_tree(event:js.html.Event):Bool {

        var key = '.hxml';
        var val:String = untyped event.target.innerText;
        if (val == null) return false;
        return val.endsWith(key);

    } //should_display_set_hxml_context_tree

    private static function should_display_set_haxe_project_context_tree(event:js.html.Event):Bool {

        untyped console;
        var key = '.json';
        var val:String = untyped event.target.innerText;
        if (val == null) return false;
        return val.endsWith(key);

    } //should_display_set_haxe_project_context_tree

/// Server

    private static function init_server():Void {

        // Init haxe server
        var new_server = new HaxeServer();
        if (haxe_server == null) haxe_server = new_server;

        new_server.start().then(function(result) {
            Log.debug(result);

            if (haxe_server != new_server) {
                var prev_server = haxe_server;
                haxe_server = new_server;

                // Kill previous server after giving it enough time to
                // finish its work.
                haxe.Timer.delay(function() {
                    prev_server.kill();
                }, 15000);
            }

        }).catchError(function(error) {
            Log.error(error);
        });

        // Restart server every 1 minute because it seems the number
        // of sub-processes seems to increase forever otherwise,
        // until we have odd bugs on the editor itself, and the server not
        // responding anymore. This _sad_ workaround will ensure everything is
        // "reset" every minute, will trying to keep things smooth.
        haxe.Timer.delay(init_server, 60000);

    } //init_server

/// Commands

    private static function init_commands():Void {

        Log.debug("Init commands");

        register_command('set-hxml-file', set_hxml_file_from_treeview);

        register_command('set-haxe-project-file', set_haxe_project_from_treeview);

        register_command('build', build);

        register_command('go-to-declaration', go_to_declaration, 'symbols-view');

    } //init_commands

    private static function register_command(name:String, command:Dynamic, module:String = 'haxe'):Void {

        subscriptions.add(atom.commands.add('atom-workspace', module + ':' + name, command));

    } //register_command

    private static function set_hxml_file_from_treeview(_) {

        var treeview = atom.packages.getLoadedPackage('tree-view');
        if (treeview == null) {
            Log.error("Cannot set an active HXML file from tree-view because the tree-view package is disabled.");
            return;
        }

        treeview = require(treeview.mainModulePath);

        var package_obj = treeview.serialize();
        var file_path = package_obj.selectedPath;

            // Assign a default hxml provider
        state.consumer = {
            name: 'default',
            cwd: Path.dirname(file_path),
            hxml: {
                cwd: Path.dirname(file_path),
                content: '' + Fs.readFileSync(file_path),
                file: file_path
            }
        };

        Log.success("Active HXML file set to " + file_path, {display: true, clear: true});

    } //set_hxml_file_from_treeview

    private static function set_haxe_project_from_treeview(_) {

        var treeview = atom.packages.getLoadedPackage('tree-view');
        if (treeview == null) {
            Log.error("Cannot set an active Haxe project file from tree-view because the tree-view package is disabled.");
            return;
        }

        treeview = require(treeview.mainModulePath);

        var package_obj = treeview.serialize();
        var file_path = package_obj.selectedPath;

        var consumer = new HaxeProjectConsumer(file_path);
        consumer.load().then(function(result) {
                // Assign a haxe project consumer
            state.consumer = cast consumer;

            Log.success("Active Haxe project file set to " + file_path, {display: true, clear: true});

        }).catchError(function(error) {

            Log.error("Failed to set Haxe project file: " + error, {display: true, clear: true});
        });

    } //set_haxe_project_from_treeview

    private static function build():Void {

        Build.run_build();

    } //build

    private static function go_to_declaration():Void {

        new GoToDeclaration().run();

    } //build

/// Hints

    private static function init_hints():Void {

        subscriptions.add(atom.workspace.observeTextEditors(function(editor) {

            if (editor.getGrammar() == null || editor.getGrammar().scopeName != 'source.haxe' && editor.getGrammar().scopeName != 'source.hx') {
                return;
            }

            var hint_provider = new HintProvider(editor);

            var disposable = editor.onDidChangeCursorPosition(function(event) {
                hint_provider.update();
            });

            editor.onDidDestroy(function() {
                disposable.dispose();
                disposable = null;
                hint_provider.destroy();
                hint_provider = null;
            });

        }));

    } //init_hints

/// Linter

    private static function get_linter_service():Dynamic {

        return {
            grammarScopes: ['source.haxe', 'source.hx'],
            scope: 'project',
            lintOnFly: false,
            lint: function(text_editor) {
                return Lint.lint_project(text_editor);
            }
        };

    } //get_linter_service

/// Autocomplete provider

    private static function get_autocomplete_provider():Dynamic {

        var autocomplete_provider = new SuggestionsProvider();

        return {
            selector: '.source.haxe, .source.hx',
            disableForSelector: '.source.haxe .comment, .source.hx .comment',
            inclusionPriority: 2,
            excludeLowerPriority: false,
            getSuggestions: function(options) {
                return autocomplete_provider.get_suggestions(options);
            },
            onDidInsertSuggestion: function(options) {
                autocomplete_provider.did_insert_suggestion(options);
            }
        }

    } //get_autocomplete_provider

/// Consumed services

    @:allow(AtomHaxe)
    private static function consume_status_bar(status_bar:Dynamic):Void {

        StatusBar.atom_status_bar = status_bar;
        StatusBar.update();

    } //consume_status_bar

    private static function get_haxe_service():HaxeService {

        return haxe_service;

    } //get_haxe_service

}
