/**
	A handle to a resource that can be disposed. For example,
	{Emitter::on} returns disposables representing subscriptions. 
**/
package atom;
@:jsRequire("atom", "Disposable") extern class Disposable {
	/**
		Ensure that an `object` correctly implements the `Disposable`
		contract.
	**/
	static function isDisposable(object:Dynamic):Bool;
	/**
		Construct a Disposable
	**/
	function new(disposalAction:Dynamic):Void;
	/**
		Perform the disposal action, indicating that the resource associated
		with this disposable is no longer needed.
	**/
	function dispose():Dynamic;
}