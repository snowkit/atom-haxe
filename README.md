# atom-haxe

atom.io haxe plugin, includes completion, building, error checking and more.

## Haxe rewrite branch

This branch is a rewrite of the plugin into haxe language. It leverage latest
haxe compiler features to get better code completion. Haxe 3.3+ is required.

## How to use

You can use this development version on atom using git and apm:

```
# Clone repository and its submodules for the correct branch
git clone https://github.com/snowkit/atom-haxe.git
cd atom-haxe
git checkout haxe-rewrite
git submodule update --init --recursive

# Install node/atom dependencies
apm install

# Link it with atom
apm link .
```

## Active development

Please note that this package is in active development, you're bound to find
some rough edges and pain points. Issues, feedback and suggestions are welcome.

Thanks!

## Goals

- Provide a definitive plugin for all Haxe features
- No library/framework specific code but
- Flexible to libraries/frameworks (offering completion + build provider)

## Requirements

**Haxe** is required, and can be installed from http://haxe.org

By default, the plugin will use the `haxe` executable from your path/environment,
this can be configured in the settings, but is not usually required.

**Required Atom Packages**

Install these from atom Settings -> Install

- requires `linter` package
- requires `language-haxe` package
- requires `autocomplete-plus` package

## Usage

This usage applies only if using hxml only build workflow.
If you are using a package that handles this for you (like [flow](https://github.com/snowkit/atom-flow/)) then
this does not apply, and you should read the documentation for that package.

- Right click a HXML file in the tree view
- Set as active HXML file

This will activate the hxml file, and use it for completion + builds.
You can unset the project state from the Packages -> Haxe menu.

**completion**
Completion happens as you type.
For now, you might add "dot files" to Settings -> ignored Names,
For example adding `.*` would ignore the .tmp file generated for
completion. We are working on a more flexible solution.


**linting**
Linting only happens when you save the file.

## Issues / feedback

Please file issues at https://github.com/snowkit/atom-haxe !

## Features

#### code completion
![completion](http://i.imgur.com/OzN25ii.gif)
![typedefcompletion](http://i.imgur.com/7kDqcID.gif)

#### code linting
![linting](http://i.imgur.com/okGD6Ue.gif)

#### build workflow
![building](http://i.imgur.com/3Ldo6hJ.gif)


**future features**

- code / doc hinting

## Troubleshooting

Use the Packages -> Haxe -> Menu options to open various debug views.

**general**
- Enable debug logging in the settings
- Toggle log view

**completion debugging**
- Toggle Completion Debug
    - The top area shows the queries to the completion cache server
    - The bottom area shows the server process log


## Future plans

Currently the shared IDE code is in progress. [Visit the tides repo for info.](https://github.com/snowkit/tides)
This repo will migrate to being written in Haxe and using tides, in a branch. When it's ready for testers and usage we'll let you know!
