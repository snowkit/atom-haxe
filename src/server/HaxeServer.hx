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

class HaxeServer {

    static var RE_VERSION = ~/^(\d+)\.(\d+)\.(\d+)(?:\s.*)?$/;

    var proc:ChildProcessObject;
    var version:Array<Int>;
    var buffer:MessageBuffer;
    var next_msg_len:Int;
    var callbacks:Array<String->Void> = [];

    public function new() {

    } //new

    public function start():Promise<String> {

        return new Promise<String>(function(resolve, reject) {

            var haxe:String = atom.config.get('haxe.haxe_path');
            if (haxe == null || haxe.length == 0) haxe = 'haxe';

            proc = ChildProcess.spawn(haxe, ['--wait', 'stdio']);
            buffer = new MessageBuffer();

            proc.stdout.on(ReadableEvent.Data, function(buf:Buffer) {
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

    public function send(args:Array<String>, stdin:String):Promise<String> {

        return new Promise<String>(function(resolve, reject) {



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

    function on_exit(code, message):Void {


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
