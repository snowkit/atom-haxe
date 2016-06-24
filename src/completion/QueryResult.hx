package completion;

import utils.Log;
import tides.parse.Haxe;

using StringTools;

enum QueryResultKind {
    TYPE;
    LIST;
    UNKNOWN;
}

enum QueryResultListItemKind {

    VARIABLE;
    METHOD;
    PACKAGE;
    LOCAL;
    GLOBAL;
    MEMBER;
    STATIC;
    TYPE;
    ENUM;
    VALUE;

    POSITION;
}

typedef QueryResultListItem = {

    @:optional var kind:QueryResultListItemKind;

} //QueryResultListItem

typedef QueryResultListCompletionItem = {

    > QueryResultListItem,

    @:optional var name:String;

    @:optional var type:HaxeComposedType;

    @:optional var module:String;

    @:optional var description:String;

} //QueryResultListCompletionItem

typedef QueryResultListPositionItem = {

    > QueryResultListItem,

    @:optional var file:String;

    @:optional var line:Int;

    @:optional var characters:Array<Int>;

} //QueryResultListPositionItem

class QueryResult {

    public var xml(default,null):Xml;

    public var kind(default,null):QueryResultKind;

    public var parsed_type(default,null):HaxeComposedType;

    public var parsed_list(default,null):Array<QueryResultListItem>;

    public function new(xml_string:String) {

        xml = Xml.parse(xml_string).firstElement();

        parse_xml();

    } //new

/// Parsing

    function parse_xml() {

        var nodeName = xml.nodeName;

        switch(nodeName) {

            case 'type':
                kind = TYPE;
                parsed_type = Haxe.parse_composed_type(xml.firstChild().nodeValue);

            case 'list':
                kind = LIST;
                parsed_list = [];

                for (el in xml.elementsNamed('i')) {
                    var item:QueryResultListCompletionItem = {};

                    switch (el.get('k')) {
                        case 'var':
                            item.kind = VARIABLE;
                        case 'method':
                            item.kind = METHOD;
                        case 'type':
                            item.kind = TYPE;
                        case 'package':
                            item.kind = PACKAGE;
                        default:
                            item.kind = VALUE;
                    }

                    item.name = el.get('n');

                    for (t in el.elementsNamed('t')) {
                        item.type = Haxe.parse_composed_type(t.firstChild().nodeValue);
                        break;
                    }

                    for (d in el.elementsNamed('d')) {
                        item.description = d.firstChild().nodeValue.trim();
                        break;
                    }

                    parsed_list.push(item);
                }

                for (el in xml.elementsNamed('pos')) {
                    var item:QueryResultListPositionItem = {
                        kind: POSITION
                    };

                    var position = Haxe.parse_position(el.firstChild().nodeValue.trim());

                    item.file = position.file;
                    item.line = position.line;
                    item.characters = position.characters;

                    parsed_list.push(item);
                }

            case 'il':
                kind = LIST;
                parsed_list = [];

                for (el in xml.elementsNamed('i')) {
                    var item:QueryResultListCompletionItem = {};

                    switch (el.get('k')) {
                        case 'local':
                            item.kind = LOCAL;
                        case 'member':
                            item.kind = MEMBER;
                        case 'static':
                            item.kind = STATIC;
                        case 'enum':
                            item.kind = ENUM;
                        case 'global':
                            item.kind = GLOBAL;
                        case 'type':
                            item.kind = TYPE;
                        case 'package':
                            item.kind = PACKAGE;
                        default:
                            item.kind = VALUE;
                    }

                    item.name = el.firstChild().nodeValue;

                    item.module = el.get('p');

                    var t = el.get('t');
                    if (t != null) {
                        item.type = Haxe.parse_composed_type(t);
                    }

                    for (d in el.elementsNamed('d')) {
                        item.description = d.firstChild().nodeValue.trim();
                        break;
                    }

                    parsed_list.push(item);
                }

            default:
                kind = UNKNOWN;
                Log.warn('Unknown completion result');
        }

    } //parse_query_result

}
