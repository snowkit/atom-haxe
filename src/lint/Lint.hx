package lint;

import utils.Promise;

import atom.TextEditor;

import plugin.Plugin.state;

import lint.DefaultLinter;

class Lint {

    public static function lint_project(editor:TextEditor):Promise<Dynamic> {

        if (state != null && state.is_valid()) {

            if (state.linter != null) {

                return state.linter.lint(editor);

            }

        }

        return new Promise<Dynamic>(function(resolve, reject) {

            resolve([]);

        }); //Promise

    } //lint_project

}
