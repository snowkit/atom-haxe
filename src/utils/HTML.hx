package utils;

using StringTools;

class HTML {

    public static function escape(input:String):String {

        return input
            .replace('&', '&amp;')
            .replace('"', '&quot;')
            .replace('\'', '&#39;')
            .replace('<', '&lt;')
            .replace('>', '&gt;');

    } //escape

}
