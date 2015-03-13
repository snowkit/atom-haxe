
            //atom built in
    var   atom_panels = require('atom-message-panel')
        , MessagePanelView = atom_panels.MessagePanelView
        , PlainMessageView = atom_panels.PlainMessageView

module.exports = {

    init: function() {
        this.view = new MessagePanelView({
            title: 'Haxe'
        });
    },

    dispose: function() {
        this.view.dispose();
    },

//Public API

    error: function(message, clear) {
        this._msg(message, 'error', clear);
    },

    success: function(message, clear) {
        this._msg(message, 'success', clear);
    },

    debug: function(message, clear) {
        var _debug = atom.config.get('atom-haxe.debug_logging');
        if(_debug) {
            this._msg(message, null, clear);
        }
    },

    info: function(message, clear) {
        this._msg(message, null, clear);
    },

    msg: function(message, clear) {
        this._msg(message, null, clear);
    },

//Internal

    _msg : function(message, type, clear) {

        var typename;

        if(clear) this.view.clear();
        if(type) typename = 'text-'+type;

        var msg = new PlainMessageView({
            message: message,
            className: typename
        });

        this.view.attach();
        this.view.add( msg );
        this.view.body.scrollTop(1e10);

    } //_msg

} //module.exports
