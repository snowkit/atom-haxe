## 0.4.0 - Dev

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
