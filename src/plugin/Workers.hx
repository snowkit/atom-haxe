package plugin;

import utils.Worker;

class Workers {

    public var main(get,null):Worker;
    private function get_main():Worker { return main; }

    public var background(get,null):Worker;
    private function get_background():Worker { return background; }

    public var current(get,null):Worker;
    private function get_current():Worker { return background.process_kind == CURRENT ? background : main; }

    public var other(get,null):Worker;
    private function get_other():Worker { return background.process_kind == CURRENT ? main : background; }

    public function new() {
            // Check if there is a parent process
        var has_parent_process:Bool = false;
        has_parent_process = platform.atom.ParentProcess.has_parent_process();

        if (has_parent_process) {
                // Background process setup
            background = new Worker({process_kind: CURRENT});
            main = new Worker({process_kind: PARENT, current_worker: background});
        }
        else {
                // Main process setup
            main = new Worker({process_kind: CURRENT});
            background = new Worker({process_kind: CHILD, current_worker: main});
        }

    } //new

    public function destroy():Void {

        main.destroy();
        main = null;

        background.destroy();
        background = null;

    } //destroy

}
