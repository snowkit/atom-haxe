package utils;

class CancellationToken {

    public var canceled(default,null):Bool = false;

    public function new() {

    } //new

    public function cancel():Void {

        canceled = true;

    } //cancel

}
