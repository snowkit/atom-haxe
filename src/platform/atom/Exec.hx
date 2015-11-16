package platform.atom;

import utils.Promise;

import js.node.ChildProcess;

import js.Node.process;

typedef ExecResult = {
    var out: String;
    var err: String;
    var code: Int;
}

typedef ExecOptions = {
    @:optional var cwd: String;
}

/**
 Utility to run a command with arguments.
 */
class Exec {

        /** Runs a shell command with args, returning a promise that will resolve with {out, err, code}
            The promise does not reject.
            Pass the ondataout and ondataerr handlers to get incremental changes
            (this doesn't change the above behavior) */
    public static function run(cmd:String, args:Array<String>, ?options:ExecOptions, ?ondataout:String->Void, ?ondataerr:String->Void):Promise<ExecResult> {

        return new Promise<ExecResult>(function(resolve, reject) {
                // Configure
            var total_err = "";
            var total_out = "";
            var spawn_options:Dynamic = {cwd: untyped process.cwd()};
            if (options != null) {
                if (options.cwd != null) spawn_options.cwd = options.cwd;
            }

                // Depending on the OS, run cmd through bash command
            if (process.platform == 'darwin') {
                    // Use a login shell on OSX, otherwise the users expected env vars won't be setup
                var prev_cmd = cmd;
                cmd = '/bin/bash';
                args = ['-l', '-c'].concat(args);
            }
            else if (process.platform == 'linux') {
                    // Explicitly use /bin/bash on Linux, to keep Linux and OSX as
                    // similar as possible. A login shell is explicitly not used for
                    // linux, as it's not required
                var prev_cmd = cmd;
                cmd = '/bin/bash';
                args = ['-c'].concat(args);
            }

                // Spawn process
            var proc = ChildProcess.spawn(cmd, args, spawn_options);

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
                resolve({
                    out: total_out,
                    err: total_err,
                    code: code
                });
            });
        });

    } //run

}
