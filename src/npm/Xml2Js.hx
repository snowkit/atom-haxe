package npm;

// TODO remove this in favor of haxe's built-in XML support.
// Will need to update some portions of code in the project.

@:jsRequire("xml2js")
extern class Xml2Js {

    static function parseString(xml:String, callback:Dynamic->Dynamic->Void):Void;

}
