## 0.9.0 - Dev

* Working on shared haxe code implementation (see readme Future Plans)

## 0.8.3

* Fix empty buffer causing errors `#33`
* Ensure custom haxe path is used `#37` and logged

## 0.8.2

* Fix linter deprecations `#32`
* Implement project wide linting from new Linter API

## 0.8.1

* Add SERVICES.md documentation
* Update changelogs

## 0.8.0

* completion; Fix truncated type hint and return type on newer autocomplete-plus version
* completion; Exclude haxe completion providers with priority lower than 2 instead of 1
* NOTE: The version bump from 0.6.2 => 0.8.0 was an error, trying to correct it created unavailable downloads from the atom API so it was pushed up one to continue working.

## 0.6.1

* tidy up logging from build consumers, and so on to debug logging system/flag
* hxml state parsing handles spaces and parses more smartly to avoid problems from macro calls etc
* completion: various parsing improvements
* go to definition : various improvements and additions

## 0.6.0

* Update readme requirements to mention Haxe requirement
* Add initial go to definition (requires haxe 3.2.0+)
* Add initial top level completion (requires haxe 3.2.0+)
* fix line-comment command putting `/* */` instead of `//`
* fixes to tmp_path experimental option

## 0.5.1~0.5.3

* minor clean ups

## 0.5.0

* ensure completion is more stable with autocomplete-plus `2.6.0`
* many fixes in type parsing and display
* many fixes in experimental tmp file option
* fix byte offset with unicode
* lint shares code completion cache
* refactor for separating the future shared code

## 0.4.0 ~ 0.4.3

* add all dependencies to dependency check
* show more info on type hints
* more robust completion state detection
* add consumer build workflow
* fix bugs about tree view assumptions
* implement build system
* added unset project option
* make menus useful
* fix bug in hxml formatting
* completion improvements (filter suggestions, type hints, etc)
* port type parsing to new package
* linting fixes


## 0.3.0

* implemented consumer state handling
    - active consumer will be notified when it's being made inactive
    - prevents clobbering of state from multiple consumers
* implemented error linting
* implemented dependency check with notifications
    - package will abort until installed
    - restart after installing if needed
* implemented prelim completion
    - still very wip, but just about usable
    - completes every char typed atm
* fix scrolling on completion debug views
* fix deactivation errors
    - resolves server being weird
    - resolves cleanup

## 0.1.0 ~ 0.2.0

* Renamed to haxe instead of atom-haxe
* Initial completion implementation
* Initial completion service provider
* Initial structure implemented
