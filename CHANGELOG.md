## 0.6.0 - Dev


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
