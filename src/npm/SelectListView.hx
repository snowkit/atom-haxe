package npm;

@:jsRequire("atom-space-pen-views", "SelectListView")
extern class SelectListView<T> {
    function new();
        /** Essential: Create a view for the given model item. */
    function viewForItem(item:T):Dynamic;
        /** Essential: Callback function for when an item is selected. */
    function confirmed(item:T):Void;
        /** Essential: Callback function for when the list display is cancelled. */
    function cancelled():Void;
        /** Essential: Set the array of items to display in the list. */
    function setItems(items:Array<T>):Void;
        /** Essential: Get the model item that is currently selected in the list view. */
    function getSelectedItem():T;
        /** Extended: Get the property name to use when filtering items. */
    function getFilterKey():String;
        /** Extended: Get the filter query to use when fuzzy filtering the visible elements. */
    function getFilterQuery():String;
        /** Extended: Set the maximum numbers of items to display in the list. */
    function setMaxItems(maxItems:Int):Void;
        /** Extended: Populate the list view with the model items previously set by calling {::setItems}. */
    function populateList():Void;
        /** Essential: Set the error message to display. */
    function setError(?message:String):Void;
        /** Essential: Set the loading message to display. */
    function setLoading(?message:String):Void;
        /** Extended: Get the message to display when there are no items. */
    function getEmptyMessage(itemCount:Int, filteredItemCount:Int):String;
        /** Essential: Cancel and close this select list view. */
    function cancel():Void;
        /** Extended: Focus the fuzzy filter editor view. */
    function focusFilterEditor():Void;
        /** Extended: Store the currently focused element. This element will be given back focus when {::cancel} is called. */
    function storeFocusedElement():Void;
}
