/**
	Represents the underlying git operations performed by Atom.
**/
package atom;
@:jsRequire("atom", "GitRepository") extern class GitRepository {
	/**
		Creates a new GitRepository instance.
	**/
	static function open(path:String, options:{ var refreshOnWindowFocus : Bool; }):atom.GitRepository;
	/**
		Destroy this {GitRepository} object.
	**/
	function destroy():Dynamic;
	/**
		Invoke the given callback when this GitRepository's destroy() method
		is invoked.
	**/
	function onDidDestroy(callback:haxe.Constraints.Function):atom.Disposable;
	/**
		Invoke the given callback when a specific file's status has
		changed. When a file is updated, reloaded, etc, and the status changes, this
		will be fired.
	**/
	function onDidChangeStatus(callback:{ var path : String; var pathStatus : Float; } -> Dynamic):atom.Disposable;
	/**
		Invoke the given callback when a multiple files' statuses have
		changed. For example, on window focus, the status of all the paths in the
		repo is checked. If any of them have changed, this will be fired. Call
		{::getPathStatus(path)} to get the status for your path of choice.
	**/
	function onDidChangeStatuses(callback:haxe.Constraints.Function):atom.Disposable;
	/**
		A {String} indicating the type of version control system used by
		this repository.
	**/
	function getType():Dynamic;
	function getPath():String;
	function getWorkingDirectory():String;
	function isProjectAtRoot():Dynamic;
	/**
		Makes a path relative to the repository's working directory. 
	**/
	function relativize():Dynamic;
	function hasBranch():Dynamic;
	/**
		Retrieves a shortened version of the HEAD reference value.
	**/
	function getShortHead(path:String):String;
	/**
		Is the given path a submodule in the repository?
	**/
	function isSubmodule(path:String):Bool;
	function getAheadBehindCount(reference:String, path:String):Dynamic;
	/**
		Get the cached ahead/behind commit counts for the current branch's
		upstream branch.
	**/
	function getCachedUpstreamAheadBehindCount(path:String):Dynamic<Dynamic>;
	function getConfigValue(path:String):Dynamic;
	function getOriginURL(path:String):Dynamic;
	function getUpstreamBranch(path:String):Dynamic;
	/**
		Gets all the local and remote references.
	**/
	function getReferences(path:String):Dynamic<Dynamic>;
	function getReferenceTarget(reference:String, path:String):String;
	function isPathModified(path:String):Dynamic;
	function isPathNew(path:String):Dynamic;
	/**
		Is the given path ignored?
	**/
	function isPathIgnored(path:String):Bool;
	/**
		Get the status of a directory in the repository's working directory.
	**/
	function getDirectoryStatus(path:String):Float;
	/**
		Get the status of a single path in the repository.
	**/
	function getPathStatus():Float;
	/**
		Get the cached status for the given path.
	**/
	function getCachedPathStatus(path:String):Float;
	function isStatusModified(status:Float):Dynamic;
	function isStatusNew(status:Float):Dynamic;
	/**
		Retrieves the number of lines added and removed to a path.
	**/
	function getDiffStats(path:String):Dynamic<Dynamic>;
	/**
		Retrieves the line diffs comparing the `HEAD` version of the given
		path and the given text.
	**/
	function getLineDiffs(path:String, text:String):Array<Dynamic>;
	/**
		Restore the contents of a path in the working directory and index
		to the version at `HEAD`.
	**/
	function checkoutHead(path:String):Bool;
	/**
		Checks out a branch in your repository.
	**/
	function checkoutReference(reference:String, create:Bool):Dynamic;
}