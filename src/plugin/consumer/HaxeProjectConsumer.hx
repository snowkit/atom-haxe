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

    public var selected_target:HaxeProjectTarget;

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

        options = Reflect.field(Json.parse(File.getContent(project_file)), 'haxe-project');

            // Sanitize
        for (target in options.targets) {
            if (target.commands == null) target.commands = {};
        }

        var target = options.targets[0];
        return set_target(target);

    } //load

    public function set_target(target:HaxeProjectTarget):Promise<HaxeProjectConsumer> {

        selected_target = target;

        return new Promise<HaxeProjectConsumer>(function(resolve, reject) {

            build_command = selected_target.commands.build;
            lint_command = selected_target.commands.lint;

                // Get hxml data
            var command = Exec.parse_command_line(selected_target.commands.hxml);
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

    } //set_target

}

typedef HaxeProjectOptions = {

        /** Project name */
    @:optional var name:String;

        /** Project targets */
    @:optional var targets:Array<HaxeProjectTarget>;

}

typedef HaxeProjectTarget = {

        /** Target name */
    @:optional var name:String;

        /** Target commands */
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
