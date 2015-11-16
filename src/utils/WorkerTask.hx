package utils;

#if macro
import haxe.macro.Context;
import haxe.macro.Expr;
#end

/**
 A WorkerTask is used to encapsulate code that can be run
 on the same or another process by letting a Worker run it.
 */
@:autoBuild(utils.WorkerTaskValidator.validate())
class WorkerTask<P,R> {

    private static var next_id:Int = 0;

    public var id(get,null):Int;
    public function get_id():Int { return id; }

    public var params:P;
    public var result:R;

    public function new(params:P) {
        this.id = next_id++;
        this.params = params;
    }

    @:allow(utils.Worker)
    private function internal_run(resolve:WorkerTask<P,R>->Void, reject:Dynamic->Void):Void {
        try {
            run(function(r) {
                result = r;
                resolve(this);
            }, reject);
        } catch (e:Dynamic) {
            reject(e);
        }
    }

    private function run(resolve:R->Void, reject:Dynamic->Void):Void {}

    private function toString():String {
        return untyped(Type.getClass(this).__name__[1]) + "#" + id;
    }

}

class WorkerTaskValidator {

    macro public static function validate():Array<Field> {

        var has_run_method = false;
        var fields = Context.getBuildFields();
        var local_class = Context.getLocalClass();

        for (field in fields) {
            if (field.name == 'run') {
                switch (field.kind) {
                case FFun(f):
                    has_run_method = true;
                default:
                }
                break;
            }
        }

        if (!has_run_method) {
            Context.fatalError("WorkerTask subclass should override run method", local_class.get().pos);
        }

        return fields;
    }

}
