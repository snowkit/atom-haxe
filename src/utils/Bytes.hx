package utils;

import js.node.Buffer;

class Bytes {

    public static function string_length(str:String, ?encoding:String = 'utf8'):Int {

        return Buffer.byteLength(str, encoding);

    } //string_length

}
