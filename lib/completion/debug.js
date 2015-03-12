


module.exports = {

//Lifecycle

    init:function() {

        this.element = document.createElement('div');
        this.element.classList.add('haxe-completion-log');

          // Element for query logs
        this.content_query = document.createElement('div');
        this.content_query.innerHTML = "haxe / completion / query / log\n\n";
        this.content_query.classList.add('haxe-completion-log-query-content');

          // Element for server logs
        this.content_server = document.createElement('div');
        this.content_server.innerHTML = "haxe / completion / server / log\n\n";
        this.content_server.classList.add('haxe-completion-log-server-content');

        this.element.appendChild(this.content_query);
        this.element.appendChild(this.content_server);

        this.panel = atom.workspace.addRightPanel({
            visible: false,
            item: this.element
        });

    }, //init

    dispose:function() {
        this.element.remove();
        this.panel.destroy();
    },

//Public API

    set:function(val) {
        this.content.innerHTML = val;
        this.scroll_to_bottom();
    },

    query:function(val) {
        val = 'haxe / completion / query / ' + val;
        this.content_query.textContent += this._pre(val);
        this.scroll_to_bottom(this.content_query);
    },

    server:function(val) {
        val = 'haxe / completion / server / ' + val;
        this.content_server.textContent += this._pre(val);
        this.scroll_to_bottom(this.content_server);
    },

    scroll_to_bottom:function(el) {
        setImmediate(function(){
          el.scrollTop = el.scrollHeight;
        });
    },

//Commands (hooked in main)

    toggle:function() {
        if(this.panel.isVisible()) {
            this.panel.hide();
        } else {
            this.panel.show();
        }
    },

//Internal helpers

    _pre:function(val) {
        val += '\n';
        return val;
    },

} //exports
