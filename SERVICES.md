## Haxe package services

For implementing framework specific build and completion workflow.

---

This package is a central package for Haxe user packages to share the implementation of code completion, build workflow and other features.
This means that in order for a framework to be supported, it must be implemented in its own package - and consume the services implemented by this package.

You can read about the Atom services here : http://blog.atom.io/2015/03/25/new-services-API.html

#### Configuring your package as a service consumer

Inside your `package.json` add a `consumedServices` node, which tells your package two things.
One is _which function to call when the service is consumed_ and the other is the exact version of the service to use.

Currently the only service endpoint to implement is called `haxe-completion.provider` and works by handing you a reference to the haxe package endpoint. In other words, it gives you an object with a function available to call, to configure the packages. This may change in the coming updates due to Atom API stabilizing, as this service was created before that.

```
  "consumedServices": {
    "haxe-completion.provider": {
      "versions": {
        "1.0.0": "completion_hook"
      }
    }
  }
```

In this consumer, the service will look for a function inside your _main_ package code called `completion_hook`.

#### Implement the callback function in your package main code

Your main package is defined in the `package.json` already, as `"main": "./lib/main.js"` or whatever you want it to be.
The function endpoint for the services go inside of this file, at the root module level.

Since currently the service will pass you a reference to the Haxe service itself, you would hang onto that reference and call functions on it.

An example implementation would look like this:

```
//Haxe package services consumer

    completion_hook: function(haxe_package) {
        this.haxe_package = haxe_package;
    }

```

Now you can make calls to the Haxe service directly, via `this.haxe_package.somethingHere()`.
As mentioned above, this is likely to change in an upcoming version due to the services API being finalized.

#### The Haxe package services only one active consumer at a time

Because of the way packages are singular, and would contend each other for the same resource, a single consumer is _set as current_ in the Haxe package at a time.

For example, if you're working with just haxe and a hxml file, that is the default consumer. If you then wanted to use a framework specific project (like flow or openfl or nme) you would set the active consumer to the package in use, each time you switch.

**Setting the active consumer via the service**

To change the consumer to your plugin you call the `set_completion_consumer` function on the Haxe package.
Note that this should only be done via user interaction - Do not set the consumer without the user intent.
The Haxe package will remember the last active consumer and it will retain it's active state across sessions.

The argument for the completion consumer function is a single object, with the following properties:

- `name`
    - Required.
    - The name of the consumer.
- `hxml_content`
    - Required.
    - Populate this with the HXML content for your project.
- `hxml_cwd`
    - Required.
    - The current working directory for the hxml content.
- `onConsumerLost`
    - Required.
    - The callback to notify you when the consumer was switched to another.
    - Disable features when not the active consumer to avoid conflicts when possible
- `does_build`
    - If your package handles the build, not relying on the Haxe default hxml build, set this to true.
- `onRunBuild`
    - The callback to notify you a build was triggered by the user.
- `onBuildSelectorQuery`
    - The callback to query _selectors_ that allow a build to run
    - These are additional to `source.haxe` which is the default
    - Example: `return ['source.json', 'source.xml']` would allow builds to run from these file types
    - This is a list of atom _selectors_ to trigger the build command
    - If the selector doesn't match these and the default, the build command will be ignored

An example below shows the completion consumer being configured for a package to handle the endpoints where appropriate.
As you can see above the process is very simple - and is all that is required at the moment.

```
this.haxe_package.set_completion_consumer({
    name:                   'mypackage',
    hxml_cwd:               this.project_dir,
    hxml_content:           this.project_hxml,
    does_build:             true,
    onRunBuild:             this.on_runbuild.bind(this),
    onBuildSelectorQuery:   this.on_buildselectorquery.bind(this),
    onConsumerLost:         this.on_consumerlost.bind(this),
});
```

Once the hxml data is correctly configured, all the haxe features should work as intended, because the haxe compiler is used directly.

#### Updating the hxml once set

Every time your package has updated hxml data and directory to run from, it should call this function again with updated information.
This would happen for example if they updated their project file, and the hxml was generated.

## Example implementation

The [flow](http://snowkit.org/flow) package implements the consumer model and build workflow of its own. It can be viewed in full at the [atom-flow](https://github.com/snowkit/atom-flow) repository for reference.

## Important Notes

There is often an "Atom way", and it's a good idea to be good to the users.
The same is probably true for framework specifics, try to respect the user workflow.

On top of that, the following guidelines are suggested:

- **Suggestions and feedback welcome**
    - As this is a community package to serve the Haxe users in the best way possible, we definitely welcome input.
- **Pay attention to the atom community packages**
    - There are many great libraries and packages already available for use with atom, so there is a lot of strong, consistently maintained work already done that you shouldn't redo unless absolutely necessary. Often times their work is that good, that it becomes a core package for Atom itself. Try not to cobble together things that have already been done in a way true to the Atom user space.
- **Keep an eye on version releases of this and related packages**
    - As the readme states the active development of the atom-haxe plugin and Future Plans section describe things are coming that may shake up the service API slightly. We will notify packages we are aware of when they land in master and are released.
- **Use the atom reporting features**
    - They are great, and ensure everyone using the packages have a consistent way to get problems addressed and in front of the correct eyes. Encourage users to use that when problems arise.
- **Don't create monolith packages.**
    - Create one package for a specific framework, and have it do ONLY the work needed for that package and no more. A package should only ever cater to one framework and do that well.
- **Don't duplicate functionality.**
    - Inside your framework package, don't recreate the Haxe (or other) package features. For example hxml only builds are handled by this package. Don't implement that inside your consumer, because the default consumer already has this feature. This allows every Haxe user using the Atom packages to share the same reliable workflow and consistency, and allows the community to adapt quickly by maintaining a single package.


## Conclusion

Don't forget to browse the [Atom documentation](https://atom.io/docs) and blogs!


