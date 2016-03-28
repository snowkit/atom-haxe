package service;

import plugin.Plugin;

    /** Service provided by the atom-haxe plugin */
typedef HaxeService = {
        /** Set the current haxe service consumer.
            This will replace any existing consumer. */
    function setConsumer(consumer:Consumer):Void;
}
