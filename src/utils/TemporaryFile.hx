package utils;

import atom.Atom.atom;

import haxe.io.Path;
import sys.io.File;
import sys.FileSystem;

class TemporaryFile {

    static var tmp_dir = Path.join([atom.project.getPaths()[0], '.ide', 'tmp']);

        /** Get or create a temporary file with the relative path
            and return the absolute path. */
    public static function get_or_create(relative_path:String, contents:String = ''):String {

        var absolute_path = Path.join([tmp_dir, relative_path]);

        if (!FileSystem.exists(absolute_path)) {

            var dir = absolute_path.substr(
                0,
                cast Math.max(
                    absolute_path.lastIndexOf('/'),
                    absolute_path.lastIndexOf('\\')
                )
            );

            if (!FileSystem.exists(dir)) {
                FileSystem.createDirectory(dir);
            }

            File.saveContent(absolute_path, contents);
        }

        return absolute_path;

    } //get_or_create

}
