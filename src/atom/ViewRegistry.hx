/**
	`ViewRegistry` handles the association between model and view
	types in Atom. We call this association a View Provider. As in, for a given
	model, this class can provide a view via {::getView}, as long as the
	model/view association was registered via {::addViewProvider}
**/
package atom;
@:jsRequire("atom", "ViewRegistry") extern class ViewRegistry {
	/**
		Add a provider that will be used to construct views in the
		workspace's view layer based on model objects in its model layer.
	**/
	function addViewProvider(modelConstructor:haxe.Constraints.Function, createView:haxe.Constraints.Function):atom.Disposable;
	/**
		Get the view associated with an object in the workspace.
	**/
	function getView(object:Dynamic):Dynamic;
}