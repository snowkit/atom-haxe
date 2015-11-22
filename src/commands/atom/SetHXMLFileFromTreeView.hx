package commands.atom;

import atom.Atom;

import utils.Command;

import platform.Log;

import js.Node.require;
import js.node.Path;
import js.node.Fs;

import plugin.Plugin;

class SetHXMLFileFromTreeView extends Command<Dynamic, Bool> {

    override function execute(resolve:Bool->Void, reject:Dynamic->Void) {

        var treeview = Atom.packages.getLoadedPackage('tree-view');
        if (treeview == null) {
            reject("Cannot set an active HXML file from tree-view because the tree-view package is disabled.");
            return;
        }

        treeview = require(treeview.mainModulePath);

        var package_obj = treeview.serialize();
        var file_path = package_obj.selectedPath;

            // Assign a default consumer (hxml)
        Plugin.state.consumer = {
            name: 'default',
            hxml_cwd: Path.dirname(file_path),
            hxml_content: '' + Fs.readFileSync(file_path),
            hxml_file: file_path
        };

        Log.info("Active HXML file set to " + Plugin.state.consumer.hxml_file);

        resolve(true);
    }

}
