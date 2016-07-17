package plugin.ui;

import atom.Atom.atom;
import atom.Disposable;

import plugin.Plugin.state;
import plugin.consumer.HaxeProjectConsumer;

import js.Browser.document;
import js.html.AnchorElement;
import js.html.DivElement;

import utils.SelectList;
import utils.Log;

using StringTools;

typedef AtomStatusBar = {

    function addLeftTile(options:{item:Dynamic, priority:Int}):Void;

    function addRightTile(options:{item:Dynamic, priority:Int}):Void;

} //AtomStatusBar

class StatusBar {

    public static var atom_status_bar:AtomStatusBar;

    static var element:AnchorElement;

    static var container:DivElement;

    static var tooltip:Disposable;

    public static function update():Void {

        if (atom_status_bar == null) return;

        if (state != null && state.is_valid()) {

            if (tooltip != null) tooltip.dispose();

            if (state.hxml.file != null) {
                show();

                tooltip = atom.tooltips.add(element, {title: state.hxml.file});
                element.textContent = state.hxml.file.substring(state.hxml.file.replace('\\', '/').lastIndexOf('/') + 1);
            }
            else if (state.consumer.name == 'project') {
                show();

                var consumer:HaxeProjectConsumer = cast state.consumer;

                tooltip = atom.tooltips.add(element, {title: consumer.project_file});
                if (consumer.options.name != null) {
                    element.textContent = consumer.options.name;
                } else {
                    element.textContent = consumer.project_file.substring(consumer.project_file.replace('\\', '/').lastIndexOf('/') + 1);
                }

                if (consumer.selected_target != null && consumer.selected_target.name != null) {
                    element.textContent += ' (' + consumer.selected_target.name + ')';
                }
            }
            else {
                hide();
            }
        }
        else {
            hide();
        }

    } //update

    static function show():Void {

        if (element == null) {

            element = document.createAnchorElement();
            element.id = 'status-bar-haxe';
            element.href = '#';
            element.textContent = '';
            element.addEventListener('click', function(e) {

                element.blur(); // To prevent any color change
                e.preventDefault();

                if (state.is_valid() && state.consumer.name == 'project') {
                    var items = [];
                    var consumer:HaxeProjectConsumer = cast state.consumer;

                    items.push({
                        title: consumer.selected_target.name,
                        subtitle: consumer.selected_target.commands.build,
                        data: consumer.selected_target
                    });

                    for (target in consumer.options.targets) {
                        if (target != consumer.selected_target) {
                            items.push({
                                title: target.name,
                                subtitle: target.commands.build,
                                data: target
                            });
                        }
                    }

                    SelectList.display(items)
                    .then(function(result:Dynamic) {
                            // Update target
                        consumer.set_target(result.data).then(function(result) {
                            state.consumer = cast consumer;

                        }).catchError(function(error) {
                            Log.error(error);
                        });

                    }).catchError(function(error) {
                        // Cancelled
                    });
                }

                return false;
            });

            container = document.createDivElement();
            container.className = 'inline-block';
            container.appendChild(element);

            atom_status_bar.addLeftTile({item: container, priority: 100});
        }
        else {

            element.className = '';
        }

    } //show

    static function hide():Void {

        if (tooltip != null) {
            tooltip.dispose();
            tooltip = null;
        }

        if (element != null) {
            element.className = 'hidden';
            element.textContent = '';
        }

    } //hide

} //StatusBar
