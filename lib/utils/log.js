
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
        this.visible = !this.visible;
        if(this.visible) this.show();
        else this.hide();
    },

    error: function(message, clear, sticky) {
        this._msg(message, 'error', clear, sticky);
    },

    success: function(message, clear, sticky) {
        this._msg(message, 'success', clear, sticky);
    },

    debug: function(message, clear, sticky) {
        var _debug = atom.config.get('haxe.debug_logging');
        if(_debug) {
            this._msg(message, null, clear, sticky);
        }
    },

    msg: function(message, clear, sticky) {
        this._msg(message, null, clear, sticky);
    },

    info: function(message, clear, sticky) {
        this._msg(message, 'highlight', clear, sticky);
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

        clearTimeout(this.timeoutid);

        if(!sticky) {
                //:TODO: could probably config the timeout
            this.timeoutid = setTimeout(this.hide.bind(this), 5000);
        }

    } //_msg

} //module.exports
