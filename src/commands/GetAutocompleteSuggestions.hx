package commands;

import utils.Command;

private typedef Params = {
    var file_path:String;
    var file_contents:String;
    var file_position:Int;
}

private typedef Result = {
    var suggestions:Array<Suggestion>;
}

private typedef Suggestion = {

}

class GetAutocompleteSuggestions extends Command<Params, Result> {

    override function execute(resolve:Result->Void, reject:Dynamic->Void) {

        resolve(null);

    } //execute

}
