/**
	Searches local files for lines matching a specified regex.
**/
package atom;
@:jsRequire("atom", "DirectorySearch") extern class DirectorySearch {
	/**
		Implementation of `then()` to satisfy the *thenable* contract.
		This makes it possible to use a `DirectorySearch` with `Promise.all()`.
	**/
	function then():Dynamic;
	/**
		Cancels the search. 
	**/
	function cancel():Dynamic;
}