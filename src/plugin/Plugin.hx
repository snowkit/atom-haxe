package plugin;

import build.Build;

import service.HaxeService;

import atom.Atom.atom;
import atom.CompositeDisposable;

import utils.MessagePanel;
import utils.Log;
import utils.Promise;
import utils.TemporaryFile;

import server.HaxeServer;

import completion.Query;
import completion.SuggestionsProvider;
import completion.HintProvider;

import js.Node.require;
import js.node.Path;
import js.node.Fs;

import lint.Lint;

using StringTools;

    /** Consumer interface to feed the haxe service */
typedef Consumer = {
        /** The name of the consumer */
    var name:String;
        /** The contextual hxml info */
    var hxml:HXMLInfo;
        /** The builder, if this consumer does build */
    @:optional var builder:Builder;
        /** If provided, will be called when this consumer is not used anymore. */
    @:optional function dispose():Void;
}

    /** Custom haxe builder (provided by a consumer) */
typedef Builder = {
        /** Run build */
    function build():Void;
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

    public static var haxe_server(default,null):HaxeServer = null;


/// Lifecycle

    public static function init(?serialized_state:Dynamic):Void {
            // Init message panel
        MessagePanel.init();

        check_dependencies().then(function(_) {
                // Init state
            state = new State(serialized_state);
                // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
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
                { label: 'Set as active HXML file', command: 'haxe:set-hxml-file', shouldDisplay: should_display_context_tree },
                { type: 'separator' }
            ]
        });

    } //init_menus

    private static function should_display_context_tree(event:js.html.Event):Bool {

        var key = '.hxml';
        var val:String = untyped event.target.innerText;
        if (val == null) return false;
        return val.endsWith(key);

    } //should_display_context_tree

/// Server

    private static function init_server():Void {
            // Init haxe server
        haxe_server = new HaxeServer();
        haxe_server.start().then(function(result) {
            Log.debug(result);
        }).catchError(function(error) {
            Log.error(error);
        });

    } //init_server

/// Commands

    private static function init_commands():Void {

        Log.debug("Init commands");

        register_command('set-hxml-file', set_hxml_file_from_treeview);

        register_command('build', build);

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
            hxml: {
                cwd: Path.dirname(file_path),
                content: '' + Fs.readFileSync(file_path),
                file: file_path
            }
        };

        Log.success("Active HXML file set to " + state.hxml.file, {display: true, clear: true});

    } //set_hxml_file_from_treeview

    private static function build():Void {

        Build.run_build();

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
            }
        }

    } //get_autocomplete_provider

/// Consumed services

    private static function get_haxe_service():HaxeService {

        return haxe_service;

    } //get_haxe_service

}
