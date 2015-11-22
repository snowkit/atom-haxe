package commands;

import utils.Command;

import support.Support.state;

private typedef Params = {
    var values: Dynamic;
}

class SynchronizeState extends Command<Params, Bool> {

    override function execute(resolve:Bool->Void, reject:Dynamic->Void) {
            // Assign received values
        state.unserialize(params.values);

        resolve(true);
    }

}
