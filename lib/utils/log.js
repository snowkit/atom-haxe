
            //atom built in
    var   atom_panels = require('atom-message-panel')
        , MessagePanelView = atom_panels.MessagePanelView
        , PlainMessageView = atom_panels.PlainMessageView

module.exports = {

    visible : false,

    init: function() {

        this.view = new MessagePanelView({
            title: 'Haxe'
        });

    },

    dispose: function() {
        this.view.dispose();
    },

//Public API

    show: function() {
        this.view.attach();
        this.visible = true;
    },

    hide: function() {
        this.view.close();
        this.visible = false;
    },

    toggle: function() {
        console.log(this.visible);
        this.visible = !this.visible;
        if(this.visible) this.show();
        else this.hide();
    },

    error: function(message, clear) {
        this._msg(message, 'error', clear);
    },

    success: function(message, clear) {
        this._msg(message, 'success', clear);
    },

    debug: function(message, clear) {
        var _debug = atom.config.get('haxe.debug_logging');
        if(_debug) {
            this._msg(message, null, clear);
        }
    },

    msg: function(message, clear) {
        this._msg(message, null, clear);
    },

    info: function(message, clear) {
        this._msg(message, null, clear);
    },

//Internal

    _msg : function(message, type, clear, sticky) {

        var typename;

        if(clear) this.view.clear();
        if(type) typename = 'text-'+type;

        var msg = new PlainMessageView({
            message: message,
            className: typename
        });

        this.view.add( msg );
        this.view.body.scrollTop(1e10);
        this.show();

        if(!sticky) {
            clearTimeout(this.timeoutid);
                //:TODO: could probably config the timeout
            this.timeoutid = setTimeout(this.hide.bind(this), 3000);
        }

    } //_msg

} //module.exports
