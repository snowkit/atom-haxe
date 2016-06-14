
import js.Node.module;

import service.HaxeService;

import plugin.Plugin;

// TODO implement toolbar service
// TODO implement build service

    /** Public API exposed to Atom. */
class AtomHaxe {

    public static function main():Void {
            // We don't use haxe's built-in @:expose() because we want to expose
            // the whole class as a single module (with its own context)
        module.exports = cast AtomHaxe;

    } //main

    public static function activate(serialized_state:Dynamic):Void {
            // Init internal modules
        Plugin.init(serialized_state);

    } //activate

    public static function deactivate(state:Dynamic):Void {
            // Dispose internal modules
        Plugin.dispose();

    } //deactivate

    public static function serialize():Dynamic {

        return Plugin.serialize();

    } //serialize


/// Consumed services

    public static function consumeStatusBar(statusBar:Dynamic):Void {

    } //consumeStatusBar

/// Provided services

    public static function provide_haxe_service():HaxeService {

        return Plugin.haxe_service;

    } //provide_haxe_service

    public static function provide_linter_service():Dynamic {

        return Plugin.linter_service;

    } //provide_linter

    public static function provide_autocomplete():Dynamic {

        return Plugin.autocomplete_provider;

    } //provide_linter

}
