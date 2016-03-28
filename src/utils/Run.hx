package utils;

import atom.Atom.atom;

import utils.Exec;

class Run {

    public static function haxe(args:Array<String>, ?options:ExecOptions, ?ondataout:String->Void, ?ondataerr:String->Void):Promise<ExecResult> {

        var cmd:String = atom.config.get('haxe.haxe_path', {});
        if (cmd == null || cmd.length == 0) cmd = 'haxe';

        return Exec.run(cmd, args, options, ondataout, ondataerr);

    } //haxe

    public static function haxelib(args:Array<String>, ?options:ExecOptions, ?ondataout:String->Void, ?ondataerr:String->Void):Promise<ExecResult> {

        var cmd:String = atom.config.get('haxe.haxelib_path', {});
        if (cmd == null || cmd.length == 0) cmd = 'haxelib';

        return Exec.run(cmd, args, options, ondataout, ondataerr);

    } //haxelib

}
