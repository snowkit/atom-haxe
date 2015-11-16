package commands;

import utils.Command;
import state.State;

typedef SynchronizeStateParams = {
    var values: Dynamic;
}

class SynchronizeState extends Command<SynchronizeStateParams,Bool> {

    override function execute(resolve:Bool->Void, reject:Dynamic->Void) {
            // Assign received values
        @:privateAccess
        State.assign_values(params.values);

        resolve(true);
    }

}
