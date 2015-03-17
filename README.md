# atom-haxe
atom.io haxe plugin, includes completion, building, error checking and more.

## Active development
Please note that this package is in active development, you're bound to find
some rough edges and pain points. Issues, feedback and suggestions are welcome.

Thanks!

## Goals

- Provide a definitive plugin for all Haxe features
    - code error linting (_usable_)
    - code completion (_usable_)
    - hxml build workflow (_usable_)
    - api doc integration (_future_)
    - code / doc hinting (_future_)
- No library/framework specifics and no bloat

_usable: done but being polished/tested._
_future: not started yet_
_done: completed and polished_

![img](http://i.imgur.com/rZMbs21.gif)

## Requirements
Install these from atom Settings -> Install

- requires `language-haxe` package
- requires `linting` package
- requires `automcomplete-plus` package

## Usage

This usage applies only if using hxml only build workflow.
If you are using a package that handles this for you (like `flow`) then
this does not apply, and you should read the documentation for that package.

- Right click a HXML file in the tree view
- Set as active HXML file

This will activate the hxml file, and use it for completion + builds.
You can unset the project state from the Packages -> Haxe menu.

**completion**
Completion happens as you type, including in function arguments and even typedefs.

**linting**
Linting happens when you save the file currently.

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

Once the completion features and parsing have been finalized, the goal
is to port those specific pieces to a Haxe library that can be shared
by the sublime plugins (python), the atom plugins (js) to allow parity
and shared code base across all major completion features. Since haxe
can generate many languages, it has the potential to be used in java/cs/cpp
based IDE's as well.
