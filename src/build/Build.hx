package build;

import plugin.Plugin.state;

import utils.Log;

class Build {

    public static function run_build():Void {

        if (state.is_valid()) {

            if (state.builder != null) {
                state.builder.build();
            }

        } else {

            Log.warn('Unable to build because state is invalid');

        }

    } //run_build

}
