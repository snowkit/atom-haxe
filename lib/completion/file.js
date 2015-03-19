
        // lib code
var   state = require('../haxe-state')
    , uuid = require('../utils/uuid')
    , log = require('../utils/log')
    , code = require('../utils/haxe-code')
        // node built in
    , path = require('path')
        // dep code
    , fs = require('fs-extra')

    // Save temporary files to run haxe autocomplete server over it
    // and extract completion lists and types.
    // This allows us to use haxe to extract informations from the project without
    // Having to parse them ourself, and with the `more forgiving` compilation
    // process used by the haxe server when performing completion/display
module.exports = {

        // Save file to get completion list of a variable of specific type
        // A key path (array of keys) can be added to get the completion list of a property inside the instance type.
    save_tmp_file_for_completion_list_of_instance_type: function(type, key_path) {
            // Setup
        var key_path_str;
        if (key_path == null || key_path.length == 0) {
            key_path_str = '';
        } else {
            key_path_str = key_path.join('.') + '.';
        }
        var file_contents = 'class AtomHaxeTempClass__ { public static function main():Void { var atomHaxeTempVar__:' + type + '; atomHaxeTempVar__.' + key_path_str;
        var file_name = 'AtomHaxeTempClass__.hx';

            // Save and return result
        return this.save_file_contents_in_temporary_path(file_contents, file_name);
    },

    save_tmp_file_for_completion_of_original_file: function(original_file_path, file_contents)
    {
            // Setup
        var cwd = state.hxml_cwd;

            // Extract package from contents, generate a sub-package name and compute relative path
        var package_name = code.extract_package(file_contents);
        var new_package_name = 'atom_tempfile__';
        if (package_name.length > 0) {
            new_package_name = package_name + '.' + new_package_name;
        }

            // Replace package in contents with a sub-package (that will still have access to the parent package)
        file_contents = code.replace_package(file_contents, new_package_name);

        var base_name = path.basename(original_file_path);
        var relative_file_path = path.join(new_package_name.split('.').join(path.sep), base_name);

            // Save and return result
        return this.save_file_contents_in_temporary_path(file_contents, relative_file_path);
    },

        // Save the given file contents with the requested file name and return info to use it
    save_file_contents_in_temporary_path: function(file_contents, relative_file_path) {

        var tmp_path = state.tmp_path;

        var hash = uuid.v1();

            // cp_path can be used to add the path to haxe server options
        var cp_path = path.join(tmp_path, hash);

            // We need to add an intermediate directory (here we name it 'haxe')
            // For the -cp to work fine
        var temporary_file_path = path.join(cp_path, relative_file_path);

            // Remove trailing slash on tmp_path if any
        if (tmp_path.charAt(tmp_path.length - 1) === path.sep) {
            tmp_path = tmp_path.slice(0, tmp_path.length - 1);
        }

            // Ensure this path is inside the temporary directory
        if (temporary_file_path.slice(0, tmp_path.length + 1) !== tmp_path + path.sep) {
                // No? Then let's not do something silly
            log.error('saving temporary file outside of tmp_path is forbidden: ' + temporary_file_path);
            return null;
        }

            // Perform save to disk
        fs.outputFileSync(temporary_file_path, file_contents, 'utf8');

            // Return info
        return {
            file_path:  temporary_file_path,
            cp_path:    cp_path,
            contents:   file_contents
        };
    },

        // Remove the temporary file related to the given file info
        // file_info is expected to be an object previously returned
        // by one the the save_* methods of this module.
    remove_tmp_file: function(file_info) {
        var to_remove;
        var tmp_path = state.tmp_path;

            // Don't try anything if tmp_path is not set
        if (!tmp_path) {
            log.error('cannot remove temporary file because tmp_path does\'t exist');
            return;
        }

            // Remove trailing slash on tmp_path if any
        if (tmp_path.charAt(tmp_path.length - 1) === path.sep) {
            tmp_path = tmp_path.slice(0, tmp_path.length - 1);
        }

            // Remove the cp directory, itself inside the temporary directory
        to_remove = path.normalize(file_info.cp_path);

        if (to_remove != null) {
                // Ensure this path is inside the temporary directory
            if (to_remove.slice(0, tmp_path.length + 1) === tmp_path + path.sep) {
                    // Remove it
                fs.removeSync(to_remove);
            } else {
                log.error('removing file outside of tmp_path is forbidden: ' + to_remove);
            }
        }
    }

}
