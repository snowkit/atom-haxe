package commands;

import utils.Command;
import context.State.state;

private typedef Params = {
    var values: Dynamic;
}

class SynchronizeState extends Command<Params, Bool> {

    override function execute(resolve:Bool->Void, reject:Dynamic->Void) {
            // Assign received values
        @:privateAccess
        state.assign_values(params.values);

        resolve(true);
    }

}
