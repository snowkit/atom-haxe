/**
	Represents a directory on disk that can be watched for changes. 
**/
package atom;
@:jsRequire("atom", "Directory") extern class Directory {
	/**
		Configures a new Directory instance, no files are accessed.
	**/
	function new(directoryPath:String, symlink:Bool):Void;
	/**
		Creates the directory on disk that corresponds to `::getPath()` if
		no such directory already exists.
	**/
	function create(mode:Float):Dynamic;
	/**
		Invoke the given callback when the directory's contents change.
	**/
	function onDidChange(callback:haxe.Constraints.Function):atom.Disposable;
	function isFile():Bool;
	function isDirectory():Bool;
	function exists():Bool;
	function existsSync():Bool;
	/**
		Return a {Boolean}, true if this {Directory} is the root directory
		of the filesystem, or false if it isn't. 
	**/
	function isRoot():Dynamic;
	function getPath():String;
	function getRealPathSync():String;
	function getBaseName():String;
	function relativize():String;
	/**
		Traverse to the parent directory.
	**/
	function getParent():atom.Directory;
	/**
		Traverse within this Directory to a child File. This method doesn't
		actually check to see if the File exists, it just creates the File object.
	**/
	function getFile(filename:String):atom.File;
	/**
		Traverse within this a Directory to a child Directory. This method
		doesn't actually check to see if the Directory exists, it just creates the
		Directory object.
	**/
	function getSubdirectory(dirname:String):atom.Directory;
	/**
		Reads file entries in this directory from disk synchronously.
	**/
	function getEntriesSync():Array<Dynamic>;
	/**
		Reads file entries in this directory from disk asynchronously.
	**/
	function getEntries(callback:js.Error -> Array<Dynamic> -> Dynamic):Dynamic;
	/**
		Determines if the given path (real or symbolic) is inside this
		directory. This method does not actually check if the path exists, it just
		checks if the path is under this directory.
	**/
	function contains(pathToCheck:String):Bool;
}