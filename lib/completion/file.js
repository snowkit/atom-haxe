
        // lib code
var   state = require('../haxe-state')
    , uuid = require('../utils/uuid')
    , log = require('../utils/log')
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
        var relative_file_path = path.relative(cwd, original_file_path);

            // Save and return result
        return this.save_file_contents_in_temporary_path(file_contents, relative_file_path);
    },

        // Save the given file contents with the requested file name and return info to use it
    save_file_contents_in_temporary_path: function(file_contents, relative_file_path) {

        var tmp_path = state.tmp_path;

        var hash = uuid.v1();

            // cp_path can be used to add the path to haxe server options
        var cp_path = path.join(tmp_path, hash);

        var temporary_file_path = path.join(cp_path, relative_file_path);

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

            // Remove the cp directory, itself inside the temporary directory
        to_remove = file_info.cp_path;

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
