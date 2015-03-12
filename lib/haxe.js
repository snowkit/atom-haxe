
        // lib code
var   server = require('./completion/server')
    , query = require('./completion/query')
    , log = require('./completion/log')



module.exports = {

  cmds : [],
  config: require('./haxe-config'),

//Lifecycle

    //This is automatic, don't add anything heavy in here
  activate: function(state) {
    this._add_commands();
    server.init();
    log.init();
    query.init(state);
  },

  deactivate:function() {
    this._destroy_commands();
    server.dispose();
    log.dispose();
    query.dispose();
  },

  serialize: function() {
    return query.state;
  },

//Commands

    //toggle test command
  toggle: function() {
      console.log(query.state);
  },

    //this command is triggered by right clicking the tree view
    //and is using a selector to only have the .hxml files
  set_hxml_file_from_treeview: function(opt) {
      var el = window.document.getElementsByClassName('file entry list-item selected');
      if(el && el.length) {
          el = el[0];
          query.set_hxml_file(el.getPath());
      }
  },

//Providers

  query:function(options) {
    return query.get(options);
  },

    //handles the completion provider
    //for autocomplete-plus
  provide: function() {
    return require('./completion/provider');
  },


//Internal conveniences

  _add_commands:function() {
     this._add_command('toggle',        this.toggle.bind(this) );
     this._add_command('reset-server',  server.reset.bind(server) );
     this._add_command('stop-server',   server.stop.bind(server) );
     this._add_command('toggle-log',    log.toggle.bind(log) );
     this._add_command('set-hxml-file', this.set_hxml_file_from_treeview.bind(this) );
  },

  _destroy_commands:function() {
    for(var i = 0; i < this.cmds.length; ++i) {
      atom.commands.remove(this.cmds[i]);
    }
  },

  _add_command:function(name, func) {
    var cmd = atom.commands.add('atom-workspace', 'haxe:'+name, func);
    this.cmds.push(cmd);
    return cmd;
  },

} //module.exports
