package commands;

import utils.Command;
import utils.HxmlUtils;

import platform.Log;

import context.State.state;

class SetHXMLFileFromTreeView extends Command<Dynamic, Bool> {

    override function execute(resolve:Bool->Void, reject:Dynamic->Void) {

        state.consumer = {
            name: 'default',
            hxml_cwd: '',
            hxml_content: '',
            hxml_file: ''
        };
        state.synchronize();

        resolve(true);
    }

}
