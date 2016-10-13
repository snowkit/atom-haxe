package server;

// Haxe 3.3+ server utility.
// Mainly inspired from:
// https://github.com/vshaxe/haxe-languageserver/blob/30156642b8c9e4943f18376d984fd378d925aa3d/src/haxeLanguageServer/HaxeServer.hx

import utils.Promise;

import atom.Atom.atom;

import js.node.child_process.ChildProcess as ChildProcessObject;
import js.node.child_process.ChildProcess.ChildProcessEvent;
import js.node.Buffer;
import js.node.ChildProcess;
import js.node.stream.Readable;

import utils.Log;
import utils.CancellationToken;

using StringTools;

class HaxeServer {

    static var RE_VERSION = ~/^(\d+)\.(\d+)\.(\d+)(?:\s.*)?$/;

    var proc:ChildProcessObject;
    var version:Array<Int>;
    var buffer:MessageBuffer;
    var next_msg_len:Int = -1;
    var callbacks:Array<String->Void> = [];
    var killed:Bool = false;

    public function new() {

    } //new

    public function start():Promise<String> {

        return new Promise<String>(function(resolve, reject) {

            Log.debug('Start haxe server');

            // TODO remove atom dependency
            var haxe:String = atom.config.get('haxe.haxe_path');
            if (haxe == null || haxe.length == 0) haxe = 'haxe';

            proc = ChildProcess.spawn(haxe, ['--wait', 'stdio']);
            buffer = new MessageBuffer();
            next_msg_len = -1;

            proc.stdout.on(ReadableEvent.Data, function(buf:Buffer) {
                Log.debug(buf.toString());
                // TODO log buf.toString()?
            });

            proc.stderr.on(ReadableEvent.Data, on_data);
            proc.on(ChildProcessEvent.Exit, on_exit);

            send(["-version"], null).then(function(data) {

                if (!RE_VERSION.match(data)) {
                    reject("Error parsing haxe version " + data);
                    return;
                }

                var major = Std.parseInt(RE_VERSION.matched(1));
                var minor = Std.parseInt(RE_VERSION.matched(2));
                var patch = Std.parseInt(RE_VERSION.matched(3));

                if (major < 3 || minor < 3) {
                    reject("Unsupported Haxe version! Minimum version required: 3.3.0");
                } else {
                    version = [major, minor, patch];
                    resolve("Started haxe server (version: " + major + "." + minor + "." + patch + ")");
                }

            }).catchError(function(error) {

                reject(error);

            }); //send

        }); //Promise

    } //start

    public function kill():Void {

        if (killed) return;
        killed = true;

        // Kill the process
        var pid = proc.pid;
        untyped require('tree-kill')(pid);

    }

    static var stdin_sep_buf = new Buffer([1]);

    public function send(args:Array<String>, ?token:CancellationToken, ?stdin:String):Promise<String> {

        return new Promise<String>(function(resolve, reject) {

            if (killed) {
                reject("This haxe server was killed and doesn't accept input anymore.");
                return;
            }

            if (stdin != null) {
                args.push('-D');
                args.push('display-stdin');
            }

            var chunks = [];
            var length = 0;
            for (arg in args) {
                var buf = new Buffer(arg + "\n");
                chunks.push(buf);
                length += buf.length;
            }

            if (stdin != null) {
                chunks.push(stdin_sep_buf);
                var buf = new Buffer(stdin);
                chunks.push(buf);
                length += buf.length + stdin_sep_buf.length;
            }

            var len_buf = new Buffer(4);
            len_buf.writeInt32LE(length, 0);
            proc.stdin.write(len_buf);
            proc.stdin.write(Buffer.concat(chunks, length));

            callbacks.push(function(data) {
                if (data == null || (token != null && token.canceled)) {
                    resolve(null);
                    return;
                }

                var buf = new StringBuf();
                var has_error = false;
                for (line in data.split("\n")) {
                    switch (line.fastCodeAt(0)) {
                        case 0x01: // print
                            trace("Haxe print:\n" + line.substring(1).replace("\x01", "\n"));
                        case 0x02: // error
                            has_error = true;
                        default:
                            buf.add(line);
                            buf.addChar("\n".code);
                    }
                }

                var data = buf.toString().trim();

                if (has_error) {
                    reject(data);
                    return;
                }

                try {
                    resolve(data);
                } catch (e:Dynamic) {
                    reject("Exception while handling haxe server response: " + e);
                }
            });

        }); //Promise

    } //call

    function on_data(data):Void {

        buffer.append(data);

        while (true) {
            if (next_msg_len == -1) {
                var length = buffer.try_read_length();
                if (length == -1)
                    return;
                next_msg_len = length;
            }

            var msg = buffer.try_read_content(next_msg_len);
            if (msg == null) return;

            next_msg_len = -1;
            var cb = callbacks.shift();
            if (cb != null) cb(msg);
        }

    } //on_data

    function on_exit(code:Int, message:String):Void {

        Log.debug('Haxe server was killed: ' + code + ', ' + message);

    } //on_exit

} //HaxeServer

private class MessageBuffer {

    static inline var DEFAULT_SIZE = 8192;

    var index:Int;
    var buffer:Buffer;

    public function new() {

        index = 0;
        buffer = new Buffer(DEFAULT_SIZE);

    } //new

    public function append(chunk:Buffer):Void {

        if (buffer.length - index >= chunk.length) {
            chunk.copy(buffer, index, 0, chunk.length);

        } else {
            var new_size = (Math.ceil((index + chunk.length) / DEFAULT_SIZE) + 1) * DEFAULT_SIZE;

            if (index == 0) {
                buffer = new Buffer(new_size);
                chunk.copy(buffer, 0, 0, chunk.length);
            } else {
                buffer = Buffer.concat([buffer.slice(0, index), chunk], new_size);
            }
        }

        index += chunk.length;

    } //append

    public function try_read_length():Int {

        if (index < 4)
            return -1;

        var length = buffer.readInt32LE(0);
        buffer = buffer.slice(4);
        index -= 4;

        return length;

    } //try_read_length

    public function try_read_content(length:Int):String {

        if (index < length)
            return null;

        var result = buffer.toString("utf-8", 0, length);
        var nextStart = length;

        buffer.copy(buffer, 0, nextStart);
        index -= nextStart;

        return result;

    } //try_read_content

} //MessageBuffer
