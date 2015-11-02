/**
	Atom global for dealing with packages, themes, menus, and the window.
**/
package atom;
@:native("atom") extern class Atom {
	/**
		A {CommandRegistry} instance
	**/
	static var commands : atom.CommandRegistry;
	/**
		A {Config} instance
	**/
	static var config : atom.Config;
	/**
		A {Clipboard} instance
	**/
	static var clipboard : atom.Clipboard;
	/**
		A {ContextMenuManager} instance
	**/
	static var contextMenu : atom.ContextMenuManager;
	/**
		A {MenuManager} instance
	**/
	static var menu : atom.MenuManager;
	/**
		A {KeymapManager} instance
	**/
	static var keymaps : atom.KeymapManager;
	/**
		A {TooltipManager} instance
	**/
	static var tooltips : atom.TooltipManager;
	/**
		A {NotificationManager} instance
	**/
	static var notifications : atom.NotificationManager;
	/**
		A {Project} instance
	**/
	static var project : atom.Project;
	/**
		A {GrammarRegistry} instance
	**/
	static var grammars : atom.GrammarRegistry;
	/**
		A {PackageManager} instance
	**/
	static var packages : atom.PackageManager;
	/**
		A {ThemeManager} instance
	**/
	static var themes : atom.ThemeManager;
	/**
		A {StyleManager} instance
	**/
	static var styles : atom.StyleManager;
	/**
		A {DeserializerManager} instance
	**/
	static var deserializers : atom.DeserializerManager;
	/**
		A {ViewRegistry} instance
	**/
	static var views : atom.ViewRegistry;
	/**
		A {Workspace} instance
	**/
	static var workspace : atom.Workspace;
	/**
		Invoke the given callback whenever {::beep} is called.
	**/
	static function onDidBeep(callback:haxe.Constraints.Function):atom.Disposable;
	/**
		Invoke the given callback when there is an unhandled error, but
		before the devtools pop open
	**/
	static function onWillThrowError(callback:{ var originalError : Dynamic<Dynamic>; var message : String; var url : String; var line : Float; var column : Float; var preventDefault : haxe.Constraints.Function; } -> Dynamic):atom.Disposable;
	/**
		Invoke the given callback whenever there is an unhandled error.
	**/
	static function onDidThrowError(callback:{ var originalError : Dynamic<Dynamic>; var message : String; var url : String; var line : Float; var column : Float; } -> Dynamic):atom.Disposable;
	static function inDevMode():Bool;
	static function inSafeMode():Bool;
	static function inSpecMode():Bool;
	/**
		Get the version of the Atom application.
	**/
	static function getVersion():String;
	static function isReleasedVersion():Bool;
	/**
		Get the time taken to completely load the current window.
	**/
	static function getWindowLoadTime():Float;
	/**
		Open a new Atom window using the given options.
	**/
	static function open(options:{ var pathsToOpen : Array<Dynamic>; var newWindow : Bool; var devMode : Bool; var safeMode : Bool; }):Dynamic;
	/**
		Prompt the user to select one or more folders.
	**/
	static function pickFolder(callback:Array<Dynamic> -> Dynamic):Dynamic;
	/**
		Close the current window.
	**/
	static function close():Dynamic;
	/**
		Get the size of current window.
	**/
	static function getSize():Dynamic<Dynamic>;
	/**
		Set the size of current window.
	**/
	static function setSize(width:Float, height:Float):Dynamic;
	/**
		Get the position of current window.
	**/
	static function getPosition():Dynamic<Dynamic>;
	/**
		Set the position of current window.
	**/
	static function setPosition(x:Float, y:Float):Dynamic;
	/**
		Move current window to the center of the screen.
	**/
	static function center():Dynamic;
	/**
		Focus the current window.
	**/
	static function focus():Dynamic;
	/**
		Show the current window.
	**/
	static function show():Dynamic;
	/**
		Hide the current window.
	**/
	static function hide():Dynamic;
	/**
		Reload the current window.
	**/
	static function reload():Dynamic;
	static function isMaximized():Bool;
	static function isFullScreen():Bool;
	/**
		Set the full screen state of the current window.
	**/
	static function setFullScreen():Dynamic;
	/**
		Toggle the full screen state of the current window.
	**/
	static function toggleFullScreen():Dynamic;
	/**
		Visually and audibly trigger a beep.
	**/
	static function beep():Dynamic;
	/**
		A flexible way to open a dialog akin to an alert dialog.
	**/
	static function confirm(options:{ var message : String; @:optional
	var detailedMessage : String; @:optional
	var buttons : Dynamic; }):Float;
	/**
		Open the dev tools for the current window.
	**/
	static function openDevTools():Dynamic;
	/**
		Toggle the visibility of the dev tools for the current window.
	**/
	static function toggleDevTools():Dynamic;
	/**
		Execute code in dev tools.
	**/
	static function executeJavaScriptInDevTools():Dynamic;
}
