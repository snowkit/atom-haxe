package tasks;

import utils.WorkerTask;
import utils.HxmlUtils;

import platform.Log;

import state.State;

typedef SetHXMLFileParams = {
    var path:String;
}

class SetHXMLFile extends WorkerTask<SetHXMLFileParams,Bool> {

    override function run(resolve:Bool->Void, reject:Dynamic->Void) {

        Log.debug('Set HXML File to ' + params.path);

        State.hxml_data = "";
        State.synchronize();

        resolve(true);
    }

}
