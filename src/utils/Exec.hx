package utils;

import js.node.ChildProcess as NodeProcess;
import js.Node.process;

import utils.Promise;
import utils.Log;

using StringTools;

typedef ExecResult = {
    var out: String;
    var err: String;
    var code: Int;
    var killed: Bool;
}

typedef ExecOptions = {

    @:optional var cwd: String;

        /** When given, will kill any previous
            process using the same channel. */
    @:optional var channel: String;
}

typedef ParsedCommandLine = {
    var cmd: String;
    var args: Array<String>;
}

    /** Utility to run a command with arguments. */
class Exec {

    static var kill_by_channel:Map<String,Dynamic> = new Map<String,Dynamic>();

    private static function __init__() {
            // OS X El Capitan fix (for now)
        if (process.platform == 'darwin') {
            untyped process.env.PATH = "/usr/local/bin:" + process.env.PATH;
        }
    } //__init__

        /** Runs a shell command with args, returning a promise that will resolve with {out, err, code}
            The promise does not reject.
            Pass the ondataout and ondataerr handlers to get incremental changes
            (this doesn't change the above behavior) */
    public static function run(cmd:String, args:Array<String>, ?options:ExecOptions, ?ondataout:String->Void, ?ondataerr:String->Void):Promise<ExecResult> {

        return new Promise<ExecResult>(function(resolve, reject) {
                // Configure
            var total_err = "";
            var total_out = "";
            var spawn_options:Dynamic = {cwd: process.cwd()};
            var closed = false;
            var killed = false;
            var channel = null;
            if (options != null) {
                if (options.cwd != null) spawn_options.cwd = options.cwd;
                channel = options.channel;
            }

                // Spawn process
            var proc = NodeProcess.spawn(cmd, args, spawn_options);

                // Kill previous process on this channel, if any
            if (channel != null) {
                var kill = kill_by_channel.get(channel);
                if (kill != null) {
                    kill();
                }
            }

                // Keep kill function for this channel, if any
            if (channel != null) {
                kill_by_channel.set(channel, function() {
                    if (!closed && !killed) {
                        killed = true;
                        kill_by_channel.remove(channel);
                        //proc.kill();
                        var pid = proc.pid;
                        untyped require('tree-kill')(pid);
                    }
                });
            }

            proc.stdout.on('data', function(data) {
                var s = Std.string(data);
                total_out += s;
                if (ondataout != null) ondataout(s);
            });

            proc.stderr.on('data', function(data) {
                var s = Std.string(data);
                total_err += s;
                if (ondataerr != null) ondataerr(s);
            });

            proc.on('close', function(code) {
                closed = true;
                resolve({
                    out: total_out,
                    err: total_err,
                    code: code,
                    killed: killed
                });
            });
        });

    } //run

    public static function parse_command_line(command_line:String):ParsedCommandLine {

        // Ported from: https://github.com/binocarlos/spawn-args

    	var arr:Array<String> = [];

    	var current:String = null;
    	var quoted:String = null;
    	var quoteType = null;

    	function add_current() {
    		if (current != null) {
    			// trim extra whitespace on the current arg
    			arr.push(current.trim());
    			current = null;
    		}
    	}

    	// remove escaped newlines
    	command_line = command_line.replace('\\\n', '');

    	for (i in 0...command_line.length) {
    		var c = command_line.charAt(i);

    		if (c == " ") {
    			if (quoted != null) {
    				quoted += c;
    			}
    			else {
    				add_current();
    			}
    		}
    		else if (c == '\'' || c == '"') {
    			if (quoted != null) {
    				quoted += c;
    				// only end this arg if the end quote is the same type as start quote
    				if (quoteType == c) {
    					// make sure the quote is not escaped
    					if (quoted.charAt(quoted.length - 2) != '\\') {
    						arr.push(quoted);
    						quoted = null;
    						quoteType = null;
    					}
    				}
    			}
    			else {
    				add_current();
    				quoted = c;
    				quoteType = c;
    			}
    		}
    		else {
    			if (quoted != null) {
    				quoted += c;
    			}
    			else {
    				if (current != null) {
    					current += c;
    				}
    				else {
    					current = c;
    				}
    			}
    		}
    	}

    	add_current();

        var cmd = arr.shift();

    	return {
            cmd: cmd,
            args: arr
        };

    } //parse_command_line

}
