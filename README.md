# atom-haxe
atom.io haxe plugin, includes completion, error checking and more.

## Active development
Please note that this package is in development and this message will
be removed when it is ready for end users - in the mean time, file issues.

Thanks!

## Goals

- Provide a definitive plugin for all Haxe features
    - code error linting
    - code completion
    - hxml build workflow
    - api doc integration
    - code / doc hinting
- No library/framework specifics and no bloat

## Usage

This usage applies only if using hxml build workflow.
If you are using a package that handles this for you (like flow) then
this does not apply, and you should read the documentation for that package.

- Right click a HXML file in the tree view
- Set as active HXML file

This will use the hxml file when doing completion etc.

## Troubleshooting

Ctrl/Cmd + shift + P will open the command palette and run these commands.

**general**
- Enable debug logging in the settings
- Run haxe:Toggle log view if needed

**completion debugging**
- Run haxe:Toggle Completion Debug
    - The top area shows the queries to the completion cache server
    - The bottom area shows the server process log


## Status

Multiple contributors were coincidentally implementing the same features in
private repos over the same time frame. We have joined efforts to make the
best package possible. Currently, some things are implemented but
not yet in this repo, they are "migrating" and will be in soon.
