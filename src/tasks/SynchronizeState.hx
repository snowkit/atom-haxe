package tasks;

import utils.WorkerTask;
import state.State;

typedef SynchronizeStateParams = {
    var values: Dynamic;
}

class SynchronizeState extends WorkerTask<SynchronizeStateParams,Bool> {

    override function run(resolve:Bool->Void, reject:Dynamic->Void) {
            // Assign received values
        @:privateAccess
        State.assign_values(params.values);

        resolve(true);
    }

}
