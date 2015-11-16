package utils;

@:enum abstract PromiseState(Int) from Int to Int {
        /** Initial state, not fulfilled or rejected */
    var pending = 0;
        /** Successful operation */
    var fulfilled = 1;
        /** Failed operation */
    var rejected = 2;
}

    /** Strongly-typed es6-style promises on top of promhx implementation
        Some parts taken from: https://github.com/underscorediscovery/hxpromise */
class Promise<T> {

    private var _promise:promhx.Promise<T>;
    private var _deferred:promhx.Deferred<T>;

    public var length(get,never):Int;
    inline private function get_length():Int { return 1; }

    public function new(executor:(T->Void)->(Dynamic->Void)->Void) {
            // Just create empty promise if no executor is provided
        if (executor == null) return;
             // Init underlying promise
        _deferred = new promhx.Deferred<T>();
        _promise = new promhx.Promise<T>(_deferred);
            // Run executor
        executor(_deferred.resolve, _promise.reject);

    } //new

        /** The error function returns a Promise and deals with rejected cases only.
            It behaves the same as calling then(null, on_rejected). */
    public function error(on_rejected:Dynamic->Void):Promise<T> {

        _promise.catchError(on_rejected);
        return this;

    } //error

        /** The then function returns a Promise. It takes two arguments,
            both are callback functions for the success and failure cases of the Promise. */
    public function then<A>(on_fulfilled:T->A, ?on_rejected:Dynamic->Void):Promise<A> {

        if (on_fulfilled == null) {
            on_fulfilled = function(val) { return null; }
        }

        var prom = _promise.then(on_fulfilled);
        if (on_rejected != null) _promise.catchError(on_rejected);
        var ret = new Promise<A>(null);
        ret._promise = prom;
        return ret;

    } //then

        /** The Promise.reject function returns a Promise object
            that is rejected with the optional reason. */
    public static function reject<T>(?reason:T) {

        return new Promise(function(ok, no){
            no(reason);
        });

    } //reject

        /** The static Promise.resolve function returns a Promise object
            that is resolved with the given value. */
    public static function resolve<T>(?val:T) {

        return new Promise<T>(function(ok, no){
            ok(val);
        });

    } //resolve

        /** The Promise.all(iterable) function returns a promise that
            resolves when all of the promises in the iterable argument
            have resolved. The result is passed as an array of values
            from all the promises.
            If any of the passed in promises rejects, the all Promise
            immediately rejects with the value of the promise that rejected,
            discarding all the other promises whether or not they have resolved. */
    public static function all(list:Array<Promise<Dynamic>>):Promise<Array<Dynamic>> {

        return new Promise<Array<Dynamic>>(function(ok, no) {
            var current = 0;
            var total = list.length;
            var fulfill_result = [];
            var reject_result = null;
            var all_state:PromiseState = pending;

            var single_ok = function(index, val) {

                if (all_state != pending) return;

                current++;
                fulfill_result[index] = val;

                if (total == current) {
                    all_state = fulfilled;
                    ok(fulfill_result);
                }

            }

            var single_err = function(val) {

                if (all_state != pending) return;

                all_state = rejected;
                reject_result = val;
                no(reject_result);

            }

            var index = 0;
            for (promise in list) {
                promise.then(single_ok.bind(index,_)).error(single_err);
                index++;
            }
        });

    } //all

        /** The Promise.race function returns a promise that
            resolves or rejects as soon as one of the promises in the
            list resolves or rejects, with the value or reason from that promise. */
    public static function race(list:Array<Promise<Dynamic>>):Promise<Dynamic> {

        return new Promise<Dynamic>(function(ok,no) {
            var settled = false;
            var single_ok = function(val) {
                if (settled) return;
                settled = true;
                ok(val);
            }

            var single_err = function(val) {
                if (settled) return;
                settled = true;
                no(val);
            }

            for (promise in list) {
                promise.then(single_ok).error(single_err);
            }
        });

    } //race
}
