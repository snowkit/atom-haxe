package build;

import plugin.Plugin.state;

class Build {

    public static function run_build():Void {

        if (state.is_valid()) {

            if (state.builder != null) {
                state.builder.build();
            }

        }

    } //run_build

}
