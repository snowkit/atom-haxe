
  //atom-haxe config module
  //All config values are here.

module.exports = {

    server_activation_start_delay:{
        title: 'Activation: Start up delay',
        description: 'Time in seconds. The delay before starting the completion server on Atom startup. This simply prevents any unnecessary slow down on Atom launch.',
        type: 'number',
        default: 3.0
    },

    server_port: {
        title:'Haxe Completion Server port',
        description: 'The port that the completion server will --wait on.',
        type: 'integer',
        default:6112
    },

    haxe_path: {
        title:'Haxe executable path',
        description: 'Only needed if you have configured a custom Haxe location.',
        type: 'string',
        default:'haxe'
    },

    build_selectors: {
        title:'Build: allowed file scopes',
        description: 'When triggering a build command, only file scope in this list will trigger.',
        type: 'string',
        default:'source.haxe, source.hxml'
    },

    debug_logging: {
        title:'Debug Logging',
        description: 'Enable to get more in depth logging for debugging problems with the package',
        type: 'boolean',
        default:'false'
    }

} //module.exports
