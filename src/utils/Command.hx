package utils;

#if macro
import haxe.macro.Context;
import haxe.macro.Expr;
#end

    /** A Command is used to encapsulate code that can be run
        on the same or another process by letting a Worker run it. */
@:autoBuild(utils.CommandValidator.validate())
class Command<P,R> {

    private static var next_id:Int = 0;

    public var id(get,null):Int;
    public function get_id():Int { return id; }

    public var params:P;
    public var result:R;

    public function new(?params:P) {
        this.id = next_id++;
        this.params = params;
    }

        /** Run the command on the current process. */
    public function run():Promise<Command<P,R>> {

        return new Promise<Command<P,R>>(function(resolve, reject) {
            internal_execute(resolve, reject);
        });

    } //new

    @:allow(utils.Worker)
    private function internal_execute(resolve:Command<P,R>->Void, reject:Dynamic->Void):Void {

        try {
            execute(function(r) {
                result = r;
                resolve(this);
            }, reject);
        } catch (e:Dynamic) {
            reject(e);
        }

    } //internal_execute

    private function execute(resolve:R->Void, reject:Dynamic->Void):Void {}

    private function toString():String {
        return untyped(Type.getClass(this).__name__[1]) + "#" + id;
    }

}

class CommandValidator {

    macro public static function validate():Array<Field> {

        var has_execute_method = false;
        var fields = Context.getBuildFields();
        var local_class = Context.getLocalClass();

        for (field in fields) {
            if (field.name == 'execute') {
                switch (field.kind) {
                case FFun(f):
                    has_execute_method = true;
                default:
                }
                break;
            }
        }

        if (!has_execute_method) {
            Context.fatalError("Command subclass should override execute method", local_class.get().pos);
        }

        return fields;

    } //validate

}
