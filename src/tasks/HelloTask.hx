package tasks;

import utils.WorkerTask;
import platform.Log;

typedef Params = {
    var name:String;
}

typedef Result = {
    var value:String;
}

class HelloTask extends WorkerTask<Params,Result> {

    override function run(resolve:Result->Void, reject:Dynamic->Void) {
        Log.info('Hello '+params.name);
        resolve({value: "Hello "+params.name});
    }

}
