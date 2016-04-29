package linting;

import atom.Atom.atom;
import atom.TextEditor;

import utils.Promise;
import utils.Run;

import haxe.Timer;

import plugin.Plugin.state;

class Lint {

        // The first lint will wait until haxe compiler is ready
        // This will be set to false after the linting ran once
    static var should_wait_for_compiler:Bool = true;

        // Last compiler output errors
    static var compiler_errors:Array<Dynamic> = [];

    public static function lint_project(editor:TextEditor, done:Dynamic):Void {

            // The first lint is delayed to be sure the compiler is ready
        if (should_wait_for_compiler) {

            var time = atom.config.get('haxe.server_activation_start_delay');
            Timer.delay(function() {
                    // Update flag
                should_wait_for_compiler = false;
                    // Lint
                lint_project(editor, done);

            }, (time + 1) * 1000);

        } else {

            run_compiler(function() {
                provide_lint_items(editor, done);
            });

        }

    } //lint_project

/// Internal

    static function run_compiler(done:Void->Void):Void {

        var args = [];
        args.push('--no-output');

            // Add a define to let haxe code know
            // the compilation is running for linting
        args.push('-D');
        args.push('lint');

        // TODO connect to server

        args = state.as_args(args);

        Run.haxe(args).then(function(result) {

            if (result.err.length > 0) {
                compiler_errors = []; // TODO Compiler.parse_output(result.err)
            } else {
                compiler_errors = [];
            }

            done();

        });

    } //run_compiler

    static function provide_lint_items(editor:TextEditor, done:Void->Void):Void {



    } //provide_lint_items

}
