package plugin.consumer;

import sys.io.File;

import haxe.Json;
import haxe.io.Path;

import utils.Promise;
import utils.Exec;

import tides.parse.HXML;

import plugin.Plugin.HXMLInfo;

    /** Experimental: generic haxe project consumer.
        Can be used to connect an external build system without
        creating a whole plugin for it. Any json file
        with a `haxe-project` key containing data that
        matches HaxeProjectOptions typedef is valid. */
class HaxeProjectConsumer {

    public var name:String = 'project';

    public var hxml:HXMLInfo;

    public var build_command:String;

    public var lint_command:String;

    public var project_file:String;

    public var cwd:String;

    public var options:HaxeProjectOptions;

    public function new(project_file:String) {

        this.project_file = project_file;
        cwd = Path.directory(project_file);

    } //new

    public function load():Promise<HaxeProjectConsumer> {

        return new Promise<HaxeProjectConsumer>(function(resolve, reject) {

            options = Reflect.field(Json.parse(File.getContent(project_file)), 'haxe-project');

            build_command = options.commands.build;
            lint_command = options.commands.lint;

                // Get hxml data
            var command = Exec.parse_command_line(options.commands.hxml);
            Exec.run(command.cmd, command.args, {cwd: cwd}).then(function(result:ExecResult) {

                hxml = {
                    content: result.out,
                    cwd: cwd
                };

                resolve(this);

            }).catchError(function(error) {

                reject(error);

            }); //Exec

        }); //Promise

    } //load

}

typedef HaxeProjectOptions = {

        /** Project commands */
    @:optional var commands:HaxeProjectCommands;

}

typedef HaxeProjectCommands = {

        /** Command to be executed on build */
    @:optional var build:String;

        /** Command to be executed on lint. If none is given,
            HXML args will be used instead when linting. */
    @:optional var lint:String;

        /** Command to get hxml args/data from project.
            Args will be used to query haxe server for
            code completion and linting (if no lint command given). */
    @:optional var hxml:String;

}
