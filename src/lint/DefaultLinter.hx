package lint;

import atom.Atom.atom;
import atom.TextEditor;
import atom.Range;
import atom.Point;

import utils.Promise;
import utils.Run;
import utils.Exec;

import haxe.Timer;

import sys.FileSystem;
import sys.io.File;

import plugin.Plugin.state;

import tides.parse.Haxe;

using StringTools;

class DefaultLinter {

        // The first lint will wait until haxe compiler is ready
        // This will be set to false after the linting ran once
    static var should_wait_for_compiler:Bool = false;

        // Last compiler output errors
    static var compiler_errors:Array<HaxeCompilerOutputElement> = [];

    public static function lint(editor:TextEditor):Promise<Dynamic> {

            // This promise always resolves
        return new Promise<Dynamic>(function(resolve, reject) {

                // The first lint is delayed to be sure the compiler is ready
            if (should_wait_for_compiler) {

                var time = atom.config.get('haxe.server_activation_start_delay');
                Timer.delay(function() {
                        // Update flag
                    should_wait_for_compiler = false;
                        // Lint
                    lint(editor).then(function(result) {
                        resolve(result);
                    });

                }, (time + 1) * 1000);

            } else {

                run_compiler(function() {
                    provide_lint_items(editor, resolve);
                });

            }

        });

    } //lint_project

/// Internal

    static function run_compiler(done:Void->Void):Void {

        var args = [];
        args.push('--no-output');

            // Add a define to let haxe code know
            // the compilation is running for linting
        args.push('-D');
        args.push('lint');

        args = state.as_args(args);

        var run:Promise<ExecResult>;

        if (state.consumer.lint_command != null) {
                // Custom command
            var command = Exec.parse_command_line(state.consumer.lint_command);
            run = Exec.run(command.cmd, command.args, {cwd: state.hxml.cwd});
        }
        else {
                // Default command
            var args = state.as_args();
            run = Run.haxe(args);
        }

        run.then(function(result:ExecResult) {

            if (result.err.length > 0) {
                compiler_errors = Haxe.parse_compiler_output(result.err, {cwd: state.hxml.cwd});
            } else {
                compiler_errors = [];
            }

            done();

        });

    } //run_compiler

    static function provide_lint_items(editor:TextEditor, resolve:Dynamic->Void):Void {

        var message_lines, entry, j, l, file_lines, start, end;

        var result:Array<Dynamic> = [];

            // Compute items
        if (compiler_errors.length > 0) {
            for (info in compiler_errors) {
                file_lines = null;

                    // Error located on a characters range in the single line
                if (info.location == 'characters') {

                        // Add one entry with the message
                    entry = {
                        text:       info.message,
                        line:       info.line,
                        filePath:   info.file_path,
                        range:      new Range(new Point(info.line - 1, info.start), new Point(info.line - 1, info.end)),
                        type:       'Error'
                    };

                    result.push(entry);
                }
                    // Error located on multiple lines
                else if (info.location == 'lines') {
                        // Use the editor content to locate lint only on visible character ranges
                    if (file_lines == null) {
                            // Use file contents to find the best range
                        if (FileSystem.exists(info.file_path)) {
                            file_lines = File.getContent(info.file_path).split("\n");

                                // Get start and end in line after trimming left and right of the line
                            start = file_lines[info.start - 1].length - file_lines[info.start - 1].ltrim().length;
                            end = file_lines[info.start - 1].rtrim().length;

                                // Add one entry with the message
                            entry = {
                                text:       info.message,
                                line:       info.line,
                                filePath:   info.file_path,
                                range:      new Range(new Point(info.line - 1, start), new Point(info.line - 1, end)),
                                type:      'Error'
                            };

                            result.push(entry);
                        }
                    }
                }
            }
        }

        resolve(result);

    } //provide_lint_items

}
