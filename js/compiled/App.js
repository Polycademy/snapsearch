(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
/*!
 * EventEmitter v4.2.7 - git.io/ee
 * Oliver Caldwell
 * MIT license
 * @preserve
 */

(function () {
	'use strict';

	/**
	 * Class for managing events.
	 * Can be extended to provide event functionality in other classes.
	 *
	 * @class EventEmitter Manages event registering and emitting.
	 */
	function EventEmitter() {}

	// Shortcuts to improve speed and size
	var proto = EventEmitter.prototype;
	var exports = this;
	var originalGlobalValue = exports.EventEmitter;

	/**
	 * Finds the index of the listener for the event in it's storage array.
	 *
	 * @param {Function[]} listeners Array of listeners to search through.
	 * @param {Function} listener Method to look for.
	 * @return {Number} Index of the specified listener, -1 if not found
	 * @api private
	 */
	function indexOfListener(listeners, listener) {
		var i = listeners.length;
		while (i--) {
			if (listeners[i].listener === listener) {
				return i;
			}
		}

		return -1;
	}

	/**
	 * Alias a method while keeping the context correct, to allow for overwriting of target method.
	 *
	 * @param {String} name The name of the target method.
	 * @return {Function} The aliased method
	 * @api private
	 */
	function alias(name) {
		return function aliasClosure() {
			return this[name].apply(this, arguments);
		};
	}

	/**
	 * Returns the listener array for the specified event.
	 * Will initialise the event object and listener arrays if required.
	 * Will return an object if you use a regex search. The object contains keys for each matched event. So /ba[rz]/ might return an object containing bar and baz. But only if you have either defined them with defineEvent or added some listeners to them.
	 * Each property in the object response is an array of listener functions.
	 *
	 * @param {String|RegExp} evt Name of the event to return the listeners from.
	 * @return {Function[]|Object} All listener functions for the event.
	 */
	proto.getListeners = function getListeners(evt) {
		var events = this._getEvents();
		var response;
		var key;

		// Return a concatenated array of all matching events if
		// the selector is a regular expression.
		if (evt instanceof RegExp) {
			response = {};
			for (key in events) {
				if (events.hasOwnProperty(key) && evt.test(key)) {
					response[key] = events[key];
				}
			}
		}
		else {
			response = events[evt] || (events[evt] = []);
		}

		return response;
	};

	/**
	 * Takes a list of listener objects and flattens it into a list of listener functions.
	 *
	 * @param {Object[]} listeners Raw listener objects.
	 * @return {Function[]} Just the listener functions.
	 */
	proto.flattenListeners = function flattenListeners(listeners) {
		var flatListeners = [];
		var i;

		for (i = 0; i < listeners.length; i += 1) {
			flatListeners.push(listeners[i].listener);
		}

		return flatListeners;
	};

	/**
	 * Fetches the requested listeners via getListeners but will always return the results inside an object. This is mainly for internal use but others may find it useful.
	 *
	 * @param {String|RegExp} evt Name of the event to return the listeners from.
	 * @return {Object} All listener functions for an event in an object.
	 */
	proto.getListenersAsObject = function getListenersAsObject(evt) {
		var listeners = this.getListeners(evt);
		var response;

		if (listeners instanceof Array) {
			response = {};
			response[evt] = listeners;
		}

		return response || listeners;
	};

	/**
	 * Adds a listener function to the specified event.
	 * The listener will not be added if it is a duplicate.
	 * If the listener returns true then it will be removed after it is called.
	 * If you pass a regular expression as the event name then the listener will be added to all events that match it.
	 *
	 * @param {String|RegExp} evt Name of the event to attach the listener to.
	 * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.addListener = function addListener(evt, listener) {
		var listeners = this.getListenersAsObject(evt);
		var listenerIsWrapped = typeof listener === 'object';
		var key;

		for (key in listeners) {
			if (listeners.hasOwnProperty(key) && indexOfListener(listeners[key], listener) === -1) {
				listeners[key].push(listenerIsWrapped ? listener : {
					listener: listener,
					once: false
				});
			}
		}

		return this;
	};

	/**
	 * Alias of addListener
	 */
	proto.on = alias('addListener');

	/**
	 * Semi-alias of addListener. It will add a listener that will be
	 * automatically removed after it's first execution.
	 *
	 * @param {String|RegExp} evt Name of the event to attach the listener to.
	 * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.addOnceListener = function addOnceListener(evt, listener) {
		return this.addListener(evt, {
			listener: listener,
			once: true
		});
	};

	/**
	 * Alias of addOnceListener.
	 */
	proto.once = alias('addOnceListener');

	/**
	 * Defines an event name. This is required if you want to use a regex to add a listener to multiple events at once. If you don't do this then how do you expect it to know what event to add to? Should it just add to every possible match for a regex? No. That is scary and bad.
	 * You need to tell it what event names should be matched by a regex.
	 *
	 * @param {String} evt Name of the event to create.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.defineEvent = function defineEvent(evt) {
		this.getListeners(evt);
		return this;
	};

	/**
	 * Uses defineEvent to define multiple events.
	 *
	 * @param {String[]} evts An array of event names to define.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.defineEvents = function defineEvents(evts) {
		for (var i = 0; i < evts.length; i += 1) {
			this.defineEvent(evts[i]);
		}
		return this;
	};

	/**
	 * Removes a listener function from the specified event.
	 * When passed a regular expression as the event name, it will remove the listener from all events that match it.
	 *
	 * @param {String|RegExp} evt Name of the event to remove the listener from.
	 * @param {Function} listener Method to remove from the event.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.removeListener = function removeListener(evt, listener) {
		var listeners = this.getListenersAsObject(evt);
		var index;
		var key;

		for (key in listeners) {
			if (listeners.hasOwnProperty(key)) {
				index = indexOfListener(listeners[key], listener);

				if (index !== -1) {
					listeners[key].splice(index, 1);
				}
			}
		}

		return this;
	};

	/**
	 * Alias of removeListener
	 */
	proto.off = alias('removeListener');

	/**
	 * Adds listeners in bulk using the manipulateListeners method.
	 * If you pass an object as the second argument you can add to multiple events at once. The object should contain key value pairs of events and listeners or listener arrays. You can also pass it an event name and an array of listeners to be added.
	 * You can also pass it a regular expression to add the array of listeners to all events that match it.
	 * Yeah, this function does quite a bit. That's probably a bad thing.
	 *
	 * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add to multiple events at once.
	 * @param {Function[]} [listeners] An optional array of listener functions to add.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.addListeners = function addListeners(evt, listeners) {
		// Pass through to manipulateListeners
		return this.manipulateListeners(false, evt, listeners);
	};

	/**
	 * Removes listeners in bulk using the manipulateListeners method.
	 * If you pass an object as the second argument you can remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
	 * You can also pass it an event name and an array of listeners to be removed.
	 * You can also pass it a regular expression to remove the listeners from all events that match it.
	 *
	 * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to remove from multiple events at once.
	 * @param {Function[]} [listeners] An optional array of listener functions to remove.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.removeListeners = function removeListeners(evt, listeners) {
		// Pass through to manipulateListeners
		return this.manipulateListeners(true, evt, listeners);
	};

	/**
	 * Edits listeners in bulk. The addListeners and removeListeners methods both use this to do their job. You should really use those instead, this is a little lower level.
	 * The first argument will determine if the listeners are removed (true) or added (false).
	 * If you pass an object as the second argument you can add/remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
	 * You can also pass it an event name and an array of listeners to be added/removed.
	 * You can also pass it a regular expression to manipulate the listeners of all events that match it.
	 *
	 * @param {Boolean} remove True if you want to remove listeners, false if you want to add.
	 * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add/remove from multiple events at once.
	 * @param {Function[]} [listeners] An optional array of listener functions to add/remove.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.manipulateListeners = function manipulateListeners(remove, evt, listeners) {
		var i;
		var value;
		var single = remove ? this.removeListener : this.addListener;
		var multiple = remove ? this.removeListeners : this.addListeners;

		// If evt is an object then pass each of it's properties to this method
		if (typeof evt === 'object' && !(evt instanceof RegExp)) {
			for (i in evt) {
				if (evt.hasOwnProperty(i) && (value = evt[i])) {
					// Pass the single listener straight through to the singular method
					if (typeof value === 'function') {
						single.call(this, i, value);
					}
					else {
						// Otherwise pass back to the multiple function
						multiple.call(this, i, value);
					}
				}
			}
		}
		else {
			// So evt must be a string
			// And listeners must be an array of listeners
			// Loop over it and pass each one to the multiple method
			i = listeners.length;
			while (i--) {
				single.call(this, evt, listeners[i]);
			}
		}

		return this;
	};

	/**
	 * Removes all listeners from a specified event.
	 * If you do not specify an event then all listeners will be removed.
	 * That means every event will be emptied.
	 * You can also pass a regex to remove all events that match it.
	 *
	 * @param {String|RegExp} [evt] Optional name of the event to remove all listeners for. Will remove from every event if not passed.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.removeEvent = function removeEvent(evt) {
		var type = typeof evt;
		var events = this._getEvents();
		var key;

		// Remove different things depending on the state of evt
		if (type === 'string') {
			// Remove all listeners for the specified event
			delete events[evt];
		}
		else if (evt instanceof RegExp) {
			// Remove all events matching the regex.
			for (key in events) {
				if (events.hasOwnProperty(key) && evt.test(key)) {
					delete events[key];
				}
			}
		}
		else {
			// Remove all listeners in all events
			delete this._events;
		}

		return this;
	};

	/**
	 * Alias of removeEvent.
	 *
	 * Added to mirror the node API.
	 */
	proto.removeAllListeners = alias('removeEvent');

	/**
	 * Emits an event of your choice.
	 * When emitted, every listener attached to that event will be executed.
	 * If you pass the optional argument array then those arguments will be passed to every listener upon execution.
	 * Because it uses `apply`, your array of arguments will be passed as if you wrote them out separately.
	 * So they will not arrive within the array on the other side, they will be separate.
	 * You can also pass a regular expression to emit to all events that match it.
	 *
	 * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
	 * @param {Array} [args] Optional array of arguments to be passed to each listener.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.emitEvent = function emitEvent(evt, args) {
		var listeners = this.getListenersAsObject(evt);
		var listener;
		var i;
		var key;
		var response;

		for (key in listeners) {
			if (listeners.hasOwnProperty(key)) {
				i = listeners[key].length;

				while (i--) {
					// If the listener returns true then it shall be removed from the event
					// The function is executed either with a basic call or an apply if there is an args array
					listener = listeners[key][i];

					if (listener.once === true) {
						this.removeListener(evt, listener.listener);
					}

					response = listener.listener.apply(this, args || []);

					if (response === this._getOnceReturnValue()) {
						this.removeListener(evt, listener.listener);
					}
				}
			}
		}

		return this;
	};

	/**
	 * Alias of emitEvent
	 */
	proto.trigger = alias('emitEvent');

	/**
	 * Subtly different from emitEvent in that it will pass its arguments on to the listeners, as opposed to taking a single array of arguments to pass on.
	 * As with emitEvent, you can pass a regex in place of the event name to emit to all events that match it.
	 *
	 * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
	 * @param {...*} Optional additional arguments to be passed to each listener.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.emit = function emit(evt) {
		var args = Array.prototype.slice.call(arguments, 1);
		return this.emitEvent(evt, args);
	};

	/**
	 * Sets the current value to check against when executing listeners. If a
	 * listeners return value matches the one set here then it will be removed
	 * after execution. This value defaults to true.
	 *
	 * @param {*} value The new value to check for when executing listeners.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.setOnceReturnValue = function setOnceReturnValue(value) {
		this._onceReturnValue = value;
		return this;
	};

	/**
	 * Fetches the current value to check against when executing listeners. If
	 * the listeners return value matches this one then it should be removed
	 * automatically. It will return true by default.
	 *
	 * @return {*|Boolean} The current value to check for or the default, true.
	 * @api private
	 */
	proto._getOnceReturnValue = function _getOnceReturnValue() {
		if (this.hasOwnProperty('_onceReturnValue')) {
			return this._onceReturnValue;
		}
		else {
			return true;
		}
	};

	/**
	 * Fetches the events object and creates one if required.
	 *
	 * @return {Object} The events storage object.
	 * @api private
	 */
	proto._getEvents = function _getEvents() {
		return this._events || (this._events = {});
	};

	/**
	 * Reverts the global {@link EventEmitter} to its previous value and returns a reference to this version.
	 *
	 * @return {Function} Non conflicting EventEmitter class.
	 */
	EventEmitter.noConflict = function noConflict() {
		exports.EventEmitter = originalGlobalValue;
		return EventEmitter;
	};

	// Expose the class either via AMD, CommonJS or the global object
	if (typeof define === 'function' && define.amd) {
		define(function () {
			return EventEmitter;
		});
	}
	else if (typeof module === 'object' && module.exports){
		module.exports = EventEmitter;
	}
	else {
		this.EventEmitter = EventEmitter;
	}
}.call(this));

},{}],3:[function(require,module,exports){
/*!
 * eventie v1.0.5
 * event binding helper
 *   eventie.bind( elem, 'click', myFn )
 *   eventie.unbind( elem, 'click', myFn )
 * MIT license
 */

/*jshint browser: true, undef: true, unused: true */
/*global define: false, module: false */

( function( window ) {

'use strict';

var docElem = document.documentElement;

var bind = function() {};

function getIEEvent( obj ) {
  var event = window.event;
  // add event.target
  event.target = event.target || event.srcElement || obj;
  return event;
}

if ( docElem.addEventListener ) {
  bind = function( obj, type, fn ) {
    obj.addEventListener( type, fn, false );
  };
} else if ( docElem.attachEvent ) {
  bind = function( obj, type, fn ) {
    obj[ type + fn ] = fn.handleEvent ?
      function() {
        var event = getIEEvent( obj );
        fn.handleEvent.call( fn, event );
      } :
      function() {
        var event = getIEEvent( obj );
        fn.call( obj, event );
      };
    obj.attachEvent( "on" + type, obj[ type + fn ] );
  };
}

var unbind = function() {};

if ( docElem.removeEventListener ) {
  unbind = function( obj, type, fn ) {
    obj.removeEventListener( type, fn, false );
  };
} else if ( docElem.detachEvent ) {
  unbind = function( obj, type, fn ) {
    obj.detachEvent( "on" + type, obj[ type + fn ] );
    try {
      delete obj[ type + fn ];
    } catch ( err ) {
      // can't delete window object properties
      obj[ type + fn ] = undefined;
    }
  };
}

var eventie = {
  bind: bind,
  unbind: unbind
};

// ----- module definition ----- //

if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( eventie );
} else if ( typeof exports === 'object' ) {
  // CommonJS
  module.exports = eventie;
} else {
  // browser global
  window.eventie = eventie;
}

})( this );

},{}],4:[function(require,module,exports){
/*!
 * imagesLoaded v3.1.4
 * JavaScript is all like "You images are done yet or what?"
 * MIT License
 */

( function( window, factory ) { 'use strict';
  // universal module definition

  /*global define: false, module: false, require: false */

  if ( typeof define === 'function' && define.amd ) {
    // AMD
    define( [
      'eventEmitter/EventEmitter',
      'eventie/eventie'
    ], function( EventEmitter, eventie ) {
      return factory( window, EventEmitter, eventie );
    });
  } else if ( typeof exports === 'object' ) {
    // CommonJS
    module.exports = factory(
      window,
      require("./..\\eventEmitter\\EventEmitter.js"),
      require("./..\\eventie\\eventie.js")
    );
  } else {
    // browser global
    window.imagesLoaded = factory(
      window,
      window.EventEmitter,
      window.eventie
    );
  }

})( this,

// --------------------------  factory -------------------------- //

function factory( window, EventEmitter, eventie ) {

'use strict';

var $ = window.jQuery;
var console = window.console;
var hasConsole = typeof console !== 'undefined';

// -------------------------- helpers -------------------------- //

// extend objects
function extend( a, b ) {
  for ( var prop in b ) {
    a[ prop ] = b[ prop ];
  }
  return a;
}

var objToString = Object.prototype.toString;
function isArray( obj ) {
  return objToString.call( obj ) === '[object Array]';
}

// turn element or nodeList into an array
function makeArray( obj ) {
  var ary = [];
  if ( isArray( obj ) ) {
    // use object if already an array
    ary = obj;
  } else if ( typeof obj.length === 'number' ) {
    // convert nodeList to array
    for ( var i=0, len = obj.length; i < len; i++ ) {
      ary.push( obj[i] );
    }
  } else {
    // array of single index
    ary.push( obj );
  }
  return ary;
}

  // -------------------------- imagesLoaded -------------------------- //

  /**
   * @param {Array, Element, NodeList, String} elem
   * @param {Object or Function} options - if function, use as callback
   * @param {Function} onAlways - callback function
   */
  function ImagesLoaded( elem, options, onAlways ) {
    // coerce ImagesLoaded() without new, to be new ImagesLoaded()
    if ( !( this instanceof ImagesLoaded ) ) {
      return new ImagesLoaded( elem, options );
    }
    // use elem as selector string
    if ( typeof elem === 'string' ) {
      elem = document.querySelectorAll( elem );
    }

    this.elements = makeArray( elem );
    this.options = extend( {}, this.options );

    if ( typeof options === 'function' ) {
      onAlways = options;
    } else {
      extend( this.options, options );
    }

    if ( onAlways ) {
      this.on( 'always', onAlways );
    }

    this.getImages();

    if ( $ ) {
      // add jQuery Deferred object
      this.jqDeferred = new $.Deferred();
    }

    // HACK check async to allow time to bind listeners
    var _this = this;
    setTimeout( function() {
      _this.check();
    });
  }

  ImagesLoaded.prototype = new EventEmitter();

  ImagesLoaded.prototype.options = {};

  ImagesLoaded.prototype.getImages = function() {
    this.images = [];

    // filter & find items if we have an item selector
    for ( var i=0, len = this.elements.length; i < len; i++ ) {
      var elem = this.elements[i];
      // filter siblings
      if ( elem.nodeName === 'IMG' ) {
        this.addImage( elem );
      }
      // find children
      var childElems = elem.querySelectorAll('img');
      // concat childElems to filterFound array
      for ( var j=0, jLen = childElems.length; j < jLen; j++ ) {
        var img = childElems[j];
        this.addImage( img );
      }
    }
  };

  /**
   * @param {Image} img
   */
  ImagesLoaded.prototype.addImage = function( img ) {
    var loadingImage = new LoadingImage( img );
    this.images.push( loadingImage );
  };

  ImagesLoaded.prototype.check = function() {
    var _this = this;
    var checkedCount = 0;
    var length = this.images.length;
    this.hasAnyBroken = false;
    // complete if no images
    if ( !length ) {
      this.complete();
      return;
    }

    function onConfirm( image, message ) {
      if ( _this.options.debug && hasConsole ) {
        console.log( 'confirm', image, message );
      }

      _this.progress( image );
      checkedCount++;
      if ( checkedCount === length ) {
        _this.complete();
      }
      return true; // bind once
    }

    for ( var i=0; i < length; i++ ) {
      var loadingImage = this.images[i];
      loadingImage.on( 'confirm', onConfirm );
      loadingImage.check();
    }
  };

  ImagesLoaded.prototype.progress = function( image ) {
    this.hasAnyBroken = this.hasAnyBroken || !image.isLoaded;
    // HACK - Chrome triggers event before object properties have changed. #83
    var _this = this;
    setTimeout( function() {
      _this.emit( 'progress', _this, image );
      if ( _this.jqDeferred && _this.jqDeferred.notify ) {
        _this.jqDeferred.notify( _this, image );
      }
    });
  };

  ImagesLoaded.prototype.complete = function() {
    var eventName = this.hasAnyBroken ? 'fail' : 'done';
    this.isComplete = true;
    var _this = this;
    // HACK - another setTimeout so that confirm happens after progress
    setTimeout( function() {
      _this.emit( eventName, _this );
      _this.emit( 'always', _this );
      if ( _this.jqDeferred ) {
        var jqMethod = _this.hasAnyBroken ? 'reject' : 'resolve';
        _this.jqDeferred[ jqMethod ]( _this );
      }
    });
  };

  // -------------------------- jquery -------------------------- //

  if ( $ ) {
    $.fn.imagesLoaded = function( options, callback ) {
      var instance = new ImagesLoaded( this, options, callback );
      return instance.jqDeferred.promise( $(this) );
    };
  }


  // --------------------------  -------------------------- //

  function LoadingImage( img ) {
    this.img = img;
  }

  LoadingImage.prototype = new EventEmitter();

  LoadingImage.prototype.check = function() {
    // first check cached any previous images that have same src
    var resource = cache[ this.img.src ] || new Resource( this.img.src );
    if ( resource.isConfirmed ) {
      this.confirm( resource.isLoaded, 'cached was confirmed' );
      return;
    }

    // If complete is true and browser supports natural sizes,
    // try to check for image status manually.
    if ( this.img.complete && this.img.naturalWidth !== undefined ) {
      // report based on naturalWidth
      this.confirm( this.img.naturalWidth !== 0, 'naturalWidth' );
      return;
    }

    // If none of the checks above matched, simulate loading on detached element.
    var _this = this;
    resource.on( 'confirm', function( resrc, message ) {
      _this.confirm( resrc.isLoaded, message );
      return true;
    });

    resource.check();
  };

  LoadingImage.prototype.confirm = function( isLoaded, message ) {
    this.isLoaded = isLoaded;
    this.emit( 'confirm', this, message );
  };

  // -------------------------- Resource -------------------------- //

  // Resource checks each src, only once
  // separate class from LoadingImage to prevent memory leaks. See #115

  var cache = {};

  function Resource( src ) {
    this.src = src;
    // add to cache
    cache[ src ] = this;
  }

  Resource.prototype = new EventEmitter();

  Resource.prototype.check = function() {
    // only trigger checking once
    if ( this.isChecked ) {
      return;
    }
    // simulate loading on detached element
    var proxyImage = new Image();
    eventie.bind( proxyImage, 'load', this );
    eventie.bind( proxyImage, 'error', this );
    proxyImage.src = this.src;
    // set flag
    this.isChecked = true;
  };

  // ----- events ----- //

  // trigger specified handler for event type
  Resource.prototype.handleEvent = function( event ) {
    var method = 'on' + event.type;
    if ( this[ method ] ) {
      this[ method ]( event );
    }
  };

  Resource.prototype.onload = function( event ) {
    this.confirm( true, 'onload' );
    this.unbindProxyEvents( event );
  };

  Resource.prototype.onerror = function( event ) {
    this.confirm( false, 'onerror' );
    this.unbindProxyEvents( event );
  };

  // ----- confirm ----- //

  Resource.prototype.confirm = function( isLoaded, message ) {
    this.isConfirmed = true;
    this.isLoaded = isLoaded;
    this.emit( 'confirm', this, message );
  };

  Resource.prototype.unbindProxyEvents = function( event ) {
    eventie.unbind( event.target, 'load', this );
    eventie.unbind( event.target, 'error', this );
  };

  // -----  ----- //

  return ImagesLoaded;

});

},{"./..\\eventEmitter\\EventEmitter.js":2,"./..\\eventie\\eventie.js":3}],5:[function(require,module,exports){
'use strict';

/**
 * Bootstrapping Angular Modules
 */
var app = angular.module('App', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngAnimate',
    'restangular',
    'ui.router',
    'ui.bootstrap',
    'ui.utils',
    'angulartics',
    'angulartics.google.analytics',
    'nvd3ChartDirectives',
    require('./modules/Modules').name,
    require('./services/Services').name,
    require('./filters/Filters').name,
    require('./directives/Directives').name,
    require('./elements/Elements').name,
    require('./controllers/Controllers').name
]);

/**
 * Configuration & Routing
 */
app.config(require('./Router'));

/**
 * Initialisation
 */
app.run(require('./Run'));

/**
 * Execute!
 */
angular.element(document).ready(function(){

    angular.bootstrap(document, ['App']);

});
},{"./Router":6,"./Run":7,"./controllers/Controllers":9,"./directives/Directives":30,"./elements/Elements":36,"./filters/Filters":74,"./modules/Modules":75,"./services/Services":83}],6:[function(require,module,exports){
'use strict';

var fs = require('fs');

/**
 * Angular Router
 */
module.exports = [
    '$locationProvider', 
    '$stateProvider', 
    '$urlRouterProvider', 
    function ($locationProvider, $stateProvider, $urlRouterProvider) {

        //HTML5 Mode URLs
        $locationProvider.html5Mode(true).hashPrefix('!');

        //redirections, this must be above the stateProvider
        $urlRouterProvider
            .when('/control_panel', '/control_panel/crawling') //setting default child state
            .otherwise('/');

        //precompiled templates, these routes should be used with ui-sref and ui-sref-active
        $stateProvider
            .state(
                'home',
                {
                    url: '/',
                    template: "<div class=\"introduction panel panel_lego panel_transition_white_dark\">\r\n    <div class=\"container\">\r\n        <div class=\"panel-body\">\r\n            <div class=\"row\">\r\n                <div class=\"col-md-6\">\r\n                    <div class=\"page-header\">\r\n                        <h1>SnapSearch is Search Engine Optimisation for Javascript, HTML 5 and Single Page Applications</h1>\r\n                        <h3>Make your sites crawlable with SnapSearch!</h3>\r\n                        <button class=\"call-to-action btn btn-primary\" type=\"button\" ng-click=\"modal.signUp()\">\r\n                            <h4 class=\"call-to-action-text\">Get Started for Free<br /><small>No Credit Card Required</small></h4>\r\n                        </button>\r\n                    </div>\r\n                </div>\r\n                <div class=\"col-md-6\">\r\n                    <div class=\"code-group clearfix\" ng-controller=\"CodeGroupCtrl\">\r\n                        <ul class=\"nav nav-tabs\">\r\n                            <li class=\"tab\" ng-class=\"{'active': activeCode == 'php'}\">\r\n                                <button class=\"btn\" ng-click=\"changeCode('php')\">PHP</button>\r\n                            </li>\r\n                            <li class=\"tab\" ng-class=\"{'active': activeCode == 'ruby'}\">\r\n                                <button class=\"btn\" ng-click=\"changeCode('ruby')\">Ruby</button>\r\n                            </li>\r\n                            <li class=\"tab\" ng-class=\"{'active': activeCode == 'node.js'}\">\r\n                                <button class=\"btn\" ng-click=\"changeCode('node.js')\">Node.js</button>\r\n                            </li>\r\n                            <li class=\"tab\" ng-class=\"{'active': activeCode == 'python'}\">\r\n                                <button class=\"btn\" ng-click=\"changeCode('python')\">Python</button>\r\n                            </li>\r\n                        </ul>\r\n                        <div class=\"tab-content clearfix\" ng-switch=\"activeCode\">\r\n                            <div class=\"tab-panel\" ng-switch-when=\"php\">\r\n                                <p>Installation:</p>\r\n                                <syntax syntax-language=\"bash\">composer require snapsearch/snapsearch-client-php:1.0.0</syntax>\r\n                                <p>Usage:</p>\r\n                                <syntax class=\"code-usage\" syntax-language=\"php\">//add content here, it needs to be encoded</syntax>\r\n                                <a class=\"btn btn-primary btn-fork pull-right\" href=\"https://github.com/SnapSearch/SnapSearch-Client-PHP\" target=\"_blank\">\r\n                                    <img src=\"assets/img/github_mark.png\" />\r\n                                    Fork me on Github\r\n                                </a>                                </div>\r\n                            <div class=\"tab-panel\" ng-switch-when=\"ruby\">\r\n                                <p>Installation:</p>\r\n                                <syntax syntax-language=\"bash\">gem install snapsearch-client-ruby</syntax>\r\n                                <p>Usage:</p>\r\n                                <syntax class=\"code-usage\" syntax-language=\"ruby\">#add content here, it needs to be encoded</syntax>\r\n                                <a class=\"btn btn-primary btn-fork pull-right\" href=\"https://github.com/SnapSearch/SnapSearch-Client-Ruby\" target=\"_blank\">\r\n                                    <img src=\"assets/img/github_mark.png\" />\r\n                                    Fork me on Github\r\n                                </a>\r\n                            </div>\r\n                            <div class=\"tab-panel\" ng-switch-when=\"node.js\">\r\n                                <p>Installation:</p>\r\n                                <syntax syntax-language=\"bash\">npm install snapsearch-client-node:1.0.0</syntax>\r\n                                <p>Usage:</p>\r\n                                <syntax class=\"code-usage\" syntax-language=\"javascript\">//add content here, it needs to be encoded</syntax>\r\n                                <a class=\"btn btn-primary btn-fork pull-right\" href=\"https://github.com/SnapSearch/SnapSearch-Client-Node\" target=\"_blank\">\r\n                                    <img src=\"assets/img/github_mark.png\" />\r\n                                    Fork me on Github\r\n                                </a>\r\n                            </div>\r\n                            <div class=\"tab-panel\" ng-switch-when=\"python\">\r\n                                <p>Installation:</p>\r\n                                <syntax syntax-language=\"bash\">pip install snapsearch-client-python</syntax>\r\n                                <p>Usage:</p>\r\n                                <syntax class=\"code-usage\" syntax-language=\"python\">#comment</syntax>\r\n                                <a class=\"btn btn-primary btn-fork pull-right\" href=\"https://github.com/SnapSearch/SnapSearch-Client-Python\" target=\"_blank\">\r\n                                    <img src=\"assets/img/github_mark.png\" />\r\n                                    Fork me on Github\r\n                                </a>\r\n                            </div>\r\n                        </div>\r\n                    </div>\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n<div class=\"demo panel panel_white panel_transition_white_dark\">\r\n    <div class=\"container\">\r\n        <div class=\"panel-heading\">\r\n            <h2 class=\"panel-title\">Try our Demo</h2>\r\n        </div>\r\n        <div class=\"panel-body\">\r\n            <form class=\"demo-form\" ng-controller=\"DemoCtrl\" name=\"demoForm\">\r\n                <div \r\n                    class=\"form-group\" \r\n                    ng-class=\"{\r\n                        'has-error': demoForm.url.$invalid && demoForm.url.$dirty\r\n                    }\"\r\n                >\r\n                    <div class=\"input-group input-group-lg\">\r\n                        <input \r\n                            class=\"form-control\" \r\n                            type=\"url\" \r\n                            name=\"url\" \r\n                            ng-model=\"demo.url\" \r\n                            required \r\n                            placeholder=\"http://your-site.com/\" \r\n                        />\r\n                        <span class=\"input-group-btn\">\r\n                            <button \r\n                                class=\"btn btn-primary\" \r\n                                type=\"submit\" \r\n                                ng-disabled=\"demoForm.$invalid\" \r\n                                ng-click=\"submit(demo)\" \r\n                            >\r\n                                Scrape\r\n                            </button>\r\n                        </span>\r\n                    </div>\r\n                </div>\r\n                <div class=\"form-errors\" ng-show=\"formErrors\">\r\n                    <em class=\"text-warning\">Oops! Please fix up these errors:</em>\r\n                    <ul class=\"form-errors-list\">\r\n                        <li class=\"form-errors-list-item alert alert-warning\" ng-repeat=\"error in formErrors\">{{error}}</li>\r\n                    </ul>\r\n                </div>\r\n                <div class=\"demo-output\" ng-switch=\"requestingDemoService\">\r\n                    <p class=\"demo-explanation\" ng-switch-when=\"never\">Try this on a single page application like https://snapsearch.io/. You'll see the difference between how \"javascriptless\" search engine robots view your application without SnapSearch, and how they view your application with SnapSearch.</p>\r\n                    <img class=\"demo-loading\" ng-switch-when=\"started\" src=\"assets/img/loading.gif\" />\r\n                    <div class=\"demo-response row\" ng-switch-when=\"finished\" ng-show=\"formSuccess\">\r\n                        <div class=\"col-sm-6\">\r\n                            <h4 class=\"demo-response-title\">Source Code without SnapSearch</h4>\r\n                            <pre class=\"demo-response-code\"><code>{{demoServiceResponse.withoutSnapSearch}}</code></pre>\r\n                            <span class=\"demo-response-length\">Content Length: {{demoServiceResponse.withoutSnapSearch.length}} <span class=\"text-muted\">(this one should be lower!)</span></span>\r\n                        </div>\r\n                        <div class=\"col-sm-6\">\r\n                            <h4 class=\"demo-response-title\">Source Code with SnapSearch</h4>\r\n                            <pre class=\"demo-response-code\"><code>{{demoServiceResponse.withSnapSearch}}</code></pre>\r\n                            <span class=\"demo-response-length\">Content Length: {{demoServiceResponse.withSnapSearch.length}} <span class=\"text-muted\">(this one should be higher!)</span></span>\r\n                        </div>\r\n                    </div>\r\n                </div>\r\n            </form>\r\n        </div>\r\n    </div>\r\n</div>\r\n<div class=\"problem-solution panel panel_lego panel_transition_yellow_dark\">\r\n    <div class=\"container\">\r\n        <div class=\"panel-heading\">\r\n            <h2 class=\"panel-title\">Why use SnapSearch?</h2>\r\n        </div>\r\n        <div class=\"panel-body\">\r\n            <h3 class=\"problem-title\">The Problem</h3>\r\n            <div class=\"problem row\">\r\n                <div class=\"col-md-6\">\r\n                    <img src=\"assets/img/user_coding.png\" />\r\n                    <div class=\"problem-explanation\">\r\n                        <p>You’ve coded up a javascript enhanced or single page application using the latest HTML5 technologies. Using a modern browser, you can see all the asynchronous or animated content appear.</p>\r\n                    </div>\r\n                </div>\r\n                <div class=\"col-md-6\">\r\n                    <img src=\"assets/img/spider_reading.png\" />\r\n                    <div class=\"problem-explanation\">\r\n                        <p>Search engines however see nothing. This is because search engine robots are simple HTTP clients that cannot execute advanced javascript. They do not execute AJAX, and thus cannot load asynchronous resources, nor can they activate javascript events that make your application dynamic and user friendly.</p>\r\n                    </div>\r\n                </div>\r\n            </div>\r\n            <h3 class=\"solution-title\">Our Solution</h3>\r\n            <div class=\"solution row\">\r\n                <div class=\"col-md-3\">\r\n                    <img src=\"assets/img/globe.png\" />\r\n                    <div class=\"solution-explanation\">\r\n                        <p class=\"request-pipe\">Client initiates an HTTP Request. This client can be search engine robot or a social network crawler such as Facebook or Twitter.</p>\r\n                        <p class=\"response-pipe\">The client will now receive the true full representation of your site’s content even though it cannot execute javascript.</p>\r\n                    </div>\r\n                </div>\r\n                <div class=\"col-md-3\">\r\n                    <img src=\"assets/img/application.png\" />\r\n                    <div class=\"solution-explanation\">\r\n                        <p class=\"request-pipe\">Your application using our supplied middleware detects whether the client cannot execute javascript. The middleware then initiates a snapshot request to SnapSearch. The request contains the client request URL, authentication credentials and custom API parameters.</p>\r\n                        <p class=\"response-pipe\">Once the response is received, it outputs your page’s status code, HTML content and any HTTP response headers.</p>\r\n                    </div>\r\n                </div>\r\n                <div class=\"col-md-3\">\r\n                    <img src=\"assets/img/cloud_service.png\" />\r\n                    <div class=\"solution-explanation\">\r\n                        <p class=\"request-pipe\">SnapSearch receives the request and commands our load balanced browser workers to scrape your site based on the client request URL while executing your javascript. Your content will be cached for future requests.</p>\r\n                        <p class=\"response-pipe\">A response is constructed containing the resulting status code, HTML content, headers and optionally a screenshot of your resource. This is returned to your application’s middleware.</p>\r\n                    </div>\r\n                </div>\r\n                <div class=\"col-md-3\">\r\n                    <img src=\"assets/img/cache.png\" />\r\n                    <div class=\"solution-explanation\">\r\n                        <p class=\"request-pipe\">A cache of the content is securely and safely stored on Amazon S3. All cached content are distinguished by a parameter checksum, so the same URL with different API parameters will be stored independently.</p>\r\n                        <p class=\"response-pipe\">If a resource has been cached before, SnapSearch will return the cached content. All cached content have adjustable cache lifetime.</p>\r\n                    </div>\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n<div class=\"features panel panel_yellow panel_transition_white_yellow\">\r\n    <div class=\"container\">\r\n        <div class=\"panel-heading\">\r\n            <h2 class=\"panel-title\">Features</h2>\r\n        </div>\r\n        <div class=\"panel-body\">\r\n            <div class=\"row\" equalise-heights=\".features .feature-object\">\r\n                <div class=\"feature-object col-sm-6 col-md-4 col-lg-3\">\r\n                    <h3 class=\"feature-title\">On Demand</h3>\r\n                    <img class=\"feature-image\" src=\"assets/img/snapsearch_bolt.png\" />\r\n                    <p class=\"feature-explanation\">Snapshots are created on the fly as you request it from the API. Resources are cached for a default time of 24 hrs.</p>\r\n                </div>\r\n                <div class=\"feature-object col-sm-6 col-md-4 col-lg-3\">\r\n                    <h3 class=\"feature-title\">Real Browser Workers</h3>\r\n                    <img class=\"feature-image\" src=\"assets/img/firefox.png\" />\r\n                    <p class=\"feature-explanation\">Our scrapers are powered by nightly versions of Mozilla Firefox. We’re able to run cutting edge HTML5 techniques. Our scrapers evolve as the web evolves.</p>\r\n                </div>\r\n                <div class=\"feature-object col-sm-6 col-md-4 col-lg-3\">\r\n                    <h3 class=\"feature-title\">Google Approved</h3>\r\n                    <img class=\"feature-image\" src=\"assets/img/google.png\" />\r\n                    <p class=\"feature-explanation\">SnapSearch complies with the AJAX Crawling Specification by Google. SnapSearch responds with the same content as a normal user would see, so you’re not in violation of cloaking rules.</p>\r\n                </div>\r\n                <div class=\"feature-object col-sm-6 col-md-4 col-lg-3\">\r\n                    <h3 class=\"feature-title\">Powerful Middleware</h3>\r\n                    <img class=\"feature-image\" src=\"assets/img/middleware.png\" />\r\n                    <p class=\"feature-explanation\">Our middleware supports a variety of server setups and detection algorithms in order to determine search engine clients. Currently they can detect 196 robots. They can be configured to support custom clients.</p>\r\n                </div>\r\n                <div class=\"feature-object col-sm-6 col-md-4 col-lg-3\">\r\n                    <h3 class=\"feature-title\">Flexibility</h3>\r\n                    <img class=\"feature-image\" src=\"assets/img/flexibility.png\" />\r\n                    <p class=\"feature-explanation\">The API supports image snapshots, soft 404s, following redirects, custom headers and status code, cache time settings, width and height of the scraper (useful for infinite scrolling), and custom javascript callbacks that are evaled on the page.</p>\r\n                </div>\r\n                <div class=\"feature-object col-sm-6 col-md-4 col-lg-3\">\r\n                    <h3 class=\"feature-title\">Pay for What You Use</h3>\r\n                    <img class=\"feature-image\" src=\"assets/img/tiger_face.png\" />\r\n                    <p class=\"feature-explanation\">You only pay for each usage of the API that initiates a fresh snapshot. There is no minimum monthly fee. Requests hitting the cache is free, and storage of the cache is free.</p>\r\n                </div>\r\n                <div class=\"feature-object col-sm-6 col-md-4 col-lg-3\">\r\n                    <h3 class=\"feature-title\">Load Balanced</h3>\r\n                    <img class=\"feature-image\" src=\"assets/img/load_balanced.png\" />\r\n                    <p class=\"feature-explanation\">SnapSearch was built as a fault-tolerant load balanced service. We can handle small and big sites. Scrapers are horizontally scaled according to the number of users.</p>\r\n                </div>\r\n                <div class=\"feature-object col-sm-6 col-md-4 col-lg-3\">\r\n                    <h3 class=\"feature-title\">Analytics</h3>\r\n                    <img class=\"feature-image\" src=\"assets/img/analytics.png\" />\r\n                    <p class=\"feature-explanation\">Analytics shows how many requests come from your API key, and what their request parameters are. You can quickly understand your monthly usage, and proximity to the monthly limit. All cached content can be manually refreshed or deleted.</p>\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n<div class=\"framework-support panel panel_white panel_transition_white_yellow\">\r\n    <div class=\"container\">\r\n        <div class=\"panel-heading\">\r\n            <h2 class=\"panel-title\">We’re 100% framework agnostic!</h2>\r\n        </div>\r\n        <div class=\"panel-body\">\r\n            <div class=\"framework-logos row\">\r\n                <div class=\"framework-box col-xs-6 col-sm-4 col-md-3\">\r\n                    <img class=\"framework-logo\" src=\"assets/img/sails_logo.png\" />\r\n                    <a href=\"http://sailsjs.org/\">Sails.js</a>\r\n                </div>\r\n                <div class=\"framework-box col-xs-6 col-sm-4 col-md-3\">\r\n                    <img class=\"framework-logo\" src=\"assets/img/angular_logo.png\" />\r\n                    <a href=\"http://angularjs.org/\">AngularJS</a>\r\n                </div>\r\n                <div class=\"framework-box col-xs-6 col-sm-4 col-md-3\">\r\n                    <img class=\"framework-logo\" src=\"assets/img/js_logo.png\" />\r\n                    <a href=\"http://http://www.html5rocks.com/\">HTML5 Javascript</a>\r\n                </div>\r\n                <div class=\"framework-box col-xs-6 col-sm-4 col-md-3\">\r\n                    <img class=\"framework-logo\" src=\"assets/img/jquery_logo.png\" />\r\n                    <a href=\"http://jquery.com/\">jQuery</a>\r\n                </div>\r\n                <div class=\"framework-box col-xs-6 col-sm-4 col-md-3\">\r\n                    <img class=\"framework-logo\" src=\"assets/img/backbone_logo.png\" />\r\n                    <a href=\"http://backbonejs.org/\">Backbone</a>\r\n                </div>\r\n                <div class=\"framework-box col-xs-6 col-sm-4 col-md-3\">\r\n                    <img class=\"framework-logo\" src=\"assets/img/ember_logo.png\" />\r\n                    <a href=\"http://emberjs.com/\">ember</a>\r\n                </div>\r\n                <div class=\"framework-box col-xs-6 col-sm-4 col-md-3\">\r\n                    <img class=\"framework-logo\" src=\"assets/img/knockout_logo.png\" />\r\n                    <a href=\"http://knockoutjs.com/\">Knockout</a>\r\n                </div>\r\n                <div class=\"framework-box col-xs-6 col-sm-4 col-md-3\">\r\n                    <img class=\"framework-logo\" src=\"assets/img/meteor_logo.png\" />\r\n                    <a href=\"https://www.meteor.com/\">Meteor</a>\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>",
                    controller: 'HomeCtrl'
                }
            )
            .state(
                'documentation',
                {
                    url: '/documentation',
                    template: "<div class=\"documentation panel panel_lego panel_transition_yellow_dark\">\r\n    <div class=\"container\">\r\n        <div class=\"panel-heading\">\r\n            <h2 class=\"panel-title\">Documentation</h2>\r\n        </div>\r\n        <div class=\"panel-body row\">\r\n            <div class=\"col-md-2\">\r\n                <nav class=\"btn-group-vertical control-panel-nav\" affix affix-top=\"214\" affix-bottom=\"910\">\r\n                    <a class=\"btn\" scroll=\"introduction\">Introduction</a>\r\n                    <a class=\"btn\" scroll=\"apiUsage\">API Usage</a>\r\n                    <a class=\"btn\" scroll=\"requestParameters\">Request Parameters</a>\r\n                    <a class=\"btn\" scroll=\"middleware\">Middleware</a>\r\n                    <a class=\"btn\" scroll=\"notes\">Notes</a>\r\n                </nav>\r\n            </div>\r\n            <div class=\"col-md-10\">\r\n                <div class=\"documentation-box\">\r\n                    <div class=\"documentation-information\">\r\n                        <h3 anchor=\"introduction\">Introduction</h3>\r\n                    </div>\r\n                    <div class=\"documentation-information\">\r\n                        <h3 anchor=\"apiUsage\">API Usage</h3>\r\n                    </div>\r\n                    <div class=\"documentation-information\">\r\n                        <h3 anchor=\"requestParameters\">Request Parameters</h3>\r\n                    </div>\r\n                    <div class=\"documentation-information\">\r\n                        <h3 anchor=\"middleware\">Middleware</h3>\r\n                    </div>\r\n                    <div class=\"documentation-information\">\r\n                        <h3 anchor=\"notes\">Notes</h3>\r\n                    </div>\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>",
                    controller: 'DocumentationCtrl'
                }
            )
            .state(
                'pricing',
                {
                    url: '/pricing',
                    template: "<div class=\"pricing panel panel_lego panel_transition_yellow_dark\">\n    <div class=\"container\">\n        <div class=\"panel-heading\">\n            <h2 class=\"panel-title\">Pricing</h2>\n        </div>\n        <div class=\"panel-body\">\n            <div class=\"pricing-box\">\n                <h3 class=\"pricing-heading\">Pay for What You Use</h3>\n                <h4 class=\"pricing-subheading\">never exceed your budget with a flexible cap</h4>\n                <p class=\"price-per-month\">${{pricePerUsage}} AUD per Usage*<br /><small>(free {{freeUsageCap}} Usages Per Month)</small></p>\n                <dl class=\"feature-set\">\n                    <dt>Pages</dt>\n                    <dd>Unlimited</dd>\n                    <dt>Free Usage Cap</dt>\n                    <dd>{{freeUsageCap}} Usages per Month<br /><small>(good for small applications)</small></dd>\n                    <dt>Cache Requests</dt>\n                    <dd>Unlimited</dd>\n                    <dt>Cache Storage</dt>\n                    <dd>Unlimited</dd>\n                    <dt>Cache Lifetime</dt>\n                    <dd>Configurable from 1 - 100 hrs</dd>\n                    <dt>Feature Set</dt>\n                    <dd>Complete</dd>\n                </dl>\n                <div class=\"usage-price-explanation\">\n                    <p class=\"lead\">* What is a Usage?</p>\n                    <p>Each request to the SnapSearch API either results in content being dynamically scraped using the SnapSearch scrapers, or content being fetched from the cache.  A usage refers to a request that does not hit the cache, and initiates a fresh snapshot.</p>\n                    <p>The number of usages per month is used for the calculation of the cost per month. The number of requests per month is not capped, but the number of usages per month can be capped in your control panel.</p>\n                    <p>If you’ve exceeded your usage cap, our middleware simply returns your content normally. So it’s best to keep your cap above average in case of search engine traffic spikes.</p>\n                </div>\n            </div>\n            <div class=\"cost-estimator\">\n                <h3 class=\"cost-heading\">Cost Estimator</h3>\n                <div class=\"cost-explanation\">\n                    <p>Use this tool to estimate your monthly payment. If you’re using a 24 hr cache lifetime, <strong>requests per month are roughly cut in half when converted to usages per month</strong>. The cost per month is calculated from total usages minus free usage cap, multiplied by the price per usage, rounded to the nearest cent.</p>\n                    <p>This is an estimation, to get proper usage figures, we recommend that you try our service with the free usage cap, and use our analytics to determine how many usages per month your web application needs.</p>\n                    <p>Our research shows that most small websites generate between 1000 to 2000 requests per month and hence 500 to 1000 usages per month.</p>\n                    <p>Checkout our <a href=\"documentation\">strategies</a> for reducing usages per month.</p>\n                </div>\n                <form class=\"cost-calculator\" ng-controller=\"CostCalculatorCtrl\" name=\"costCalculatorForm\">\n                    <h4>Usages per Month</h4>\n                    <div class=\"form-group\">\n                        <input \n                            class=\"form-control input-lg\" \n                            type=\"number\" \n                            name=\"quantity\" \n                            ng-model=\"cost.quantity\" \n                            placeholder=\"1000\" \n                            maxlength=\"5\" \n                        />\n                        <span class=\"help-block\">Try a number above the free usage cap.</span>\n                    </div>\n                    <h4>Cost per Month <small>(discounting Free Usage Cap)</small></h4>\n                    <p class=\"calculated-price-per-month\">${{price}} AUD per Month</p>\n                </form>\n                <em class=\"custom-plan\">Need an absurd number of Usages Per Month?<br /><a href=\"http://www.google.com/recaptcha/mailhide/d?k=01KxkEAwiT1nfx-BhMp7WKWg==&amp;c=iaojzr8kgOuD5gSlcb7Tdexe9yVtnztvwDbDcomRY24=\" onclick=\"window.open('http://www.google.com/recaptcha/mailhide/d?k\\07501KxkEAwiT1nfx-BhMp7WKWg\\75\\75\\46c\\75iaojzr8kgOuD5gSlcb7Tdexe9yVtnztvwDbDcomRY24\\075', '', 'toolbar=0,scrollbars=0,location=0,statusbar=0,menubar=0,resizable=0,width=500,height=300'); return false;\" title=\"Reveal this e-mail address\">Contact us!</a> We can figure out an economical plan for your business.</em>\n            </div>\n        </div>\n    </div>\n</div>",
                    controller: 'PricingCtrl'
                }
            )
            .state(
                'controlPanel',
                {
                    url: '/control_panel',
                    template: "<div class=\"control-panel panel panel_lego panel_transition_yellow_dark\">\r\n    <div class=\"container\">\r\n        <div class=\"panel-body row\" ng-show=\"loggedIn\">\r\n            <div class=\"col-md-2\">\r\n                <nav class=\"btn-group-vertical control-panel-nav\" affix affix-top=\"214\" affix-bottom=\"910\">\r\n                    <a class=\"btn\" ui-sref-active=\"active\" ui-sref=\".crawling\">Crawling</a>\r\n                    <a class=\"btn\" ui-sref-active=\"active\" ui-sref=\".cache\">Cache</a>\r\n                    <a class=\"btn\" ui-sref-active=\"active\" ui-sref=\".payments\">Payments</a>\r\n                    <a class=\"btn\" ui-sref-active=\"active\" ui-sref=\".billing\">Billing</a>\r\n                    <a class=\"btn\" ui-sref-active=\"active\" ui-sref=\".account\">Account</a>\r\n                </nav>\r\n            </div>\r\n            <div class=\"col-md-10\">\r\n                <div class=\"control-box\">\r\n                    <div ui-view></div>\r\n                </div>\r\n            </div>\r\n        </div>\r\n        <div class=\"panel-body\" ng-show=\"loggedOut\">\r\n            <p>You must be logged in to view this page!</p>\r\n        </div>\r\n    </div>\r\n</div>",
                    controller: 'ControlPanelCtrl'
                }
            )
            .state(
                'controlPanel.crawling', //default controlPanel childstate
                {
                    url: '/crawling',
                    template: "<div class=\"crawling\">\r\n    <h2>Crawling Statistics</h2>\r\n    <em>API Key: {{userAccount.apiKey}}</em>\r\n    <div class=\"telemetry-block overview\">\r\n        <h3>Overview</h3>\r\n        <em class=\"telemetry-emphasis\">This Cycle - from 01/10/2013 to 01/11/2013</em>\r\n        <div class=\"row overview-requests-usages\">\r\n            <div class=\"col-sm-4\">\r\n                <p>2034</p>\r\n                <p>Requests Received</p>\r\n            </div>\r\n            <div class=\"col-sm-4\">\r\n                <p>2034</p>\r\n                <p>Usages Used</p>\r\n            </div>\r\n            <div class=\"col-sm-4\">\r\n                <p>580</p>\r\n                <p>Usages Available</p>\r\n            </div>\r\n        </div>\r\n        <div class=\"progress progress-striped active usage-bar\">\r\n            <div class=\"progress-bar\" style=\"width: 45%\"></div>\r\n        </div>\r\n        <em>Usage Bar</em>\r\n    </div>\r\n    <div class=\"telemetry-block\">\r\n        <h3>Monthly Usage Cap</h3>\r\n    </div>\r\n    <div class=\"telemetry-block\">\r\n        <h3>History</h3>\r\n    </div>\r\n    <div class=\"telemetry-block\">\r\n        <h3>Domain Distinction</h3>\r\n    </div>\r\n    <div class=\"telemetry-block\">\r\n        <h3>Log</h3>\r\n        <table>\r\n            <thead>\r\n                <th>Date</th>\r\n                <th>Url</th>\r\n                <th>Request Parameters</th>\r\n                <th>Response Time</th>\r\n                <th>Domain</th>\r\n            </thead>\r\n            <tbody>\r\n                <tr ng-repeat=\"record in requestLog\">\r\n                    <td>{{record.date}}</td>\r\n                    <td>{{record.url}}</td>\r\n                    <td>{{record.requestParameters}}</td>\r\n                    <td>{{record.responseTime}}</td>\r\n                    <td>{{record.domain}}</td>\r\n                </tr>\r\n            </tbody>\r\n        </table>\r\n    </div>\r\n</div>",
                    controller: 'ControlCrawlingCtrl'
                }
            )
            .state(
                'controlPanel.cache',
                {
                    url: '/cache',
                    template: "<div class=\"cache\">\r\n    <h2>Cache Statistics</h2>\r\n    <em>API Key: {{userAccount.apiKey}}</em>\r\n    <div class=\"telemetry-block overview\">\r\n        <h3>Overview</h3>\r\n        <div class=\"row overview-cache\">\r\n            <div class=\"col-sm-6\">\r\n                <p>2040</p>\r\n                <p>Pages Cached</p>\r\n            </div>\r\n            <div class=\"col-sm-6\">\r\n                <p>48 KB</p>\r\n                <p>Storage Used</p>\r\n            </div>\r\n        </div>\r\n    </div>\r\n    <div class=\"telemetry-block\">\r\n        <h3>Domain Distinction</h3>\r\n    </div>\r\n    <div class=\"telemetry-block\">\r\n        <h3>Cached Snapshots</h3>\r\n        <form class=\"cache-form\" name=\"cacheForm\">\r\n            <div \r\n                class=\"form-group\" \r\n                ng-class=\"{\r\n                    'has-error': cacheForm.url.$invalid && cacheForm.url.$dirty\r\n                }\"\r\n            >\r\n                <div class=\"input-group\">\r\n                    <input \r\n                        class=\"form-control\" \r\n                        type=\"url\" \r\n                        name=\"url\" \r\n                        ng-model=\"cache.url\" \r\n                        required \r\n                        placeholder=\"http://your-site.com/\" \r\n                    />\r\n                    <span class=\"input-group-btn\">\r\n                        <button \r\n                            class=\"btn btn-primary\" \r\n                            type=\"submit\" \r\n                            ng-disabled=\"cacheForm.$invalid\" \r\n                            ng-click=\"submit(cache)\" \r\n                        >\r\n                            Prime Cache\r\n                        </button>\r\n                    </span>\r\n                    <span class=\"help-block\">Priming a snapshot will use up one usage.</span>\r\n                </div>\r\n            </div>\r\n            <div class=\"form-errors\" ng-show=\"formErrors\">\r\n                <em class=\"text-warning\">Oops! Please fix up these errors:</em>\r\n                <ul class=\"form-errors-list\">\r\n                    <li class=\"form-errors-list-item alert alert-warning\" ng-repeat=\"error in formErrors\">{{error}}</li>\r\n                </ul>\r\n            </div>\r\n            <div class=\"form-success alert alert-success\" ng-show=\"formSuccess\">\r\n                {{formSuccess}}\r\n            </div>\r\n        </form>\r\n        <table>\r\n            <thead>\r\n                <th>id</th>\r\n                <th>snapshot (this would be a link)</th>\r\n                <th>date</th>\r\n                <th>expires</th>\r\n                <th>refresh</th>\r\n                <th>delete</th>\r\n            </thead>\r\n            <tbody>\r\n                <tr ng-repeat=\"record in snapshots\">\r\n                    \r\n                </tr>\r\n            </tbody>\r\n        </table>\r\n    </div>\r\n</div>",
                    controller: 'ControlCacheCtrl'
                }
            )
            .state(
                'controlPanel.payments',
                {
                    url: '/payments',
                    template: "<div class=\"payments\">\r\n    <h2>Payment History</h2>\r\n    <em>API Key: {{userAccount.apiKey}}</em>\r\n    <div class=\"telemetry-block overview\">\r\n        <h3>Overview</h3>\r\n        <div class=\"row overview-payments\">\r\n            <div class=\"col-sm-6\">\r\n                <p>2040</p>\r\n                <p>Usages Used</p>\r\n            </div>\r\n            <div class=\"col-sm-6\">\r\n                <p>$20.00 AUD</p>\r\n                <p>Bill this Month</p>\r\n            </div>\r\n        </div>\r\n    </div>\r\n    <div class=\"telemetry-block\">\r\n        <table ng-show=\"paymentHistory\">\r\n            <thead>\r\n                <th>id</th>\r\n                <th>date</th>\r\n                <th>usage rate (including left over usage from previous cycles)</th>\r\n                <th>amount</th>\r\n                <th>currency</th>\r\n                <th>invoice</th>\r\n            </thead>\r\n            <tbody>\r\n                <tr ng-repeat=\"record in paymentHistory\">\r\n                    <td>{{record.id}}</td>\r\n                    <td>{{record.date}}</td>\r\n                    <td>{{record.usageRate}}</td>\r\n                    <td>{{record.amount}}</td>\r\n                    <td>{{record.currency}}</td>\r\n                    <td><a href=\"#\">{{record.invoice}}</a></td>\r\n                </tr>\r\n            </tbody>\r\n        </table>\r\n        <p ng-show=\"!paymentHistory\">No payment history.</p>\r\n    </div>\r\n</div>",
                    controller: 'ControlPaymentsCtrl'
                }
            )
            .state(
                'controlPanel.billing',
                {
                    url: '/billing',
                    template: "<div class=\"billing\">\r\n    <h2>Billing Information</h2>\r\n    <em>API Key: {{userAccount.apiKey}}</em>\r\n    <div class=\"telemetry-block\">\r\n        <button ng-click=\"createCard\">Add a Card</button>\r\n        <table>\r\n            <thead>\r\n                <th>id</th>\r\n                <th>card number hint</th>\r\n                <th>active</th>\r\n                <th>update</th>\r\n                <th>delete</th>\r\n            </thead>\r\n            <tbody>\r\n                <tr ng-repeat=\"record in cards\">\r\n                    <td></td>\r\n                    <td></td>\r\n                    <td></td>\r\n                    <td><button>Update Card</button></td>\r\n                    <td><button>Delete Card</button></td>\r\n                </tr>\r\n            </tbody>\r\n        </table>\r\n    </div>\r\n</div>",
                    controller: 'ControlBillingCtrl'
                }
            )
            .state(
                'controlPanel.account',
                {
                    url: '/account',
                    template: "<div class=\"account\">\r\n    <h2>Account Details</h2>\r\n    <em>API Key: {{userAccount.apiKey}}</em>\r\n    <button ng-click=\"regenerateApiKey()\">Regenerate API Key</button>\r\n    <form class=\"form-horizontal\" name=\"accountForm\">\r\n        <div \r\n            class=\"form-group\" \r\n            ng-class=\"{\r\n                'has-error': accountForm.username.$invalid && accountForm.username.$dirty\r\n            }\"\r\n        >\r\n            <label class=\"control-label col-sm-2\" for=\"accountFormUsername\">Username:</label>\r\n            <div class=\"col-sm-10\">\r\n                <input id=\"accountFormUsername\" class=\"form-control\" type=\"text\" name=\"username\" ng-model=\"account.username\" required ng-minlength=\"2\" ng-maxlength=\"100\" />\r\n                <span class=\"help-block\" ng-show=\"accountForm.username.$error.required\">Required</span>\r\n            </div>\r\n        </div>\r\n        <div \r\n            class=\"form-group\" \r\n            ng-class=\"{\r\n                'has-error': accountForm.email.$invalid && accountForm.email.$dirty\r\n            }\"\r\n        >\r\n            <label class=\"control-label col-sm-2\" for=\"accountFormEmail\">Email:</label>\r\n            <div class=\"col-sm-10\">\r\n                <input id=\"accountFormEmail\" class=\"form-control\" type=\"email\" name=\"email\" ng-model=\"account.email\" required ng-minlength=\"2\" ng-maxlength=\"100\" />\r\n                <span class=\"help-block\" ng-show=\"accountForm.email.$error.required\">Required</span>\r\n            </div>\r\n        </div>\r\n        <div \r\n            class=\"form-group\" \r\n            ng-class=\"{\r\n                'has-error': accountForm.password.$invalid && accountForm.password.$dirty\r\n            }\"\r\n        >\r\n            <label class=\"control-label col-sm-2\" for=\"accountFormPassword\">Password:</label>\r\n            <div class=\"col-sm-10\">\r\n                <input id=\"accountFormPassword\" class=\"form-control\" type=\"password\" name=\"password\" ng-model=\"account.password\" required ng-minlength=\"2\" ng-maxlength=\"100\" />\r\n                <span class=\"help-block\" ng-show=\"accountForm.password.$error.required\">Required</span>\r\n            </div>\r\n        </div>\r\n        <div \r\n            class=\"form-group\" \r\n            ng-class=\"{\r\n                'has-error': accountForm.passwordConfirm.$invalid && accountForm.passwordConfirm.$dirty\r\n            }\"\r\n        >\r\n            <label class=\"control-label col-sm-2\" for=\"accountFormPasswordConfirm\">Password Confirm:</label>\r\n            <div class=\"col-sm-10\">\r\n                <input id=\"accountFormPasswordConfirm\" class=\"form-control\" type=\"passwordConfirm\" name=\"passwordConfirm\" ng-model=\"account.passwordConfirm\" required ng-minlength=\"2\" ng-maxlength=\"100\" password-match=\"account.password\" />\r\n                <span class=\"help-block\" ng-show=\"accountForm.passwordConfirm.$error.required\">Required</span>\r\n            </div>\r\n        </div>\r\n        <div class=\"form-errors\" ng-show=\"formErrors\">\r\n            <em class=\"text-warning\">Oops! Please fix up these errors:</em>\r\n            <ul class=\"form-errors-list\">\r\n                <li class=\"form-errors-list-item alert alert-warning\" ng-repeat=\"error in formErrors\">{{error}}</li>\r\n            </ul>\r\n        </div>\r\n        <div class=\"form-success alert alert-success\" ng-show=\"formSuccess\">\r\n            {{formSuccess}}\r\n        </div>\r\n        <button class=\"btn btn-primary\" ng-click=\"updateAccount(account)\" ng-disabled=\"accountForm.$invalid\">Update</button>\r\n    </form>\r\n</div>",
                    controller: 'ControlAccountCtrl'
                }
            )
            .state(
                'terms',
                {
                    url: '/terms',
                    template: "<div class=\"terms panel panel_lego panel_transition_yellow_dark\">\n    <div class=\"container\">\n        <div class=\"panel-heading\">\n            <h2 class=\"panel-title\">SnapSearch Terms of Service (\"Agreement\")</h2>\n        </div>\n        <div class=\"panel-body\">\n            <p>This Agreement was last modified on March 05, 2014.</p>\n\n            <p>Please read these Terms of Service (\"Agreement\", \"Terms of Service\") carefully before using https://snapsearch.io (\"the Site\") operated by Golden World (au) pty ltd (\"us\", \"we\", or \"our\"). This Agreement sets forth the legally binding terms and conditions for your use of the Site at https://snapsearch.io.</p>\n\n            <p>By accessing or using the Site in any manner, including, but not limited to, visiting or browsing the Site or contributing content or other materials to the Site, you agree to be bound by these Terms of Service. Capitalized terms are defined in this Agreement.</p>\n\n            <p><strong>Intellectual Property</strong><br />The Site and its original content, features and functionality are owned by Golden World (au) pty ltd and are protected by international copyright, trademark, patent, trade secret and other intellectual property or proprietary rights laws.</p>\n\n            <p><strong>Termination</strong><br />We may terminate your access to the Site, without cause or notice, which may result in the forfeiture and destruction of all information associated with you. All provisions of this Agreement that by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.</p>\n\n            <p><strong>Links To Other Sites</strong><br />Our Site may contain links to third-party sites that are not owned or controlled by Golden World (au) pty ltd.</p>\n\n            <p>Golden World (au) pty ltd has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third party sites or services. We strongly advise you to read the terms and conditions and privacy policy of any third-party site that you visit.</p>\n\n            <p><strong>Governing Law</strong><br />This Agreement (and any further rules, polices, or guidelines incorporated by reference) shall be governed and construed in accordance with the laws of NSW, Australia, without giving effect to any principles of conflicts of law.</p>\n\n            <p><strong>Changes To This Agreement</strong><br />We reserve the right, at our sole discretion, to modify or replace these Terms of Service by posting the updated terms on the Site. Your continued use of the Site after any such changes constitutes your acceptance of the new Terms of Service.</p>\n\n            <p>Please review this Agreement periodically for changes. If you do not agree to any of this Agreement or any changes to this Agreement, do not use, access or continue to access the Site or discontinue any use of the Site immediately.</p>\n\n            <p><strong>Contact Us</strong><br />If you have any questions about this Agreement, please contact us.</p>\n        </div>\n    </div>\n</div>",
                    controller: 'TermsCtrl'
                }
            )
            .state(
                'privacy',
                {
                    url: '/privacy',
                    template: "<div class=\"privacy panel panel_lego panel_transition_yellow_dark\">\n    <div class=\"container\">\n        <div class=\"panel-heading\">\n            <h2 class=\"panel-title\">SnapSearch Privacy Policy</h2>\n        </div>\n        <div class=\"panel-body\">\n            <p>This Privacy Policy was last modified on March 05, 2014.</p>\n\n            <p>Golden World (au) pty ltd (\"us\", \"we\", or \"our\") operates https://snapsearch.io (the \"Site\"). This page informs you of our policies regarding the collection, use and disclosure of Personal Information we receive from users of the Site.</p>\n\n            <p>We use your Personal Information only for providing and improving the Site. By using the Site, you agree to the collection and use of information in accordance with this policy. Unless otherwise defined in this Privacy Policy, terms used in this Privacy Policy have the same meanings as in our Terms and Conditions, accessible at https://snapsearch.io.</p>\n\n            <p><strong>Information Collection And Use</strong><br />While using our Site, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you. Personally identifiable information may include, but is not limited to, your name, email address, postal address and phone number (\"Personal Information\").</p>\n\n            <p><strong>Log Data</strong><br />Like many site operators, we collect information that your browser sends whenever you visit our Site (\"Log Data\"). This Log Data may include information such as your computer's Internet Protocol (\"IP\") address, browser type, browser version, the pages of our Site that you visit, the time and date of your visit, the time spent on those pages and other statistics.</p>\n\n            <p><strong>Cookies</strong><br />Cookies are files with small amount of data, which may include an anonymous unique identifier. Cookies are sent to your browser from a web site and stored on your computer's hard drive.</p>\n\n            <p>Like many sites, we use \"cookies\" to collect information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Site.</p>\n\n            <p><strong>Security</strong><br />The security of your Personal Information is important to us, but remember that no method of transmission over the Internet, or method of electronic storage, is 100% secure. While we strive to use commercially acceptable means to protect your Personal Information, we cannot guarantee its absolute security.</p>\n\n            <p><strong>Links To Other Sites</strong><br />Our Site may contain links to other sites that are not operated by us. If you click on a third party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit.</p>\n            \n            <p>Golden World (au) pty ltd has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third party sites or services.</p>\n\n            <p><strong>Changes To This Privacy Policy</strong><br />Golden World (au) pty ltd may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on the Site. You are advised to review this Privacy Policy periodically for any changes.</p>\n\n            <p><strong>Contact Us</strong><br />If you have any questions about this Privacy Policy, please contact us.</p>\n        </div>\n    </div>\n</div>",
                    controller: 'PrivacyCtrl'
                }
            );

    }
];
},{"fs":1}],7:[function(require,module,exports){
'use strict';

var settings = require('./Settings');

/**
 * Angular Initialisation & Front Controller
 *
 * @param {Object}   $rootScope
 * @param {Object}   $cookies
 * @param {Object}   $http
 * @param {Object}   $state 
 * @param {Object}   $stateParams
 * @param {Function} $anchorScroll
 * @param {Object}   $location
 */
module.exports = [
    '$rootScope',
    '$cookies',
    '$http',
    '$state',
    '$stateParams',
    '$anchorScroll',
    '$location',
    'BaseUrlConst',
    function($rootScope, $cookies, $http, $state, $stateParams, $anchorScroll, $location, BaseUrlConst){
        
        //PROVIDING STATE ON ROOTSCOPE
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;

        //CONFIGURATION
        $rootScope.settings = settings;

        //PROVIDING BASE URL
        $rootScope.baseUrl = BaseUrlConst;

    }
];
},{"./Settings":8}],8:[function(require,module,exports){
'use strict';

module.exports = {
    meta: {
        email: 'enquiry@snapsearch.io',
        price: 0.002,
        freeUsageCap: 1000,
        chatUrl: 'http://www.hipchat.com/gz6yae0iP'
    },
    apiKeys: {}
};
},{}],9:[function(require,module,exports){
'use strict';

/**
 * Controllers
 */
angular.module('App.Controllers', [])
    //common
    .controller('AppCtrl', require('./common/AppCtrl'))
    .controller('HeaderCtrl', require('./common/HeaderCtrl'))
    //home
    .controller('HomeCtrl', require('./home/HomeCtrl'))
    .controller('CodeGroupCtrl', require('./home/CodeGroupCtrl'))
    .controller('DemoCtrl', require('./home/DemoCtrl'))
    //home
    .controller('DocumentationCtrl', require('./documentation/DocumentationCtrl'))
    //pricing
    .controller('PricingCtrl', require('./pricing/PricingCtrl'))
    .controller('CostCalculatorCtrl', require('./pricing/CostCalculatorCtrl'))
    //control panel
    .controller('ControlPanelCtrl', require('./control_panel/ControlPanelCtrl'))
    .controller('ControlCrawlingCtrl', require('./control_panel/ControlCrawlingCtrl'))
    .controller('ControlCacheCtrl', require('./control_panel/ControlCacheCtrl'))
    .controller('ControlPaymentsCtrl', require('./control_panel/ControlPaymentsCtrl'))
    .controller('ControlBillingCtrl', require('./control_panel/ControlBillingCtrl'))
    .controller('ControlAccountCtrl', require('./control_panel/ControlAccountCtrl'))
    //terms
    .controller('TermsCtrl', require('./terms/TermsCtrl'))
    //privacy
    .controller('PrivacyCtrl', require('./privacy/PrivacyCtrl'));

module.exports = angular.module('App.Controllers');
},{"./common/AppCtrl":10,"./common/HeaderCtrl":11,"./control_panel/ControlAccountCtrl":16,"./control_panel/ControlBillingCtrl":17,"./control_panel/ControlCacheCtrl":18,"./control_panel/ControlCrawlingCtrl":19,"./control_panel/ControlPanelCtrl":20,"./control_panel/ControlPaymentsCtrl":21,"./documentation/DocumentationCtrl":22,"./home/CodeGroupCtrl":23,"./home/DemoCtrl":24,"./home/HomeCtrl":25,"./pricing/CostCalculatorCtrl":26,"./pricing/PricingCtrl":27,"./privacy/PrivacyCtrl":28,"./terms/TermsCtrl":29}],10:[function(require,module,exports){
'use strict';

var fs = require('fs');

/**
 * App Controller
 * 
 * @param {Object} $scope
 * @param {Object} $modal
 */
module.exports = ['$scope', '$modal', '$state', 'UserSystemServ', function ($scope, $modal, $state, UserSystemServ) {

    $scope.modal = {};
    $scope.auth = {};

    /**
     * In the future, these 2 functions opening up the signup and login modal could be replaced with "modal" states that transition to and from the parent state which would whichever state that the person activated the modal box.
     * Watch: https://github.com/angular-ui/ui-router/issues/92
     * Then these states could be bound to a particular URL.
     * Also look into multiple inheritance of states.
     */

    $scope.modal.signUp = function () {

        $modal.open({
            template: "<div class=\"modal-header\">\r\n    <h3>Sign Up</h3>\r\n</div>\r\n<div class=\"modal-body\">\r\n    <form class=\"form-horizontal\" name=\"signupForm\">\r\n        <div \r\n            class=\"form-group\" \r\n            ng-class=\"{\r\n                'has-error': signupForm.username.$invalid && signupForm.username.$dirty\r\n            }\"\r\n        >\r\n            <label class=\"control-label col-sm-2\" for=\"signupFormUsername\">Username:</label>\r\n            <div class=\"col-sm-10\">\r\n                <input id=\"signupFormUsername\" class=\"form-control\" type=\"text\" name=\"username\" ng-model=\"user.username\" required ng-minlength=\"2\" ng-maxlength=\"100\" />\r\n                <span class=\"help-block\" ng-show=\"signupForm.username.$error.required\">Required</span>\r\n                <span class=\"help-block\" ng-show=\"signupForm.username.$error.minlength\">Username is too short</span>\r\n                <span class=\"help-block\" ng-show=\"signupForm.username.$error.maxlength\">Username is too long</span>\r\n            </div>\r\n        </div>\r\n        <div \r\n            class=\"form-group\" \r\n            ng-class=\"{\r\n                'has-error': signupForm.email.$invalid && signupForm.email.$dirty\r\n            }\"\r\n        >\r\n            <label class=\"control-label col-sm-2\" for=\"signupFormEmail\">Email:</label>\r\n            <div class=\"col-sm-10\">\r\n                <input id=\"signupFormEmail\" class=\"form-control\" type=\"email\" name=\"email\" ng-model=\"user.email\" required ng-maxlength=\"100\" />\r\n                <span class=\"help-block\" ng-show=\"signupForm.email.$error.required\">Required</span>\r\n                <span class=\"help-block\" ng-show=\"signupForm.email.$error.maxlength\">Email is too long</span>\r\n                <span class=\"help-block\" ng-show=\"signupForm.email.$error.email\">Email is invalid</span>\r\n            </div>\r\n        </div>\r\n        <div \r\n            class=\"form-group\"\r\n            ng-class=\"{\r\n                'has-error': signupForm.password.$invalid && signupForm.password.$dirty\r\n            }\"\r\n        >\r\n            <label class=\"control-label col-sm-2\" for=\"signupFormPassword\">Password:</label>\r\n            <div class=\"col-sm-10\">\r\n                <input \r\n                    id=\"signupFormPassword\" \r\n                    class=\"form-control\" \r\n                    type=\"password\" \r\n                    name=\"password\" \r\n                    ng-model=\"user.password\" \r\n                    required \r\n                    ng-minlength=\"6\" \r\n                    ng-maxlength=\"100\" \r\n                />\r\n                <span class=\"help-block\" ng-show=\"signupForm.password.$error.required\">Required</span>\r\n                <span class=\"help-block\" ng-show=\"signupForm.password.$error.minlength\">Password is too short</span>\r\n                <span class=\"help-block\" ng-show=\"signupForm.password.$error.maxlength\">Password is too long</span>\r\n            </div>\r\n        </div>\r\n        <div \r\n            class=\"form-group\" \r\n            ng-class=\"{\r\n                'has-error': signupForm.passwordConfirm.$invalid && signupForm.passwordConfirm.$dirty\r\n            }\"\r\n        >\r\n            <label class=\"control-label col-sm-2\" for=\"signupFormPasswordConfirm\">Password Confirm:</label>\r\n            <div class=\"col-sm-10\">\r\n                <input \r\n                    id=\"signupFormPasswordConfirm\" \r\n                    class=\"form-control\" \r\n                    type=\"password\" \r\n                    name=\"passwordConfirm\" \r\n                    ng-model=\"user.passwordConfirm\" \r\n                    required \r\n                    ng-minlength=\"6\" \r\n                    ng-maxlength=\"100\" \r\n                    password-match=\"user.password\" \r\n                />\r\n                <span class=\"help-block\" ng-show=\"signupForm.passwordConfirm.$error.required\">Required</span>\r\n                <span class=\"help-block\" ng-show=\"signupForm.passwordConfirm.$error.minlength\">Password Confirm is too short</span>\r\n                <span class=\"help-block\" ng-show=\"signupForm.passwordConfirm.$error.maxlength\">Password Confirm is too long</span>\r\n                <span class=\"help-block\" ng-show=\"signupForm.passwordConfirm.$error.passwordMatch\">Password Confirm doesn't match Password.</span>\r\n            </div>\r\n        </div>\r\n        <div class=\"form-group\">\r\n            <label class=\"control-label col-sm-2\" for=\"signupFormCode\">Code:</label>\r\n            <div class=\"col-sm-4\">\r\n                <input id=\"signupFormCode\" class=\"form-control\" type=\"text\" name=\"code\" ng-model=\"user.code\" />\r\n                <span class=\"help-block\">Optional Promo Code</span>\r\n            </div>\r\n        </div>\r\n    </form>\r\n    <p>By clicking \"Sign Up\", you agree to our <a href=\"terms\" ng-click=\"cancel()\">terms of service</a> and <a href=\"privacy\" ng-click=\"cancel()\">privacy policy</a>.</p>\r\n    <div class=\"form-errors\" ng-show=\"formErrors\">\r\n        <em class=\"text-warning\">Oops! Please fix up these errors:</em>\r\n        <ul class=\"form-errors-list\">\r\n            <li class=\"form-errors-list-item alert alert-warning\" ng-repeat=\"error in formErrors\">{{error}}</li>\r\n        </ul>\r\n    </div>\r\n    <div class=\"form-success alert alert-success\" ng-show=\"formSuccess\">\r\n        {{formSuccess}}\r\n    </div>\r\n</div>\r\n<div class=\"modal-footer\">\r\n    <button class=\"btn btn-primary\" ng-click=\"signup(user)\" ng-disabled=\"signupForm.$invalid\">Sign Up</button>\r\n    <button class=\"btn btn-warning\" ng-click=\"cancel()\">Close</button>\r\n</div>", 
            controller: require('./SignUpModalCtrl'),
            windowClass: 'signup-modal form-modal'
        }).result.then(function () {
            $state.go('controlPanel');
        });

    };

    $scope.modal.logIn = function () {

        $modal.open({
            template: "<div class=\"modal-header\">\r\n    <h3>Log In</h3>\r\n</div>\r\n<div class=\"modal-body\">\r\n    <form class=\"form-horizontal\" name=\"loginForm\">\r\n        <div \r\n            class=\"form-group\" \r\n            ng-class=\"{\r\n                'has-error': loginForm.email.$invalid && loginForm.email.$dirty\r\n            }\"\r\n        >\r\n            <label class=\"control-label col-sm-2\" for=\"loginFormEmail\">Email:</label>\r\n            <div class=\"col-sm-10\">\r\n                <input id=\"loginFormEmail\" class=\"form-control\" type=\"email\" name=\"email\" ng-model=\"user.email\" required ng-maxlength=\"100\" />\r\n                <span class=\"help-block\" ng-show=\"loginForm.email.$error.required\">Required</span>\r\n                <span class=\"help-block\" ng-show=\"loginForm.email.$error.maxlength\">Email is too long</span>\r\n                <span class=\"help-block\" ng-show=\"loginForm.email.$error.email\">Email is invalid</span>\r\n            </div>\r\n        </div>\r\n        <div \r\n            class=\"form-group\"\r\n            ng-class=\"{\r\n                'has-error': loginForm.password.$invalid && loginForm.password.$dirty\r\n            }\"\r\n        >\r\n            <label class=\"control-label col-sm-2\" for=\"loginFormPassword\">Password:</label>\r\n            <div class=\"col-sm-10\">\r\n                <input \r\n                    id=\"loginFormPassword\" \r\n                    class=\"form-control\" \r\n                    type=\"password\" \r\n                    name=\"password\" \r\n                    ng-model=\"user.password\" \r\n                    required \r\n                    ng-minlength=\"6\" \r\n                    ng-maxlength=\"100\" \r\n                />\r\n                <span class=\"help-block\" ng-show=\"loginForm.password.$error.required\">Required</span>\r\n                <span class=\"help-block\" ng-show=\"loginForm.password.$error.minlength\">Password is too short</span>\r\n                <span class=\"help-block\" ng-show=\"loginForm.password.$error.maxlength\">Password is too long</span>\r\n            </div>\r\n        </div>\r\n        <div class=\"form-group\">\r\n            <div class=\"col-sm-offset-2 col-sm-10\">\r\n                <div class=\"checkbox\">\r\n                    <label>\r\n                        <input type=\"checkbox\" name=\"autologin\" ng-model=\"user.autologin\"> Remember Me\r\n                    </label>\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </form>\r\n    <div class=\"form-errors\" ng-show=\"formErrors\">\r\n        <em class=\"text-warning\">Oops! Please fix up these errors:</em>\r\n        <ul class=\"form-errors-list\">\r\n            <li class=\"form-errors-list-item alert alert-warning\" ng-repeat=\"error in formErrors\">{{error}}</li>\r\n        </ul>\r\n    </div>\r\n    <div class=\"form-success alert alert-success\" ng-show=\"formSuccess\">\r\n        {{formSuccess}}\r\n    </div>\r\n</div>\r\n<div class=\"modal-footer\">\r\n    <button class=\"btn btn-primary\" ng-click=\"login(user)\" ng-disabled=\"loginForm.$invalid\">Log In</button>\r\n    <button class=\"btn btn-warning\" ng-click=\"cancel()\">Close</button>\r\n</div>",
            controller: require('./LogInModalCtrl'),
            windowClass: 'login-modal form-modal'
        }).result.then(function () {
            $state.go('controlPanel');
        });

    };

    $scope.auth.logOut = function () {

        UserSystemServ.logoutSession().then(function () {
            $state.go('home');
        });

    };

}];
},{"./LogInModalCtrl":12,"./SignUpModalCtrl":13,"fs":1}],11:[function(require,module,exports){
'use strict';

/**
 * Header Controller
 * 
 * @param {Object} $scope
 */
module.exports = ['$scope', function ($scope) {

}];
},{}],12:[function(require,module,exports){
'use strict';

/**
 * Login Modal Controller
 */
module.exports = ['$scope', '$modalInstance', '$timeout', 'UserSystemServ', function ($scope, $modalInstance, $timeout, UserSystemServ) {

    $scope.user = {};

    $scope.login = function (user) {

        $scope.formErrors = false;
        $scope.formSuccess = false;

        UserSystemServ.loginSession(user).then(function () {

            $scope.formSuccess = 'Successfully logged in.';
            $timeout(function () {
                $modalInstance.close();
            }, 1500);

        }, function (response) {

            if (response.status === 400 || response.status === 401) {
                $scope.formErrors = response.data.content;
            } else {
                $scope.formErrors = ['System error, try again or contact us.'];
            }

        });

    };

    $scope.cancel = function () {

        $modalInstance.dismiss();

    };

}];
},{}],13:[function(require,module,exports){
'use strict';

/**
 * Sign Up Modal Controller
 */
module.exports = ['$scope', '$modalInstance', '$timeout', 'UserSystemServ', function ($scope, $modalInstance, $timeout, UserSystemServ) {

    $scope.user = {};

    $scope.signup = function (user) {

        $scope.formErrors = false;
        $scope.formSuccess = false;

        UserSystemServ.registerAccount(user).then(function (response) {

            $scope.formSuccess = 'Successfully registered. Automatically logging in.';
            $timeout(function () {
                $modalInstance.close();
            }, 1500);

        }, function (response) {

            if (response.status === 400) {
                $scope.formErrors = response.data.content;
            } else {
                $scope.formErrors = ['System error, try again or contact us.'];
            }

        });

    };

    $scope.cancel = function () {

        $modalInstance.dismiss();

    };

}];
},{}],14:[function(require,module,exports){
'use strict';

/**
 * Card Create Modal
 */
module.exports = ['$scope', '$modalInstance', function ($scope, $modalInstance) {

    

}];
},{}],15:[function(require,module,exports){
'use strict';

/**
 * Card Update Modal
 */
module.exports = ['$scope', '$modalInstance', function ($scope, $modalInstance) {



}];
},{}],16:[function(require,module,exports){
'use strict';

/**
 * Control Account Controller
 *
 * @param {Object} $scope
 */
module.exports = ['$scope', function ($scope) {

}];
},{}],17:[function(require,module,exports){
'use strict';

var fs = require('fs');

/**
 * Control Billing Controller
 *
 * @param {Object} $scope
 */
module.exports = ['$scope', '$modal', function ($scope, $modal) {

    //once cards get created or updated, we need to either add to the card model client side, or requery the server...
    //client side updating is quicker and more "semantic"
    //server side requerying is easier to do

    $scope.modal.cardCreate = function () {

        $modal.open({
            template: "<div class=\"modal-header\">\r\n    <h2>Create a new Credit Card</h2>\r\n    <em>Payments are processed by Pin payments, and we don't keep any credit card information on our servers.</em>\r\n</div>\r\n<div class=\"modal-body\">\r\n    <form class=\"form-horizontal\" name=\"signupForm\">\r\n        <div \r\n            class=\"form-group\" \r\n            ng-class=\"{\r\n                'has-error': billingForm.cardNumber.$invalid && billingForm.cardNumber.$dirty\r\n            }\"\r\n        >\r\n            <label class=\"control-label col-sm-2\" for=\"billingFormCardNumber\">Card Number:</label>\r\n            <div class=\"col-sm-10\">\r\n                <input id=\"billingFormCardNumber\" class=\"form-control\" type=\"text\" name=\"cardNumber\" ng-model=\"card.cardNumber\" required ng-minlength=\"2\" ng-maxlength=\"100\" />\r\n                <span class=\"help-block\" ng-show=\"billingForm.cardNumber.$error.required\">Required</span>\r\n            </div>\r\n        </div>\r\n    </form>\r\n    <div class=\"form-errors\" ng-show=\"formErrors\">\r\n        <em class=\"text-warning\">Oops! Please fix up these errors:</em>\r\n        <ul class=\"form-errors-list\">\r\n            <li class=\"form-errors-list-item alert alert-warning\" ng-repeat=\"error in formErrors\">{{error}}</li>\r\n        </ul>\r\n    </div>\r\n    <div class=\"form-success alert alert-success\" ng-show=\"formSuccess\">\r\n        {{formSuccess}}\r\n    </div>\r\n</div>\r\n<div class=\"modal-footer\">\r\n    <button class=\"btn btn-primary\" ng-click=\"addCard(card)\" ng-disabled=\"billingForm.$invalid\">Add Card</button>\r\n    <button class=\"btn btn-warning\" ng-click=\"cancel()\">Close</button>\r\n</div>",
            controller: require('./CardCreateModalCtrl'),
            windowClass: 'card-create-modal form-modal'
        }).result.then(function () {

            //requery the server and update the cards model

        });

    };

    //card update modal is only available from the Billing controller
    $scope.modal.cardUpdate = function () {

        $modal.open({
            template: "<div class=\"modal-header\">\r\n    <h3>Sign Up</h3>\r\n</div>\r\n<div class=\"modal-body\">\r\n    <form class=\"form-horizontal\" name=\"signupForm\">\r\n        <div \r\n            class=\"form-group\" \r\n            ng-class=\"{\r\n                'has-error': signupForm.username.$invalid && signupForm.username.$dirty\r\n            }\"\r\n        >\r\n            <label class=\"control-label col-sm-2\" for=\"signupFormUsername\">Username:</label>\r\n            <div class=\"col-sm-10\">\r\n                <input id=\"signupFormUsername\" class=\"form-control\" type=\"text\" name=\"username\" ng-model=\"user.username\" required ng-minlength=\"2\" ng-maxlength=\"100\" />\r\n                <span class=\"help-block\" ng-show=\"signupForm.username.$error.required\">Required</span>\r\n                <span class=\"help-block\" ng-show=\"signupForm.username.$error.minlength\">Username is too short</span>\r\n                <span class=\"help-block\" ng-show=\"signupForm.username.$error.maxlength\">Username is too long</span>\r\n            </div>\r\n        </div>\r\n        <div \r\n            class=\"form-group\" \r\n            ng-class=\"{\r\n                'has-error': signupForm.email.$invalid && signupForm.email.$dirty\r\n            }\"\r\n        >\r\n            <label class=\"control-label col-sm-2\" for=\"signupFormEmail\">Email:</label>\r\n            <div class=\"col-sm-10\">\r\n                <input id=\"signupFormEmail\" class=\"form-control\" type=\"email\" name=\"email\" ng-model=\"user.email\" required ng-maxlength=\"100\" />\r\n                <span class=\"help-block\" ng-show=\"signupForm.email.$error.required\">Required</span>\r\n                <span class=\"help-block\" ng-show=\"signupForm.email.$error.maxlength\">Email is too long</span>\r\n                <span class=\"help-block\" ng-show=\"signupForm.email.$error.email\">Email is invalid</span>\r\n            </div>\r\n        </div>\r\n        <div \r\n            class=\"form-group\"\r\n            ng-class=\"{\r\n                'has-error': signupForm.password.$invalid && signupForm.password.$dirty\r\n            }\"\r\n        >\r\n            <label class=\"control-label col-sm-2\" for=\"signupFormPassword\">Password:</label>\r\n            <div class=\"col-sm-10\">\r\n                <input \r\n                    id=\"signupFormPassword\" \r\n                    class=\"form-control\" \r\n                    type=\"password\" \r\n                    name=\"password\" \r\n                    ng-model=\"user.password\" \r\n                    required \r\n                    ng-minlength=\"6\" \r\n                    ng-maxlength=\"100\" \r\n                />\r\n                <span class=\"help-block\" ng-show=\"signupForm.password.$error.required\">Required</span>\r\n                <span class=\"help-block\" ng-show=\"signupForm.password.$error.minlength\">Password is too short</span>\r\n                <span class=\"help-block\" ng-show=\"signupForm.password.$error.maxlength\">Password is too long</span>\r\n            </div>\r\n        </div>\r\n        <div \r\n            class=\"form-group\" \r\n            ng-class=\"{\r\n                'has-error': signupForm.passwordConfirm.$invalid && signupForm.passwordConfirm.$dirty\r\n            }\"\r\n        >\r\n            <label class=\"control-label col-sm-2\" for=\"signupFormPasswordConfirm\">Password Confirm:</label>\r\n            <div class=\"col-sm-10\">\r\n                <input \r\n                    id=\"signupFormPasswordConfirm\" \r\n                    class=\"form-control\" \r\n                    type=\"password\" \r\n                    name=\"passwordConfirm\" \r\n                    ng-model=\"user.passwordConfirm\" \r\n                    required \r\n                    ng-minlength=\"6\" \r\n                    ng-maxlength=\"100\" \r\n                    password-match=\"user.password\" \r\n                />\r\n                <span class=\"help-block\" ng-show=\"signupForm.passwordConfirm.$error.required\">Required</span>\r\n                <span class=\"help-block\" ng-show=\"signupForm.passwordConfirm.$error.minlength\">Password Confirm is too short</span>\r\n                <span class=\"help-block\" ng-show=\"signupForm.passwordConfirm.$error.maxlength\">Password Confirm is too long</span>\r\n                <span class=\"help-block\" ng-show=\"signupForm.passwordConfirm.$error.passwordMatch\">Password Confirm doesn't match Password.</span>\r\n            </div>\r\n        </div>\r\n        <div class=\"form-group\">\r\n            <label class=\"control-label col-sm-2\" for=\"signupFormCode\">Code:</label>\r\n            <div class=\"col-sm-4\">\r\n                <input id=\"signupFormCode\" class=\"form-control\" type=\"text\" name=\"code\" ng-model=\"user.code\" />\r\n                <span class=\"help-block\">Optional Promo Code</span>\r\n            </div>\r\n        </div>\r\n    </form>\r\n    <p>By clicking \"Sign Up\", you agree to our <a href=\"terms\" ng-click=\"cancel()\">terms of service</a> and <a href=\"privacy\" ng-click=\"cancel()\">privacy policy</a>.</p>\r\n    <div class=\"form-errors\" ng-show=\"formErrors\">\r\n        <em class=\"text-warning\">Oops! Please fix up these errors:</em>\r\n        <ul class=\"form-errors-list\">\r\n            <li class=\"form-errors-list-item alert alert-warning\" ng-repeat=\"error in formErrors\">{{error}}</li>\r\n        </ul>\r\n    </div>\r\n    <div class=\"form-success alert alert-success\" ng-show=\"formSuccess\">\r\n        {{formSuccess}}\r\n    </div>\r\n</div>\r\n<div class=\"modal-footer\">\r\n    <button class=\"btn btn-primary\" ng-click=\"signup(user)\" ng-disabled=\"signupForm.$invalid\">Sign Up</button>\r\n    <button class=\"btn btn-warning\" ng-click=\"cancel()\">Close</button>\r\n</div>", 
            controller: require('./CardUpdateModalCtrl'),
            windowClass: 'card-update-modal form-modal'
        }).result.then(function () {

            //request the server and update the cards model

        });

    };

}];
},{"./CardCreateModalCtrl":14,"./CardUpdateModalCtrl":15,"fs":1}],18:[function(require,module,exports){
'use strict';

/**
 * Control Cache Controller
 *
 * @param {Object} $scope
 */
module.exports = ['$scope', function ($scope) {

}];
},{}],19:[function(require,module,exports){
'use strict';

/**
 * Control Crawling Controller
 *
 * @param {Object} $scope
 */
module.exports = ['$scope', function ($scope) {

}];
},{}],20:[function(require,module,exports){
'use strict';

/**
 * Control Panel Controller
 *
 * @param {Object} $scope
 */
module.exports = ['$scope', 'UserSystemServ', function ($scope, UserSystemServ) {

    /*
    Ok in order to correctly assess whether someone is logged in or not.
    it needs to be resolved via the routes. Or in the resolve function.
    This will call whether you're logged in or not, and therefore deliberate what happens afterwards.
    However it must not run on each route, only on the first request.

    Something like this:

    getSession, if valid session, then to the page, if invalid session, redirect or just go to the page, but only do this if this is the first time it's been loaded, because otherwise the data would be cached!
    So the decision on what to do if invalid session should be in the resolve parameter of the routing.

    Furthermore this means the App.js run should not be doing this. But instead the service exposes the getSession.

    You could also do it all in each controller...

    Controllers could be inherited. We can try prototypical inheritance for the resolves too. This could allow overwriting the parent when necessary. So normally just call getSession(), otherwise call getSession().then..etc

    Or you have a layout state. The master state has a particular resolve that could work it out!
     */

    $scope.$watch(function () {

        return UserSystemServ.getUserData();

    }, function (userData) {

        if (Object.keys(userData).length > 0) {

            var id = userData.id;

        }


    }, true);


}];
},{}],21:[function(require,module,exports){
'use strict';

/**
 * Control Payments Controller
 *
 * @param {Object} $scope
 */
module.exports = ['$scope', function ($scope) {

}];
},{}],22:[function(require,module,exports){
'use strict';

/**
 * Documentation Controller
 * 
 * @param {Object} $scope
 */
module.exports = ['$scope', function ($scope) {

}];
},{}],23:[function(require,module,exports){
'use strict';

/**
 * Code Group Controller
 * Controls the code group allowing the ability to switch the code examples.
 * 
 * @param {Object} $scope
 */
module.exports = ['$scope', function ($scope) {

    $scope.activeCode = 'php';

    $scope.changeCode = function(value){
        $scope.activeCode = value;
    }

}];
},{}],24:[function(require,module,exports){
'use strict';

/**
 * Demo Controller
 * 
 * @param {Object} $scope
 */
module.exports = ['$scope', 'Restangular', function ($scope, Restangular) {

    /**
     * State to indicate requesting status.
     * 'never' => never requested
     * 'started' => started a request
     * 'finished' => finished request
     * 
     * @type {Number}
     */
    $scope.requestingDemoService = 'never';

    $scope.submit = function (demo) {

        $scope.formErrors = false;
        $scope.formSuccess = false;
        $scope.requestingDemoService = 'started';

        Restangular.all('demo').customGET('', {url: demo.url}).then(function (response) {

            $scope.formSuccess = true;
            $scope.demoServiceResponse = response.content;

        }, function (response) {

            if (response.status === 400) {
                $scope.formErrors = response.data.content;
            } else if (response.status === 500) {
                $scope.formErrors = [];
                $scope.formErrors = $scope.formErrors.concat(
                    response.data.content.robotErrors, 
                    response.data.content.curlErrors
                ).filter(function (value) {
                    return value != undefined;
                });
            }

        })['finally'](function () {

            $scope.requestingDemoService = 'finished';

        });

    };

}];
},{}],25:[function(require,module,exports){
'use strict';

/**
 * Home Controller
 * 
 * @param {Object} $scope
 */
module.exports = ['$scope', function ($scope) {

}];
},{}],26:[function(require,module,exports){
'use strict';

var settings = require('../../Settings');

/**
 * Cost Calculator Controller
 * 
 * @param {Object} $scope
 */
module.exports = ['$scope', 'CalculateServ', function ($scope, CalculateServ) {

    var pricingPerUsage = settings.meta.price;
    var freeUsageCap = settings.meta.freeUsageCap;

    //setup the cost object
    $scope.cost = {};

    $scope.$watch(function (scope) {

        return scope.cost.quantity;

    }, function (quantity) {

        if (!quantity) {
            quantity = 0;
        }

        //coerce to integer
        quantity = parseInt(quantity);

        //calculate the price while subtracting from freeUsageCap
        var price = pricingPerUsage * (quantity - freeUsageCap);

        //if the price is negative, reset to zero
        if (price < 0) {
            price = 0;
        }

        //round to 2 decimal points, nearest cent
        price = CalculateServ.round(price, 2);

        $scope.price = price;

    });

}];
},{"../../Settings":8}],27:[function(require,module,exports){
'use strict';

var settings = require('../../Settings');

/**
 * Pricing Controller
 * 
 * @param {Object} $scope
 */
module.exports = ['$scope', function ($scope) {

    $scope.pricePerUsage = settings.meta.price;
    $scope.freeUsageCap = settings.meta.freeUsageCap;

}];
},{"../../Settings":8}],28:[function(require,module,exports){
'use strict';

/**
 * Privacy Controller
 */
module.exports = ['$scope', function ($scope) {

}];
},{}],29:[function(require,module,exports){
'use strict';

/**
 * Terms Controller
 */
module.exports = ['$scope', function ($scope) {

}];
},{}],30:[function(require,module,exports){
'use strict';

/**
 * Directives
 */
angular.module('App.Directives', []);

module.exports = angular.module('App.Directives')
    .directive('equaliseHeights', require('./equaliseHeights'))
    .directive('anchor', require('./anchor'))
    .directive('scroll', require('./scroll'))
    .directive('passwordMatch', require('./passwordMatch'))
    .directive('affix', require('./affix'));
},{"./affix":31,"./anchor":32,"./equaliseHeights":33,"./passwordMatch":34,"./scroll":35}],31:[function(require,module,exports){
'use strict';

// var _ = require('lodash'); //loaded globally

/**
 * Affix Directive
 *
 * Requires Lodash, jQuery
 * Does not work on IE8 or lower.
 */
module.exports = ['$window', '$document', function ($window, $document) {

    return {
        link: function (scope, element, attributes) {

                var win = angular.element($window),
                    doc  = angular.element($document),
                    affixed;

                var affixPosition = function () {

                    //default parameters of 0, it will always be fixed if 0
                    var offsetTop = scope.$eval(attributes.affixTop) || 0,
                        offsetBottom = scope.$eval(attributes.affixBottom) || 0,
                        affix;

                    //if the window scroll position is less or equal (above) the offsetTop, then set "affix-top"
                    //if the element offsetTop + element height is greater or equal (below) the document height - offsetBottom, then set "affix-bottom"
                    if (win.prop('pageYOffset') <= offsetTop) {
                        affix = 'affix-top';
                    } else if ((win.prop('pageYOffset') + element.outerHeight()) < (doc.height() - offsetBottom)) {
                        affix = 'affix';
                    } else if ((win.prop('pageYOffset') + element.outerHeight()) >= (doc.height() - offsetBottom)) {
                        affix = 'affix-bottom';
                    }

                    //if the same value, don't bother changing classes, because nothing changed
                    if(affixed === affix) return;
                    affixed = affix;

                    //reset the css classes and add either affix or affix-top or affix-bottom
                    element.removeClass('affix affix-top affix-bottom').addClass(affix);

                    //if affix was bottom, then pin it to where it currently is
                    if (affix === 'affix-bottom') {
                        element.offset({ top: doc.height() - offsetBottom - element.outerHeight() });
                    } else {
                        element.css('top', '');
                    }

                };

                var ensureWidth = function () {
                    element.css('width', element.parent().width());
                };

                var throttledAffix = _.throttle(affixPosition, 50);

                var throttledWidth = _.throttle(ensureWidth, 100);

                var resizeHandler = function () {
                    throttledAffix();
                    throttledWidth();
                };

                //when scrolling, we only have to figure out whether its affix, affix-top or affix-bottom
                win.bind('scroll', throttledAffix);

                //when resizing, we need to ensure the width and check the affix in case elements above pushed down this affixed element
                win.bind('resize', resizeHandler);

                //run both at initialisation
                affixPosition();
                ensureWidth();

                //unbind external event handlers on destruction
                scope.$on('$destroy', function () {
                    win.unbind('scroll', throttledAffix);
                    win.unbind('resize', resizeHandler);
                });

        }
    };

}];
},{}],32:[function(require,module,exports){
'use strict';

var imagesloaded = require("./..\\..\\..\\components\\imagesloaded\\imagesloaded.js");

/**
 * Asynchronous Anchor Scroll
 *
 * @param {string} anchor      ID to scroll to
 * @param {string} anchorDelay Delay in microseconds when scrolling
 * @param {string} anchorEvent Event to listen to before scrolling
 */
module.exports = ['$location', '$anchorScroll', '$timeout', function ($location, $anchorScroll, $timeout) {

        return {
            link: function(scope, element, attributes){

                var id = attributes.anchor || attributes.id || attributes.name;
                var delay = attributes.anchorDelay;
                var eventName = attributes.anchorEvent;
                var firstTimeScrolling = true;

                element.attr('id', id);

                var scrollToHash = function(hash){

                    if(id && hash && id === hash){

                        if(delay && firstTimeScrolling){

                            $timeout(function () {

                                imagesloaded(element, function () {
                                    $anchorScroll();
                                });

                            }, delay);

                        }else{

                            imagesloaded(element, function () {
                                $anchorScroll();
                            });

                        }
                        
                        //only run the delay the first time this scrolling function executes
                        //if the hash didn't match, then this function didn't execute!
                        firstTimeScrolling = false;

                    }

                };
                
                //listen for a custom event, useful if you're waiting on something else to be fully loaded as well
                if(eventName){

                    scope.$on(eventName, function(){

                        scrollToHash($location.hash());

                    });

                }

                //hash may be asynchronously changed, the directive may load before the hash is added
                scope.$watch(function(){

                    return $location.hash();
                
                }, function(hash){

                    scrollToHash(hash);

                });

            }
        };

}];
},{"./..\\..\\..\\components\\imagesloaded\\imagesloaded.js":4}],33:[function(require,module,exports){
'use strict';

var imagesloaded = require("./..\\..\\..\\components\\imagesloaded\\imagesloaded.js");

/**
 * Equalise Heights given a selector
 *
 * @param {string} equaliseHeights jQuery selector pointing to multiple DOM elements requiring an equal height
 */
module.exports = [function () {
    
    return {
        link: function(scope, element, attributes){
        
            //we're not using scope.watch here because, watch would require the values to change, and it can't watch browser events like window.resize, also we're not watching value changes, but events! therefore we're doing jquery event binding
            //another method here: http://jsfiddle.net/bY5qe/
            var items = angular.element(attributes.equaliseHeights);
            
            var equaliseHeight = function(){
                var maxHeight = 0;
                items
                    .height('auto') //reset the heights to auto to see if the content pushes down to the same height
                    .each(function(){
                        //find out which has the max height (wrap it in angular.element, or else each this is the raw DOM)
                        maxHeight = angular.element(this).height() > maxHeight ? angular.element(this).height() : maxHeight; 
                    })
                    .height(maxHeight); //then make them all the same maximum height!
            };

            //run it once after all images are loaded
            imagesloaded(items, function () {
                equaliseHeight();
            });
            
            //on the resize event from jquery, run a function, this function is a pointer!
            angular.element(window).resize(equaliseHeight);
        
        }
    };

}];
},{"./..\\..\\..\\components\\imagesloaded\\imagesloaded.js":4}],34:[function(require,module,exports){
'use strict';

/**
 * Password Match
 *
 * Example:
 * <form name="form">
 *     <input name="password" ng-model="user.password" />
 *     <input name="passwordConfirm" ng-model="user.passwordConfirm" password-match="user.password" />
 * </form>
 * <p ng-show="form.passwordConfirm.$error.passwordMatch">Passwords are not matched!</p>
 *
 * @param {string} passwordMatch Model property identifier to be "matched against"
 */
module.exports = [function () {
    
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: false,
        link: function (scope, element, attributes, controller) {

            //watch the "matched against" model value, and set its passwordMatch validity conditional upon being identical to current model value
            //this executes when the "matched against" model value changes
            scope.$watch(attributes.passwordMatch, function (value) {
                controller.$setValidity('passwordMatch', value === controller.$viewValue);
            });

            //push a parsing pipe to the current model value, and set its passwordMatch validity conditional upon being identical to matched against model value
            //this executes when the current model value changes
            controller.$parsers.push(function (value) {
                var isValid = (value === scope.$eval(attributes.passwordMatch));
                controller.$setValidity('passwordMatch', isValid);
                return isValid ? value : undefined;
            });

        }
    };

}];
},{}],35:[function(require,module,exports){
'use strict';

/**
 * Scroll Directive
 */
module.exports = ['$anchorScroll', '$location', function ($anchorScroll, $location) {

    return {
        link:  function (scope, element, attributes) {

            var scroll = function () {
                $location.hash(attributes.scroll);
                $anchorScroll();
                scope.$apply();
            };

            element.on('click', scroll);

            //we don't need to manually destroy as angular should handle direct element binding

        }
    };

}];
},{}],36:[function(require,module,exports){
'use strict';

/**
 * Elements
 *
 * It should be possible to require(Module).name instead of directly bringing in directives. This is because some reusable elements will become modules due to configuration or other things.
 */
angular.module('App.Elements', []);

module.exports = angular.module('App.Elements')
    .directive('syntax', require('./syntaxHighlight'))
    .directive('chatTab', require('./chatTab'));
},{"./chatTab":37,"./syntaxHighlight":73}],37:[function(require,module,exports){
'use strict';

var fs = require('fs');
var insertCss = require('insert-css');
var css = ".chatTab {\n    position: fixed;\n    right: 1%;\n    bottom: 0;\n    width: 180px;\n}\n\n.chatTab button {\n    color: #FFF;\n    margin: 0 auto;\n    display: block;\n    padding: 6px;\n    background: #428bca;\n    border-top-left-radius: 6px;\n    border-top-right-radius: 6px;\n    border-left: 1px solid #357ebd;\n    border-right: 1px solid #357ebd;\n    border-top: 1px solid #357ebd;\n    border-bottom: none;\n    width: 100%;\n}\n\n.chatTab button:hover {\n    background-color: #2D6CA2;\n    border-color: #2B669A;\n}\n\n.chatTab-content {\n    background: #FFF;\n    width: auto;\n    height: auto;\n    padding: 10px;\n    border-left: 1px solid #dcdcdc;\n    border-right: 1px solid #dcdcdc;\n}\n\n.chatTab-content.crushed {\n    width: 0;\n    height: 0;\n    display: none;\n}\n\n.chatTab-link {\n    display: block;\n    margin-bottom: 5px;\n    text-align: center;\n}";
var chatTemplate = "<div class=\"chatTab\">\n    <button ng-click=\"openCloseChatTab()\">Chat with the Developers</button>\n    <div class=\"chatTab-content crushed\">\n        <a class=\"chatTab-link\" ng-href=\"{{chatUrl}}\" target=\"_blank\">Access WebChat</a>\n        <p>If we're not online, just leave a message or ping us as we will receive it on our mobile phones.</p>\n    </div>\n</div>";

insertCss(css);

/**
 * Chat Tab
 *
 * Relies on Angular jQuery
 */
module.exports = [function () {

    return {
        scope: {
            'chatUrl': '@' //this gets passed in directly
        }, 
        restrict: 'AE',
        template: chatTemplate, 
        replace: true, 
        link: function (scope, element, attributes) {

            scope.openCloseChatTab = function () {

                element.children('.chatTab-content').toggleClass('crushed');

            };

        }
    };

}];
},{"fs":1,"insert-css":85}],38:[function(require,module,exports){
var Highlight = function() {

  /* Utility functions */

  function escape(value) {
    return value.replace(/&/gm, '&amp;').replace(/</gm, '&lt;').replace(/>/gm, '&gt;');
  }

  function tag(node) {
    return node.nodeName.toLowerCase();
  }

  function testRe(re, lexeme) {
    var match = re && re.exec(lexeme);
    return match && match.index == 0;
  }

  function blockLanguage(block) {
    var classes = (block.className + ' ' + (block.parentNode ? block.parentNode.className : '')).split(/\s+/);
    classes = classes.map(function(c) {return c.replace(/^lang(uage)?-/, '');});
    return classes.filter(function(c) {return getLanguage(c) || c == 'no-highlight';})[0];
  }

  function inherit(parent, obj) {
    var result = {};
    for (var key in parent)
      result[key] = parent[key];
    if (obj)
      for (var key in obj)
        result[key] = obj[key];
    return result;
  };

  /* Stream merging */

  function nodeStream(node) {
    var result = [];
    (function _nodeStream(node, offset) {
      for (var child = node.firstChild; child; child = child.nextSibling) {
        if (child.nodeType == 3)
          offset += child.nodeValue.length;
        else if (tag(child) == 'br')
          offset += 1;
        else if (child.nodeType == 1) {
          result.push({
            event: 'start',
            offset: offset,
            node: child
          });
          offset = _nodeStream(child, offset);
          result.push({
            event: 'stop',
            offset: offset,
            node: child
          });
        }
      }
      return offset;
    })(node, 0);
    return result;
  }

  function mergeStreams(original, highlighted, value) {
    var processed = 0;
    var result = '';
    var nodeStack = [];

    function selectStream() {
      if (!original.length || !highlighted.length) {
        return original.length ? original : highlighted;
      }
      if (original[0].offset != highlighted[0].offset) {
        return (original[0].offset < highlighted[0].offset) ? original : highlighted;
      }

      /*
      To avoid starting the stream just before it should stop the order is
      ensured that original always starts first and closes last:

      if (event1 == 'start' && event2 == 'start')
        return original;
      if (event1 == 'start' && event2 == 'stop')
        return highlighted;
      if (event1 == 'stop' && event2 == 'start')
        return original;
      if (event1 == 'stop' && event2 == 'stop')
        return highlighted;

      ... which is collapsed to:
      */
      return highlighted[0].event == 'start' ? original : highlighted;
    }

    function open(node) {
      function attr_str(a) {return ' ' + a.nodeName + '="' + escape(a.value) + '"';}
      result += '<' + tag(node) + Array.prototype.map.call(node.attributes, attr_str).join('') + '>';
    }

    function close(node) {
      result += '</' + tag(node) + '>';
    }

    function render(event) {
      (event.event == 'start' ? open : close)(event.node);
    }

    while (original.length || highlighted.length) {
      var stream = selectStream();
      result += escape(value.substr(processed, stream[0].offset - processed));
      processed = stream[0].offset;
      if (stream == original) {
        /*
        On any opening or closing tag of the original markup we first close
        the entire highlighted node stack, then render the original tag along
        with all the following original tags at the same offset and then
        reopen all the tags on the highlighted stack.
        */
        nodeStack.reverse().forEach(close);
        do {
          render(stream.splice(0, 1)[0]);
          stream = selectStream();
        } while (stream == original && stream.length && stream[0].offset == processed);
        nodeStack.reverse().forEach(open);
      } else {
        if (stream[0].event == 'start') {
          nodeStack.push(stream[0].node);
        } else {
          nodeStack.pop();
        }
        render(stream.splice(0, 1)[0]);
      }
    }
    return result + escape(value.substr(processed));
  }

  /* Initialization */

  function compileLanguage(language) {

    function reStr(re) {
        return (re && re.source) || re;
    }

    function langRe(value, global) {
      return RegExp(
        reStr(value),
        'm' + (language.case_insensitive ? 'i' : '') + (global ? 'g' : '')
      );
    }

    function compileMode(mode, parent) {
      if (mode.compiled)
        return;
      mode.compiled = true;

      mode.keywords = mode.keywords || mode.beginKeywords;
      if (mode.keywords) {
        var compiled_keywords = {};

        function flatten(className, str) {
          if (language.case_insensitive) {
            str = str.toLowerCase();
          }
          str.split(' ').forEach(function(kw) {
            var pair = kw.split('|');
            compiled_keywords[pair[0]] = [className, pair[1] ? Number(pair[1]) : 1];
          });
        }

        if (typeof mode.keywords == 'string') { // string
          flatten('keyword', mode.keywords);
        } else {
          Object.keys(mode.keywords).forEach(function (className) {
            flatten(className, mode.keywords[className]);
          });
        }
        mode.keywords = compiled_keywords;
      }
      mode.lexemesRe = langRe(mode.lexemes || /\b[A-Za-z0-9_]+\b/, true);

      if (parent) {
        if (mode.beginKeywords) {
          mode.begin = '\\b(' + mode.beginKeywords.split(' ').join('|') + ')\\b';
        }
        if (!mode.begin)
          mode.begin = /\B|\b/;
        mode.beginRe = langRe(mode.begin);
        if (!mode.end && !mode.endsWithParent)
          mode.end = /\B|\b/;
        if (mode.end)
          mode.endRe = langRe(mode.end);
        mode.terminator_end = reStr(mode.end) || '';
        if (mode.endsWithParent && parent.terminator_end)
          mode.terminator_end += (mode.end ? '|' : '') + parent.terminator_end;
      }
      if (mode.illegal)
        mode.illegalRe = langRe(mode.illegal);
      if (mode.relevance === undefined)
        mode.relevance = 1;
      if (!mode.contains) {
        mode.contains = [];
      }
      var expanded_contains = [];
      mode.contains.forEach(function(c) {
        if (c.variants) {
          c.variants.forEach(function(v) {expanded_contains.push(inherit(c, v));});
        } else {
          expanded_contains.push(c == 'self' ? mode : c);
        }
      });
      mode.contains = expanded_contains;
      mode.contains.forEach(function(c) {compileMode(c, mode);});

      if (mode.starts) {
        compileMode(mode.starts, parent);
      }

      var terminators =
        mode.contains.map(function(c) {
          return c.beginKeywords ? '\\.?(' + c.begin + ')\\.?' : c.begin;
        })
        .concat([mode.terminator_end, mode.illegal])
        .map(reStr)
        .filter(Boolean);
      mode.terminators = terminators.length ? langRe(terminators.join('|'), true) : {exec: function(s) {return null;}};

      mode.continuation = {};
    }

    compileMode(language);
  }

  /*
  Core highlighting function. Accepts a language name, or an alias, and a
  string with the code to highlight. Returns an object with the following
  properties:

  - relevance (int)
  - value (an HTML string with highlighting markup)

  */
  function highlight(name, value, ignore_illegals, continuation) {

    function subMode(lexeme, mode) {
      for (var i = 0; i < mode.contains.length; i++) {
        if (testRe(mode.contains[i].beginRe, lexeme)) {
          return mode.contains[i];
        }
      }
    }

    function endOfMode(mode, lexeme) {
      if (testRe(mode.endRe, lexeme)) {
        return mode;
      }
      if (mode.endsWithParent) {
        return endOfMode(mode.parent, lexeme);
      }
    }

    function isIllegal(lexeme, mode) {
      return !ignore_illegals && testRe(mode.illegalRe, lexeme);
    }

    function keywordMatch(mode, match) {
      var match_str = language.case_insensitive ? match[0].toLowerCase() : match[0];
      return mode.keywords.hasOwnProperty(match_str) && mode.keywords[match_str];
    }

    function buildSpan(classname, insideSpan, leaveOpen, noPrefix) {
      var classPrefix = noPrefix ? '' : options.classPrefix,
          openSpan    = '<span class="' + classPrefix,
          closeSpan   = leaveOpen ? '' : '</span>';

      openSpan += classname + '">';

      return openSpan + insideSpan + closeSpan;
    }

    function processKeywords() {
      if (!top.keywords)
        return escape(mode_buffer);
      var result = '';
      var last_index = 0;
      top.lexemesRe.lastIndex = 0;
      var match = top.lexemesRe.exec(mode_buffer);
      while (match) {
        result += escape(mode_buffer.substr(last_index, match.index - last_index));
        var keyword_match = keywordMatch(top, match);
        if (keyword_match) {
          relevance += keyword_match[1];
          result += buildSpan(keyword_match[0], escape(match[0]));
        } else {
          result += escape(match[0]);
        }
        last_index = top.lexemesRe.lastIndex;
        match = top.lexemesRe.exec(mode_buffer);
      }
      return result + escape(mode_buffer.substr(last_index));
    }

    function processSubLanguage() {
      if (top.subLanguage && !languages[top.subLanguage]) {
        return escape(mode_buffer);
      }
      var result = top.subLanguage ? highlight(top.subLanguage, mode_buffer, true, top.continuation.top) : highlightAuto(mode_buffer);
      // Counting embedded language score towards the host language may be disabled
      // with zeroing the containing mode relevance. Usecase in point is Markdown that
      // allows XML everywhere and makes every XML snippet to have a much larger Markdown
      // score.
      if (top.relevance > 0) {
        relevance += result.relevance;
      }
      if (top.subLanguageMode == 'continuous') {
        top.continuation.top = result.top;
      }
      return buildSpan(result.language, result.value, false, true);
    }

    function processBuffer() {
      return top.subLanguage !== undefined ? processSubLanguage() : processKeywords();
    }

    function startNewMode(mode, lexeme) {
      var markup = mode.className? buildSpan(mode.className, '', true): '';
      if (mode.returnBegin) {
        result += markup;
        mode_buffer = '';
      } else if (mode.excludeBegin) {
        result += escape(lexeme) + markup;
        mode_buffer = '';
      } else {
        result += markup;
        mode_buffer = lexeme;
      }
      top = Object.create(mode, {parent: {value: top}});
    }

    function processLexeme(buffer, lexeme) {

      mode_buffer += buffer;
      if (lexeme === undefined) {
        result += processBuffer();
        return 0;
      }

      var new_mode = subMode(lexeme, top);
      if (new_mode) {
        result += processBuffer();
        startNewMode(new_mode, lexeme);
        return new_mode.returnBegin ? 0 : lexeme.length;
      }

      var end_mode = endOfMode(top, lexeme);
      if (end_mode) {
        var origin = top;
        if (!(origin.returnEnd || origin.excludeEnd)) {
          mode_buffer += lexeme;
        }
        result += processBuffer();
        do {
          if (top.className) {
            result += '</span>';
          }
          relevance += top.relevance;
          top = top.parent;
        } while (top != end_mode.parent);
        if (origin.excludeEnd) {
          result += escape(lexeme);
        }
        mode_buffer = '';
        if (end_mode.starts) {
          startNewMode(end_mode.starts, '');
        }
        return origin.returnEnd ? 0 : lexeme.length;
      }

      if (isIllegal(lexeme, top))
        throw new Error('Illegal lexeme "' + lexeme + '" for mode "' + (top.className || '<unnamed>') + '"');

      /*
      Parser should not reach this point as all types of lexemes should be caught
      earlier, but if it does due to some bug make sure it advances at least one
      character forward to prevent infinite looping.
      */
      mode_buffer += lexeme;
      return lexeme.length || 1;
    }

    var language = getLanguage(name);
    if (!language) {
      throw new Error('Unknown language: "' + name + '"');
    }

    compileLanguage(language);
    var top = continuation || language;
    var result = '';
    for(var current = top; current != language; current = current.parent) {
      if (current.className) {
        result += buildSpan(current.className, result, true);
      }
    }
    var mode_buffer = '';
    var relevance = 0;
    try {
      var match, count, index = 0;
      while (true) {
        top.terminators.lastIndex = index;
        match = top.terminators.exec(value);
        if (!match)
          break;
        count = processLexeme(value.substr(index, match.index - index), match[0]);
        index = match.index + count;
      }
      processLexeme(value.substr(index));
      for(var current = top; current.parent; current = current.parent) { // close dangling modes
        if (current.className) {
          result += '</span>';
        }
      };
      return {
        relevance: relevance,
        value: result,
        language: name,
        top: top
      };
    } catch (e) {
      if (e.message.indexOf('Illegal') != -1) {
        return {
          relevance: 0,
          value: escape(value)
        };
      } else {
        throw e;
      }
    }
  }

  /*
  Highlighting with language detection. Accepts a string with the code to
  highlight. Returns an object with the following properties:

  - language (detected language)
  - relevance (int)
  - value (an HTML string with highlighting markup)
  - second_best (object with the same structure for second-best heuristically
    detected language, may be absent)

  */
  function highlightAuto(text, languageSubset) {
    languageSubset = languageSubset || options.languages || Object.keys(languages);
    var result = {
      relevance: 0,
      value: escape(text)
    };
    var second_best = result;
    languageSubset.forEach(function(name) {
      if (!getLanguage(name)) {
        return;
      }
      var current = highlight(name, text, false);
      current.language = name;
      if (current.relevance > second_best.relevance) {
        second_best = current;
      }
      if (current.relevance > result.relevance) {
        second_best = result;
        result = current;
      }
    });
    if (second_best.language) {
      result.second_best = second_best;
    }
    return result;
  }

  /*
  Post-processing of the highlighted markup:

  - replace TABs with something more useful
  - replace real line-breaks with '<br>' for non-pre containers

  */
  function fixMarkup(value) {
    if (options.tabReplace) {
      value = value.replace(/^((<[^>]+>|\t)+)/gm, function(match, p1, offset, s) {
        return p1.replace(/\t/g, options.tabReplace);
      });
    }
    if (options.useBR) {
      value = value.replace(/\n/g, '<br>');
    }
    return value;
  }

  /*
  Applies highlighting to a DOM node containing code. Accepts a DOM node and
  two optional parameters for fixMarkup.
  */
  function highlightBlock(block) {
    var text = options.useBR ? block.innerHTML
      .replace(/\n/g,'').replace(/<br>|<br [^>]*>/g, '\n').replace(/<[^>]*>/g,'')
      : block.textContent;
    var language = blockLanguage(block);
    if (language == 'no-highlight')
        return;
    var result = language ? highlight(language, text, true) : highlightAuto(text);
    var original = nodeStream(block);
    if (original.length) {
      var pre = document.createElementNS('http://www.w3.org/1999/xhtml', 'pre');
      pre.innerHTML = result.value;
      result.value = mergeStreams(original, nodeStream(pre), text);
    }
    result.value = fixMarkup(result.value);

    block.innerHTML = result.value;
    block.className += ' hljs ' + (!language && result.language || '');
    block.result = {
      language: result.language,
      re: result.relevance
    };
    if (result.second_best) {
      block.second_best = {
        language: result.second_best.language,
        re: result.second_best.relevance
      };
    }
  }

  var options = {
    classPrefix: 'hljs-',
    tabReplace: null,
    useBR: false,
    languages: undefined
  };

  /*
  Updates highlight.js global options with values passed in the form of an object
  */
  function configure(user_options) {
    options = inherit(options, user_options);
  }

  /*
  Applies highlighting to all <pre><code>..</code></pre> blocks on a page.
  */
  function initHighlighting() {
    if (initHighlighting.called)
      return;
    initHighlighting.called = true;

    var blocks = document.querySelectorAll('pre code');
    Array.prototype.forEach.call(blocks, highlightBlock);
  }

  /*
  Attaches highlighting to the page load event.
  */
  function initHighlightingOnLoad() {
    addEventListener('DOMContentLoaded', initHighlighting, false);
    addEventListener('load', initHighlighting, false);
  }

  var languages = {};
  var aliases = {};

  function registerLanguage(name, language) {
    var lang = languages[name] = language(this);
    if (lang.aliases) {
      lang.aliases.forEach(function(alias) {aliases[alias] = name;});
    }
  }

  function listLanguages() {
    return Object.keys(languages);
  }

  function getLanguage(name) {
    return languages[name] || languages[aliases[name]];
  }

  /* Interface definition */

  this.highlight = highlight;
  this.highlightAuto = highlightAuto;
  this.fixMarkup = fixMarkup;
  this.highlightBlock = highlightBlock;
  this.configure = configure;
  this.initHighlighting = initHighlighting;
  this.initHighlightingOnLoad = initHighlightingOnLoad;
  this.registerLanguage = registerLanguage;
  this.listLanguages = listLanguages;
  this.getLanguage = getLanguage;
  this.inherit = inherit;

  // Common regexps
  this.IDENT_RE = '[a-zA-Z][a-zA-Z0-9_]*';
  this.UNDERSCORE_IDENT_RE = '[a-zA-Z_][a-zA-Z0-9_]*';
  this.NUMBER_RE = '\\b\\d+(\\.\\d+)?';
  this.C_NUMBER_RE = '(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)'; // 0x..., 0..., decimal, float
  this.BINARY_NUMBER_RE = '\\b(0b[01]+)'; // 0b...
  this.RE_STARTERS_RE = '!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~';

  // Common modes
  this.BACKSLASH_ESCAPE = {
    begin: '\\\\[\\s\\S]', relevance: 0
  };
  this.APOS_STRING_MODE = {
    className: 'string',
    begin: '\'', end: '\'',
    illegal: '\\n',
    contains: [this.BACKSLASH_ESCAPE]
  };
  this.QUOTE_STRING_MODE = {
    className: 'string',
    begin: '"', end: '"',
    illegal: '\\n',
    contains: [this.BACKSLASH_ESCAPE]
  };
  this.PHRASAL_WORDS_MODE = {
    begin: /\b(a|an|the|are|I|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such)\b/
  };
  this.C_LINE_COMMENT_MODE = {
    className: 'comment',
    begin: '//', end: '$',
    contains: [this.PHRASAL_WORDS_MODE]
  };
  this.C_BLOCK_COMMENT_MODE = {
    className: 'comment',
    begin: '/\\*', end: '\\*/',
    contains: [this.PHRASAL_WORDS_MODE]
  };
  this.HASH_COMMENT_MODE = {
    className: 'comment',
    begin: '#', end: '$',
    contains: [this.PHRASAL_WORDS_MODE]
  };
  this.NUMBER_MODE = {
    className: 'number',
    begin: this.NUMBER_RE,
    relevance: 0
  };
  this.C_NUMBER_MODE = {
    className: 'number',
    begin: this.C_NUMBER_RE,
    relevance: 0
  };
  this.BINARY_NUMBER_MODE = {
    className: 'number',
    begin: this.BINARY_NUMBER_RE,
    relevance: 0
  };
  this.CSS_NUMBER_MODE = {
    className: 'number',
    begin: this.NUMBER_RE + '(' +
      '%|em|ex|ch|rem'  +
      '|vw|vh|vmin|vmax' +
      '|cm|mm|in|pt|pc|px' +
      '|deg|grad|rad|turn' +
      '|s|ms' +
      '|Hz|kHz' +
      '|dpi|dpcm|dppx' +
      ')?',
    relevance: 0
  };
  this.REGEXP_MODE = {
    className: 'regexp',
    begin: /\//, end: /\/[gim]*/,
    illegal: /\n/,
    contains: [
      this.BACKSLASH_ESCAPE,
      {
        begin: /\[/, end: /\]/,
        relevance: 0,
        contains: [this.BACKSLASH_ESCAPE]
      }
    ]
  };
  this.TITLE_MODE = {
    className: 'title',
    begin: this.IDENT_RE,
    relevance: 0
  };
  this.UNDERSCORE_TITLE_MODE = {
    className: 'title',
    begin: this.UNDERSCORE_IDENT_RE,
    relevance: 0
  };
};
module.exports = Highlight;
},{}],39:[function(require,module,exports){
var Highlight = require('./highlight');
var hljs = new Highlight();
hljs.registerLanguage('apache', require('./languages/apache.js'));
hljs.registerLanguage('bash', require('./languages/bash.js'));
hljs.registerLanguage('clojure', require('./languages/clojure.js'));
hljs.registerLanguage('coffeescript', require('./languages/coffeescript.js'));
hljs.registerLanguage('cpp', require('./languages/cpp.js'));
hljs.registerLanguage('cs', require('./languages/cs.js'));
hljs.registerLanguage('css', require('./languages/css.js'));
hljs.registerLanguage('diff', require('./languages/diff.js'));
hljs.registerLanguage('erlang', require('./languages/erlang.js'));
hljs.registerLanguage('go', require('./languages/go.js'));
hljs.registerLanguage('ruby', require('./languages/ruby.js'));
hljs.registerLanguage('haml', require('./languages/haml.js'));
hljs.registerLanguage('haskell', require('./languages/haskell.js'));
hljs.registerLanguage('http', require('./languages/http.js'));
hljs.registerLanguage('ini', require('./languages/ini.js'));
hljs.registerLanguage('java', require('./languages/java.js'));
hljs.registerLanguage('javascript', require('./languages/javascript.js'));
hljs.registerLanguage('json', require('./languages/json.js'));
hljs.registerLanguage('lisp', require('./languages/lisp.js'));
hljs.registerLanguage('lua', require('./languages/lua.js'));
hljs.registerLanguage('makefile', require('./languages/makefile.js'));
hljs.registerLanguage('xml', require('./languages/xml.js'));
hljs.registerLanguage('markdown', require('./languages/markdown.js'));
hljs.registerLanguage('nginx', require('./languages/nginx.js'));
hljs.registerLanguage('objectivec', require('./languages/objectivec.js'));
hljs.registerLanguage('perl', require('./languages/perl.js'));
hljs.registerLanguage('php', require('./languages/php.js'));
hljs.registerLanguage('python', require('./languages/python.js'));
hljs.registerLanguage('r', require('./languages/r.js'));
hljs.registerLanguage('rust', require('./languages/rust.js'));
hljs.registerLanguage('scala', require('./languages/scala.js'));
hljs.registerLanguage('scss', require('./languages/scss.js'));
hljs.registerLanguage('sql', require('./languages/sql.js'));
module.exports = hljs;
},{"./highlight":38,"./languages/apache.js":40,"./languages/bash.js":41,"./languages/clojure.js":42,"./languages/coffeescript.js":43,"./languages/cpp.js":44,"./languages/cs.js":45,"./languages/css.js":46,"./languages/diff.js":47,"./languages/erlang.js":48,"./languages/go.js":49,"./languages/haml.js":50,"./languages/haskell.js":51,"./languages/http.js":52,"./languages/ini.js":53,"./languages/java.js":54,"./languages/javascript.js":55,"./languages/json.js":56,"./languages/lisp.js":57,"./languages/lua.js":58,"./languages/makefile.js":59,"./languages/markdown.js":60,"./languages/nginx.js":61,"./languages/objectivec.js":62,"./languages/perl.js":63,"./languages/php.js":64,"./languages/python.js":65,"./languages/r.js":66,"./languages/ruby.js":67,"./languages/rust.js":68,"./languages/scala.js":69,"./languages/scss.js":70,"./languages/sql.js":71,"./languages/xml.js":72}],40:[function(require,module,exports){
module.exports = function(hljs) {
  var NUMBER = {className: 'number', begin: '[\\$%]\\d+'};
  return {
    aliases: ['apacheconf'],
    case_insensitive: true,
    contains: [
      hljs.HASH_COMMENT_MODE,
      {className: 'tag', begin: '</?', end: '>'},
      {
        className: 'keyword',
        begin: /\w+/,
        relevance: 0,
        // keywords aren’t needed for highlighting per se, they only boost relevance
        // for a very generally defined mode (starts with a word, ends with line-end
        keywords: {
          common:
            'order deny allow setenv rewriterule rewriteengine rewritecond documentroot ' +
            'sethandler errordocument loadmodule options header listen serverroot ' +
            'servername'
        },
        starts: {
          end: /$/,
          relevance: 0,
          keywords: {
            literal: 'on off all'
          },
          contains: [
            {
              className: 'sqbracket',
              begin: '\\s\\[', end: '\\]$'
            },
            {
              className: 'cbracket',
              begin: '[\\$%]\\{', end: '\\}',
              contains: ['self', NUMBER]
            },
            NUMBER,
            hljs.QUOTE_STRING_MODE
          ]
        }
      }
    ],
    illegal: /\S/
  };
};
},{}],41:[function(require,module,exports){
module.exports = function(hljs) {
  var VAR = {
    className: 'variable',
    variants: [
      {begin: /\$[\w\d#@][\w\d_]*/},
      {begin: /\$\{(.*?)\}/}
    ]
  };
  var QUOTE_STRING = {
    className: 'string',
    begin: /"/, end: /"/,
    contains: [
      hljs.BACKSLASH_ESCAPE,
      VAR,
      {
        className: 'variable',
        begin: /\$\(/, end: /\)/,
        contains: [hljs.BACKSLASH_ESCAPE]
      }
    ]
  };
  var APOS_STRING = {
    className: 'string',
    begin: /'/, end: /'/
  };

  return {
    aliases: ['sh', 'zsh'],
    lexemes: /-?[a-z\.]+/,
    keywords: {
      keyword:
        'if then else elif fi for break continue while in do done exit return set '+
        'declare case esac export exec',
      literal:
        'true false',
      built_in:
        'printf echo read cd pwd pushd popd dirs let eval unset typeset readonly '+
        'getopts source shopt caller type hash bind help sudo',
      operator:
        '-ne -eq -lt -gt -f -d -e -s -l -a' // relevance booster
    },
    contains: [
      {
        className: 'shebang',
        begin: /^#![^\n]+sh\s*$/,
        relevance: 10
      },
      {
        className: 'function',
        begin: /\w[\w\d_]*\s*\(\s*\)\s*\{/,
        returnBegin: true,
        contains: [hljs.inherit(hljs.TITLE_MODE, {begin: /\w[\w\d_]*/})],
        relevance: 0
      },
      hljs.HASH_COMMENT_MODE,
      hljs.NUMBER_MODE,
      QUOTE_STRING,
      APOS_STRING,
      VAR
    ]
  };
};
},{}],42:[function(require,module,exports){
module.exports = function(hljs) {
  var keywords = {
    built_in:
      // Clojure keywords
      'def cond apply if-not if-let if not not= = &lt; < > &lt;= <= >= == + / * - rem '+
      'quot neg? pos? delay? symbol? keyword? true? false? integer? empty? coll? list? '+
      'set? ifn? fn? associative? sequential? sorted? counted? reversible? number? decimal? '+
      'class? distinct? isa? float? rational? reduced? ratio? odd? even? char? seq? vector? '+
      'string? map? nil? contains? zero? instance? not-every? not-any? libspec? -> ->> .. . '+
      'inc compare do dotimes mapcat take remove take-while drop letfn drop-last take-last '+
      'drop-while while intern condp case reduced cycle split-at split-with repeat replicate '+
      'iterate range merge zipmap declare line-seq sort comparator sort-by dorun doall nthnext '+
      'nthrest partition eval doseq await await-for let agent atom send send-off release-pending-sends '+
      'add-watch mapv filterv remove-watch agent-error restart-agent set-error-handler error-handler '+
      'set-error-mode! error-mode shutdown-agents quote var fn loop recur throw try monitor-enter '+
      'monitor-exit defmacro defn defn- macroexpand macroexpand-1 for dosync and or '+
      'when when-not when-let comp juxt partial sequence memoize constantly complement identity assert '+
      'peek pop doto proxy defstruct first rest cons defprotocol cast coll deftype defrecord last butlast '+
      'sigs reify second ffirst fnext nfirst nnext defmulti defmethod meta with-meta ns in-ns create-ns import '+
      'refer keys select-keys vals key val rseq name namespace promise into transient persistent! conj! '+
      'assoc! dissoc! pop! disj! use class type num float double short byte boolean bigint biginteger '+
      'bigdec print-method print-dup throw-if printf format load compile get-in update-in pr pr-on newline '+
      'flush read slurp read-line subvec with-open memfn time re-find re-groups rand-int rand mod locking '+
      'assert-valid-fdecl alias resolve ref deref refset swap! reset! set-validator! compare-and-set! alter-meta! '+
      'reset-meta! commute get-validator alter ref-set ref-history-count ref-min-history ref-max-history ensure sync io! '+
      'new next conj set! to-array future future-call into-array aset gen-class reduce map filter find empty '+
      'hash-map hash-set sorted-map sorted-map-by sorted-set sorted-set-by vec vector seq flatten reverse assoc dissoc list '+
      'disj get union difference intersection extend extend-type extend-protocol int nth delay count concat chunk chunk-buffer '+
      'chunk-append chunk-first chunk-rest max min dec unchecked-inc-int unchecked-inc unchecked-dec-inc unchecked-dec unchecked-negate '+
      'unchecked-add-int unchecked-add unchecked-subtract-int unchecked-subtract chunk-next chunk-cons chunked-seq? prn vary-meta '+
      'lazy-seq spread list* str find-keyword keyword symbol gensym force rationalize'
   };

  var CLJ_IDENT_RE = '[a-zA-Z_0-9\\!\\.\\?\\-\\+\\*\\/\\<\\=\\>\\&\\#\\$\';]+';
  var SIMPLE_NUMBER_RE = '[\\s:\\(\\{]+\\d+(\\.\\d+)?';

  var NUMBER = {
    className: 'number', begin: SIMPLE_NUMBER_RE,
    relevance: 0
  };
  var STRING = hljs.inherit(hljs.QUOTE_STRING_MODE, {illegal: null});
  var COMMENT = {
    className: 'comment',
    begin: ';', end: '$',
    relevance: 0
  };
  var COLLECTION = {
    className: 'collection',
    begin: '[\\[\\{]', end: '[\\]\\}]'
  };
  var HINT = {
    className: 'comment',
    begin: '\\^' + CLJ_IDENT_RE
  };
  var HINT_COL = {
    className: 'comment',
    begin: '\\^\\{', end: '\\}'

  };
  var KEY = {
    className: 'attribute',
    begin: '[:]' + CLJ_IDENT_RE
  };
  var LIST = {
    className: 'list',
    begin: '\\(', end: '\\)'
  };
  var BODY = {
    endsWithParent: true,
    keywords: {literal: 'true false nil'},
    relevance: 0
  };
  var TITLE = {
    keywords: keywords,
    lexemes: CLJ_IDENT_RE,
    className: 'title', begin: CLJ_IDENT_RE,
    starts: BODY
  };

  LIST.contains = [{className: 'comment', begin: 'comment'}, TITLE, BODY];
  BODY.contains = [LIST, STRING, HINT, HINT_COL, COMMENT, KEY, COLLECTION, NUMBER];
  COLLECTION.contains = [LIST, STRING, HINT, COMMENT, KEY, COLLECTION, NUMBER];

  return {
    aliases: ['clj'],
    illegal: /\S/,
    contains: [
      COMMENT,
      LIST,
      {
        className: 'prompt',
        begin: /^=> /,
        starts: {end: /\n\n|\Z/} // eat up prompt output to not interfere with the illegal
      }
    ]
  }
};
},{}],43:[function(require,module,exports){
module.exports = function(hljs) {
  var KEYWORDS = {
    keyword:
      // JS keywords
      'in if for while finally new do return else break catch instanceof throw try this ' +
      'switch continue typeof delete debugger super ' +
      // Coffee keywords
      'then unless until loop of by when and or is isnt not',
    literal:
      // JS literals
      'true false null undefined ' +
      // Coffee literals
      'yes no on off',
    reserved:
      'case default function var void with const let enum export import native ' +
      '__hasProp __extends __slice __bind __indexOf',
    built_in:
      'npm require console print module global window document'
  };
  var JS_IDENT_RE = '[A-Za-z$_][0-9A-Za-z$_]*';
  var TITLE = hljs.inherit(hljs.TITLE_MODE, {begin: JS_IDENT_RE});
  var SUBST = {
    className: 'subst',
    begin: /#\{/, end: /}/,
    keywords: KEYWORDS
  };
  var EXPRESSIONS = [
    hljs.BINARY_NUMBER_MODE,
    hljs.inherit(hljs.C_NUMBER_MODE, {starts: {end: '(\\s*/)?', relevance: 0}}), // a number tries to eat the following slash to prevent treating it as a regexp
    {
      className: 'string',
      variants: [
        {
          begin: /'''/, end: /'''/,
          contains: [hljs.BACKSLASH_ESCAPE]
        },
        {
          begin: /'/, end: /'/,
          contains: [hljs.BACKSLASH_ESCAPE]
        },
        {
          begin: /"""/, end: /"""/,
          contains: [hljs.BACKSLASH_ESCAPE, SUBST]
        },
        {
          begin: /"/, end: /"/,
          contains: [hljs.BACKSLASH_ESCAPE, SUBST]
        }
      ]
    },
    {
      className: 'regexp',
      variants: [
        {
          begin: '///', end: '///',
          contains: [SUBST, hljs.HASH_COMMENT_MODE]
        },
        {
          begin: '//[gim]*',
          relevance: 0
        },
        {
          begin: '/\\S(\\\\.|[^\\n])*?/[gim]*(?=\\s|\\W|$)' // \S is required to parse x / 2 / 3 as two divisions
        }
      ]
    },
    {
      className: 'property',
      begin: '@' + JS_IDENT_RE
    },
    {
      begin: '`', end: '`',
      excludeBegin: true, excludeEnd: true,
      subLanguage: 'javascript'
    }
  ];
  SUBST.contains = EXPRESSIONS;

  return {
    aliases: ['coffee', 'cson', 'iced'],
    keywords: KEYWORDS,
    contains: EXPRESSIONS.concat([
      {
        className: 'comment',
        begin: '###', end: '###'
      },
      hljs.HASH_COMMENT_MODE,
      {
        className: 'function',
        begin: '(' + JS_IDENT_RE + '\\s*=\\s*)?(\\(.*\\))?\\s*\\B[-=]>', end: '[-=]>',
        returnBegin: true,
        contains: [
          TITLE,
          {
            className: 'params',
            begin: '\\(', returnBegin: true,
            /* We need another contained nameless mode to not have every nested
            pair of parens to be called "params" */
            contains: [{
              begin: /\(/, end: /\)/,
              keywords: KEYWORDS,
              contains: ['self'].concat(EXPRESSIONS)
            }]
          }
        ]
      },
      {
        className: 'class',
        beginKeywords: 'class',
        end: '$',
        illegal: /[:="\[\]]/,
        contains: [
          {
            beginKeywords: 'extends',
            endsWithParent: true,
            illegal: /[:="\[\]]/,
            contains: [TITLE]
          },
          TITLE
        ]
      },
      {
        className: 'attribute',
        begin: JS_IDENT_RE + ':', end: ':',
        returnBegin: true, excludeEnd: true,
        relevance: 0
      }
    ])
  };
};
},{}],44:[function(require,module,exports){
module.exports = function(hljs) {
  var CPP_KEYWORDS = {
    keyword: 'false int float while private char catch export virtual operator sizeof ' +
      'dynamic_cast|10 typedef const_cast|10 const struct for static_cast|10 union namespace ' +
      'unsigned long throw volatile static protected bool template mutable if public friend ' +
      'do return goto auto void enum else break new extern using true class asm case typeid ' +
      'short reinterpret_cast|10 default double register explicit signed typename try this ' +
      'switch continue wchar_t inline delete alignof char16_t char32_t constexpr decltype ' +
      'noexcept nullptr static_assert thread_local restrict _Bool complex _Complex _Imaginary',
    built_in: 'std string cin cout cerr clog stringstream istringstream ostringstream ' +
      'auto_ptr deque list queue stack vector map set bitset multiset multimap unordered_set ' +
      'unordered_map unordered_multiset unordered_multimap array shared_ptr abort abs acos ' +
      'asin atan2 atan calloc ceil cosh cos exit exp fabs floor fmod fprintf fputs free frexp ' +
      'fscanf isalnum isalpha iscntrl isdigit isgraph islower isprint ispunct isspace isupper ' +
      'isxdigit tolower toupper labs ldexp log10 log malloc memchr memcmp memcpy memset modf pow ' +
      'printf putchar puts scanf sinh sin snprintf sprintf sqrt sscanf strcat strchr strcmp ' +
      'strcpy strcspn strlen strncat strncmp strncpy strpbrk strrchr strspn strstr tanh tan ' +
      'vfprintf vprintf vsprintf'
  };
  return {
    aliases: ['c', 'h', 'c++', 'h++'],
    keywords: CPP_KEYWORDS,
    illegal: '</',
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.QUOTE_STRING_MODE,
      {
        className: 'string',
        begin: '\'\\\\?.', end: '\'',
        illegal: '.'
      },
      {
        className: 'number',
        begin: '\\b(\\d+(\\.\\d*)?|\\.\\d+)(u|U|l|L|ul|UL|f|F)'
      },
      hljs.C_NUMBER_MODE,
      {
        className: 'preprocessor',
        begin: '#', end: '$',
        keywords: 'if else elif endif define undef warning error line pragma',
        contains: [
          {
            begin: 'include\\s*[<"]', end: '[>"]',
            keywords: 'include',
            illegal: '\\n'
          },
          hljs.C_LINE_COMMENT_MODE
        ]
      },
      {
        className: 'stl_container',
        begin: '\\b(deque|list|queue|stack|vector|map|set|bitset|multiset|multimap|unordered_map|unordered_set|unordered_multiset|unordered_multimap|array)\\s*<', end: '>',
        keywords: CPP_KEYWORDS,
        relevance: 10,
        contains: ['self']
      },
      {
        begin: hljs.IDENT_RE + '::'
      }
    ]
  };
};
},{}],45:[function(require,module,exports){
module.exports = function(hljs) {
  var KEYWORDS =
    // Normal keywords.
    'abstract as base bool break byte case catch char checked const continue decimal ' +
    'default delegate do double else enum event explicit extern false finally fixed float ' +
    'for foreach goto if implicit in int interface internal is lock long new null ' +
    'object operator out override params private protected public readonly ref return sbyte ' +
    'sealed short sizeof stackalloc static string struct switch this throw true try typeof ' +
    'uint ulong unchecked unsafe ushort using virtual volatile void while async await ' +
    // Contextual keywords.
    'ascending descending from get group into join let orderby partial select set value var ' +
    'where yield';
  return {
    keywords: KEYWORDS,
    illegal: /::/,
    contains: [
      {
        className: 'comment',
        begin: '///', end: '$', returnBegin: true,
        contains: [
          {
            className: 'xmlDocTag',
            variants: [
              {
                begin: '///', relevance: 0
              },
              {
                begin: '<!--|-->'
              },
              {
                begin: '</?', end: '>'
              }
            ]
          }
        ]
      },
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      {
        className: 'preprocessor',
        begin: '#', end: '$',
        keywords: 'if else elif endif define undef warning error line region endregion pragma checksum'
      },
      {
        className: 'string',
        begin: '@"', end: '"',
        contains: [{begin: '""'}]
      },
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      hljs.C_NUMBER_MODE,
      {
        beginKeywords: 'protected public private internal', end: /[{;=]/,
        keywords: KEYWORDS,
        contains: [
          {
            beginKeywords: 'class namespace interface',
            starts: {
              contains: [hljs.TITLE_MODE]
            }
          },
          {
            begin: hljs.IDENT_RE + '\\s*\\(', returnBegin: true,
            contains: [
              hljs.TITLE_MODE
            ]
          }
        ]
      }
    ]
  };
};
},{}],46:[function(require,module,exports){
module.exports = function(hljs) {
  var IDENT_RE = '[a-zA-Z-][a-zA-Z0-9_-]*';
  var FUNCTION = {
    className: 'function',
    begin: IDENT_RE + '\\(', 
    returnBegin: true,
    excludeEnd: true,
    end: '\\('
  };
  return {
    case_insensitive: true,
    illegal: '[=/|\']',
    contains: [
      hljs.C_BLOCK_COMMENT_MODE,
      {
        className: 'id', begin: '\\#[A-Za-z0-9_-]+'
      },
      {
        className: 'class', begin: '\\.[A-Za-z0-9_-]+',
        relevance: 0
      },
      {
        className: 'attr_selector',
        begin: '\\[', end: '\\]',
        illegal: '$'
      },
      {
        className: 'pseudo',
        begin: ':(:)?[a-zA-Z0-9\\_\\-\\+\\(\\)\\"\\\']+'
      },
      {
        className: 'at_rule',
        begin: '@(font-face|page)',
        lexemes: '[a-z-]+',
        keywords: 'font-face page'
      },
      {
        className: 'at_rule',
        begin: '@', end: '[{;]', // at_rule eating first "{" is a good thing
                                 // because it doesn’t let it to be parsed as
                                 // a rule set but instead drops parser into
                                 // the default mode which is how it should be.
        contains: [
          {
            className: 'keyword',
            begin: /\S+/
          },
          {
            begin: /\s/, endsWithParent: true, excludeEnd: true,
            relevance: 0,
            contains: [
              FUNCTION,
              hljs.APOS_STRING_MODE, hljs.QUOTE_STRING_MODE,
              hljs.CSS_NUMBER_MODE
            ]
          }
        ]
      },
      {
        className: 'tag', begin: IDENT_RE,
        relevance: 0
      },
      {
        className: 'rules',
        begin: '{', end: '}',
        illegal: '[^\\s]',
        relevance: 0,
        contains: [
          hljs.C_BLOCK_COMMENT_MODE,
          {
            className: 'rule',
            begin: '[^\\s]', returnBegin: true, end: ';', endsWithParent: true,
            contains: [
              {
                className: 'attribute',
                begin: '[A-Z\\_\\.\\-]+', end: ':',
                excludeEnd: true,
                illegal: '[^\\s]',
                starts: {
                  className: 'value',
                  endsWithParent: true, excludeEnd: true,
                  contains: [
                    FUNCTION,
                    hljs.CSS_NUMBER_MODE,
                    hljs.QUOTE_STRING_MODE,
                    hljs.APOS_STRING_MODE,
                    hljs.C_BLOCK_COMMENT_MODE,
                    {
                      className: 'hexcolor', begin: '#[0-9A-Fa-f]+'
                    },
                    {
                      className: 'important', begin: '!important'
                    }
                  ]
                }
              }
            ]
          }
        ]
      }
    ]
  };
};
},{}],47:[function(require,module,exports){
module.exports = function(hljs) {
  return {
    aliases: ['patch'],
    contains: [
      {
        className: 'chunk',
        relevance: 10,
        variants: [
          {begin: /^\@\@ +\-\d+,\d+ +\+\d+,\d+ +\@\@$/},
          {begin: /^\*\*\* +\d+,\d+ +\*\*\*\*$/},
          {begin: /^\-\-\- +\d+,\d+ +\-\-\-\-$/}
        ]
      },
      {
        className: 'header',
        variants: [
          {begin: /Index: /, end: /$/},
          {begin: /=====/, end: /=====$/},
          {begin: /^\-\-\-/, end: /$/},
          {begin: /^\*{3} /, end: /$/},
          {begin: /^\+\+\+/, end: /$/},
          {begin: /\*{5}/, end: /\*{5}$/}
        ]
      },
      {
        className: 'addition',
        begin: '^\\+', end: '$'
      },
      {
        className: 'deletion',
        begin: '^\\-', end: '$'
      },
      {
        className: 'change',
        begin: '^\\!', end: '$'
      }
    ]
  };
};
},{}],48:[function(require,module,exports){
module.exports = function(hljs) {
  var BASIC_ATOM_RE = '[a-z\'][a-zA-Z0-9_\']*';
  var FUNCTION_NAME_RE = '(' + BASIC_ATOM_RE + ':' + BASIC_ATOM_RE + '|' + BASIC_ATOM_RE + ')';
  var ERLANG_RESERVED = {
    keyword:
      'after and andalso|10 band begin bnot bor bsl bzr bxor case catch cond div end fun let ' +
      'not of orelse|10 query receive rem try when xor',
    literal:
      'false true'
  };

  var COMMENT = {
    className: 'comment',
    begin: '%', end: '$',
    relevance: 0
  };
  var NUMBER = {
    className: 'number',
    begin: '\\b(\\d+#[a-fA-F0-9]+|\\d+(\\.\\d+)?([eE][-+]?\\d+)?)',
    relevance: 0
  };
  var NAMED_FUN = {
    begin: 'fun\\s+' + BASIC_ATOM_RE + '/\\d+'
  };
  var FUNCTION_CALL = {
    begin: FUNCTION_NAME_RE + '\\(', end: '\\)',
    returnBegin: true,
    relevance: 0,
    contains: [
      {
        className: 'function_name', begin: FUNCTION_NAME_RE,
        relevance: 0
      },
      {
        begin: '\\(', end: '\\)', endsWithParent: true,
        returnEnd: true,
        relevance: 0
        // "contains" defined later
      }
    ]
  };
  var TUPLE = {
    className: 'tuple',
    begin: '{', end: '}',
    relevance: 0
    // "contains" defined later
  };
  var VAR1 = {
    className: 'variable',
    begin: '\\b_([A-Z][A-Za-z0-9_]*)?',
    relevance: 0
  };
  var VAR2 = {
    className: 'variable',
    begin: '[A-Z][a-zA-Z0-9_]*',
    relevance: 0
  };
  var RECORD_ACCESS = {
    begin: '#' + hljs.UNDERSCORE_IDENT_RE,
    relevance: 0,
    returnBegin: true,
    contains: [
      {
        className: 'record_name',
        begin: '#' + hljs.UNDERSCORE_IDENT_RE,
        relevance: 0
      },
      {
        begin: '{', end: '}',
        relevance: 0
        // "contains" defined later
      }
    ]
  };

  var BLOCK_STATEMENTS = {
    beginKeywords: 'fun receive if try case', end: 'end',
    keywords: ERLANG_RESERVED
  };
  BLOCK_STATEMENTS.contains = [
    COMMENT,
    NAMED_FUN,
    hljs.inherit(hljs.APOS_STRING_MODE, {className: ''}),
    BLOCK_STATEMENTS,
    FUNCTION_CALL,
    hljs.QUOTE_STRING_MODE,
    NUMBER,
    TUPLE,
    VAR1, VAR2,
    RECORD_ACCESS
  ];

  var BASIC_MODES = [
    COMMENT,
    NAMED_FUN,
    BLOCK_STATEMENTS,
    FUNCTION_CALL,
    hljs.QUOTE_STRING_MODE,
    NUMBER,
    TUPLE,
    VAR1, VAR2,
    RECORD_ACCESS
  ];
  FUNCTION_CALL.contains[1].contains = BASIC_MODES;
  TUPLE.contains = BASIC_MODES;
  RECORD_ACCESS.contains[1].contains = BASIC_MODES;

  var PARAMS = {
    className: 'params',
    begin: '\\(', end: '\\)',
    contains: BASIC_MODES
  };
  return {
    aliases: ['erl'],
    keywords: ERLANG_RESERVED,
    illegal: '(</|\\*=|\\+=|-=|/=|/\\*|\\*/|\\(\\*|\\*\\))',
    contains: [
      {
        className: 'function',
        begin: '^' + BASIC_ATOM_RE + '\\s*\\(', end: '->',
        returnBegin: true,
        illegal: '\\(|#|//|/\\*|\\\\|:|;',
        contains: [
          PARAMS,
          hljs.inherit(hljs.TITLE_MODE, {begin: BASIC_ATOM_RE})
        ],
        starts: {
          end: ';|\\.',
          keywords: ERLANG_RESERVED,
          contains: BASIC_MODES
        }
      },
      COMMENT,
      {
        className: 'pp',
        begin: '^-', end: '\\.',
        relevance: 0,
        excludeEnd: true,
        returnBegin: true,
        lexemes: '-' + hljs.IDENT_RE,
        keywords:
          '-module -record -undef -export -ifdef -ifndef -author -copyright -doc -vsn ' +
          '-import -include -include_lib -compile -define -else -endif -file -behaviour ' +
          '-behavior',
        contains: [PARAMS]
      },
      NUMBER,
      hljs.QUOTE_STRING_MODE,
      RECORD_ACCESS,
      VAR1, VAR2,
      TUPLE
    ]
  };
};
},{}],49:[function(require,module,exports){
module.exports = function(hljs) {
  var GO_KEYWORDS = {
    keyword:
      'break default func interface select case map struct chan else goto package switch ' +
      'const fallthrough if range type continue for import return var go defer',
    constant:
       'true false iota nil',
    typename:
      'bool byte complex64 complex128 float32 float64 int8 int16 int32 int64 string uint8 ' +
      'uint16 uint32 uint64 int uint uintptr rune',
    built_in:
      'append cap close complex copy imag len make new panic print println real recover delete'
  };
  return {
    aliases: ["golang"],
    keywords: GO_KEYWORDS,
    illegal: '</',
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.QUOTE_STRING_MODE,
      {
        className: 'string',
        begin: '\'', end: '[^\\\\]\''
      },
      {
        className: 'string',
        begin: '`', end: '`'
      },
      {
        className: 'number',
        begin: '[^a-zA-Z_0-9](\\-|\\+)?\\d+(\\.\\d+|\\/\\d+)?((d|e|f|l|s)(\\+|\\-)?\\d+)?',
        relevance: 0
      },
      hljs.C_NUMBER_MODE
    ]
  };
};
},{}],50:[function(require,module,exports){
module.exports = // TODO support filter tags like :javascript, support inline HTML
function(hljs) {
  return {
    case_insensitive: true,
    contains: [
      {
        className: 'doctype',
        begin: '^!!!( (5|1\\.1|Strict|Frameset|Basic|Mobile|RDFa|XML\\b.*))?$',
        relevance: 10
      },
      {
        className: 'comment',
        // FIXME these comments should be allowed to span indented lines
        begin: '^\\s*(!=#|=#|-#|/).*$',
        relevance: 0
      },
      {
        begin: '^\\s*(-|=|!=)(?!#)',
        starts: {
          end: '\\n',
          subLanguage: 'ruby'
        }
      },
      {
        className: 'tag',
        begin: '^\\s*%',
        contains: [
          {
            className: 'title',
            begin: '\\w+'
          },
          {
            className: 'value',
            begin: '[#\\.]\\w+'
          },
          {
            begin: '{\\s*',
            end: '\\s*}',
            excludeEnd: true,
            contains: [
              {
                //className: 'attribute',
                begin: ':\\w+\\s*=>',
                end: ',\\s+',
                returnBegin: true,
                endsWithParent: true,
                contains: [
                  {
                    className: 'symbol',
                    begin: ':\\w+'
                  },
                  {
                    className: 'string',
                    begin: '"',
                    end: '"'
                  },
                  {
                    className: 'string',
                    begin: '\'',
                    end: '\''
                  },
                  {
                    begin: '\\w+',
                    relevance: 0
                  }
                ]
              }
            ]
          },
          {
            begin: '\\(\\s*',
            end: '\\s*\\)',
            excludeEnd: true,
            contains: [
              {
                //className: 'attribute',
                begin: '\\w+\\s*=',
                end: '\\s+',
                returnBegin: true,
                endsWithParent: true,
                contains: [
                  {
                    className: 'attribute',
                    begin: '\\w+',
                    relevance: 0
                  },
                  {
                    className: 'string',
                    begin: '"',
                    end: '"'
                  },
                  {
                    className: 'string',
                    begin: '\'',
                    end: '\''
                  },
                  {
                    begin: '\\w+',
                    relevance: 0
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        className: 'bullet',
        begin: '^\\s*[=~]\\s*',
        relevance: 0
      },
      {
        begin: '#{',
        starts: {
          end: '}',
          subLanguage: 'ruby'
        }
      }
    ]
  };
};
},{}],51:[function(require,module,exports){
module.exports = function(hljs) {

  var COMMENT = {
    className: 'comment',
    variants: [
      { begin: '--', end: '$' },
      { begin: '{-', end: '-}'
      , contains: ['self']
      }
    ]
  };

  var PRAGMA = {
    className: 'pragma',
    begin: '{-#', end: '#-}'
  };

  var PREPROCESSOR = {
    className: 'preprocessor',
    begin: '^#', end: '$'
  };

  var CONSTRUCTOR = {
    className: 'type',
    begin: '\\b[A-Z][\\w\']*', // TODO: other constructors (build-in, infix).
    relevance: 0
  };

  var LIST = {
    className: 'container',
    begin: '\\(', end: '\\)',
    illegal: '"',
    contains: [
      PRAGMA,
      COMMENT,
      PREPROCESSOR,
      {className: 'type', begin: '\\b[A-Z][\\w]*(\\((\\.\\.|,|\\w+)\\))?'},
      hljs.inherit(hljs.TITLE_MODE, {begin: '[_a-z][\\w\']*'})
    ]
  };

  var RECORD = {
    className: 'container',
    begin: '{', end: '}',
    contains: LIST.contains
  };

  return {
    aliases: ['hs'],
    keywords:
      'let in if then else case of where do module import hiding ' +
      'qualified type data newtype deriving class instance as default ' +
      'infix infixl infixr foreign export ccall stdcall cplusplus ' +
      'jvm dotnet safe unsafe family forall mdo proc rec',
    contains: [

      // Top-level constructions.

      {
        className: 'module',
        begin: '\\bmodule\\b', end: 'where',
        keywords: 'module where',
        contains: [LIST, COMMENT],
        illegal: '\\W\\.|;'
      },
      {
        className: 'import',
        begin: '\\bimport\\b', end: '$',
        keywords: 'import|0 qualified as hiding',
        contains: [LIST, COMMENT],
        illegal: '\\W\\.|;'
      },

      {
        className: 'class',
        begin: '^(\\s*)?(class|instance)\\b', end: 'where',
        keywords: 'class family instance where',
        contains: [CONSTRUCTOR, LIST, COMMENT]
      },
      {
        className: 'typedef',
        begin: '\\b(data|(new)?type)\\b', end: '$',
        keywords: 'data family type newtype deriving',
        contains: [PRAGMA, COMMENT, CONSTRUCTOR, LIST, RECORD]
      },
      {
        className: 'default',
        beginKeywords: 'default', end: '$',
        contains: [CONSTRUCTOR, LIST, COMMENT]
      },
      {
        className: 'infix',
        beginKeywords: 'infix infixl infixr', end: '$',
        contains: [hljs.C_NUMBER_MODE, COMMENT]
      },
      {
        className: 'foreign',
        begin: '\\bforeign\\b', end: '$',
        keywords: 'foreign import export ccall stdcall cplusplus jvm ' +
                  'dotnet safe unsafe',
        contains: [CONSTRUCTOR, hljs.QUOTE_STRING_MODE, COMMENT]
      },
      {
        className: 'shebang',
        begin: '#!\\/usr\\/bin\\/env\ runhaskell', end: '$'
      },

      // "Whitespaces".

      PRAGMA,
      COMMENT,
      PREPROCESSOR,

      // Literals and names.

      // TODO: characters.
      hljs.QUOTE_STRING_MODE,
      hljs.C_NUMBER_MODE,
      CONSTRUCTOR,
      hljs.inherit(hljs.TITLE_MODE, {begin: '^[_a-z][\\w\']*'}),

      {begin: '->|<-'} // No markup, relevance booster
    ]
  };
};
},{}],52:[function(require,module,exports){
module.exports = function(hljs) {
  return {
    illegal: '\\S',
    contains: [
      {
        className: 'status',
        begin: '^HTTP/[0-9\\.]+', end: '$',
        contains: [{className: 'number', begin: '\\b\\d{3}\\b'}]
      },
      {
        className: 'request',
        begin: '^[A-Z]+ (.*?) HTTP/[0-9\\.]+$', returnBegin: true, end: '$',
        contains: [
          {
            className: 'string',
            begin: ' ', end: ' ',
            excludeBegin: true, excludeEnd: true
          }
        ]
      },
      {
        className: 'attribute',
        begin: '^\\w', end: ': ', excludeEnd: true,
        illegal: '\\n|\\s|=',
        starts: {className: 'string', end: '$'}
      },
      {
        begin: '\\n\\n',
        starts: {subLanguage: '', endsWithParent: true}
      }
    ]
  };
};
},{}],53:[function(require,module,exports){
module.exports = function(hljs) {
  return {
    case_insensitive: true,
    illegal: /\S/,
    contains: [
      {
        className: 'comment',
        begin: ';', end: '$'
      },
      {
        className: 'title',
        begin: '^\\[', end: '\\]'
      },
      {
        className: 'setting',
        begin: '^[a-z0-9\\[\\]_-]+[ \\t]*=[ \\t]*', end: '$',
        contains: [
          {
            className: 'value',
            endsWithParent: true,
            keywords: 'on off true false yes no',
            contains: [hljs.QUOTE_STRING_MODE, hljs.NUMBER_MODE],
            relevance: 0
          }
        ]
      }
    ]
  };
};
},{}],54:[function(require,module,exports){
module.exports = function(hljs) {
  var KEYWORDS =
    'false synchronized int abstract float private char boolean static null if const ' +
    'for true while long throw strictfp finally protected import native final return void ' +
    'enum else break transient new catch instanceof byte super volatile case assert short ' +
    'package default double public try this switch continue throws';
  return {
    aliases: ['jsp'],
    keywords: KEYWORDS,
    illegal: /<\//,
    contains: [
      {
        className: 'javadoc',
        begin: '/\\*\\*', end: '\\*/',
        contains: [{
          className: 'javadoctag', begin: '(^|\\s)@[A-Za-z]+'
        }],
        relevance: 10
      },
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      {
        beginKeywords: 'protected public private', end: /[{;=]/,
        keywords: KEYWORDS,
        contains: [
          {
            className: 'class',
            beginKeywords: 'class interface', endsWithParent: true, excludeEnd: true,
            illegal: /[:"<>]/,
            contains: [
              {
                beginKeywords: 'extends implements',
                relevance: 10
              },
              hljs.UNDERSCORE_TITLE_MODE
            ]
          },
          {
            begin: hljs.UNDERSCORE_IDENT_RE + '\\s*\\(', returnBegin: true,
            contains: [
              hljs.UNDERSCORE_TITLE_MODE
            ]
          }
        ]
      },
      hljs.C_NUMBER_MODE,
      {
        className: 'annotation', begin: '@[A-Za-z]+'
      }
    ]
  };
};
},{}],55:[function(require,module,exports){
module.exports = function(hljs) {
  return {
    aliases: ['js'],
    keywords: {
      keyword:
        'in if for while finally var new function do return void else break catch ' +
        'instanceof with throw case default try this switch continue typeof delete ' +
        'let yield const class',
      literal:
        'true false null undefined NaN Infinity',
      built_in:
        'eval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent ' +
        'encodeURI encodeURIComponent escape unescape Object Function Boolean Error ' +
        'EvalError InternalError RangeError ReferenceError StopIteration SyntaxError ' +
        'TypeError URIError Number Math Date String RegExp Array Float32Array ' +
        'Float64Array Int16Array Int32Array Int8Array Uint16Array Uint32Array ' +
        'Uint8Array Uint8ClampedArray ArrayBuffer DataView JSON Intl arguments require ' +
        'module console window document'
    },
    contains: [
      {
        className: 'pi',
        begin: /^\s*('|")use strict('|")/,
        relevance: 10
      },
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.C_NUMBER_MODE,
      { // "value" container
        begin: '(' + hljs.RE_STARTERS_RE + '|\\b(case|return|throw)\\b)\\s*',
        keywords: 'return throw case',
        contains: [
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE,
          hljs.REGEXP_MODE,
          { // E4X
            begin: /</, end: />;/,
            relevance: 0,
            subLanguage: 'xml'
          }
        ],
        relevance: 0
      },
      {
        className: 'function',
        beginKeywords: 'function', end: /\{/, excludeEnd: true,
        contains: [
          hljs.inherit(hljs.TITLE_MODE, {begin: /[A-Za-z$_][0-9A-Za-z$_]*/}),
          {
            className: 'params',
            begin: /\(/, end: /\)/,
            contains: [
              hljs.C_LINE_COMMENT_MODE,
              hljs.C_BLOCK_COMMENT_MODE
            ],
            illegal: /["'\(]/
          }
        ],
        illegal: /\[|%/
      },
      {
        begin: /\$[(.]/ // relevance booster for a pattern common to JS libs: `$(something)` and `$.something`
      },
      {
        begin: '\\.' + hljs.IDENT_RE, relevance: 0 // hack: prevents detection of keywords after dots
      }
    ]
  };
};
},{}],56:[function(require,module,exports){
module.exports = function(hljs) {
  var LITERALS = {literal: 'true false null'};
  var TYPES = [
    hljs.QUOTE_STRING_MODE,
    hljs.C_NUMBER_MODE
  ];
  var VALUE_CONTAINER = {
    className: 'value',
    end: ',', endsWithParent: true, excludeEnd: true,
    contains: TYPES,
    keywords: LITERALS
  };
  var OBJECT = {
    begin: '{', end: '}',
    contains: [
      {
        className: 'attribute',
        begin: '\\s*"', end: '"\\s*:\\s*', excludeBegin: true, excludeEnd: true,
        contains: [hljs.BACKSLASH_ESCAPE],
        illegal: '\\n',
        starts: VALUE_CONTAINER
      }
    ],
    illegal: '\\S'
  };
  var ARRAY = {
    begin: '\\[', end: '\\]',
    contains: [hljs.inherit(VALUE_CONTAINER, {className: null})], // inherit is also a workaround for a bug that makes shared modes with endsWithParent compile only the ending of one of the parents
    illegal: '\\S'
  };
  TYPES.splice(TYPES.length, 0, OBJECT, ARRAY);
  return {
    contains: TYPES,
    keywords: LITERALS,
    illegal: '\\S'
  };
};
},{}],57:[function(require,module,exports){
module.exports = function(hljs) {
  var LISP_IDENT_RE = '[a-zA-Z_\\-\\+\\*\\/\\<\\=\\>\\&\\#][a-zA-Z0-9_\\-\\+\\*\\/\\<\\=\\>\\&\\#!]*';
  var LISP_SIMPLE_NUMBER_RE = '(\\-|\\+)?\\d+(\\.\\d+|\\/\\d+)?((d|e|f|l|s)(\\+|\\-)?\\d+)?';
  var SHEBANG = {
    className: 'shebang',
    begin: '^#!', end: '$'
  };
  var LITERAL = {
    className: 'literal',
    begin: '\\b(t{1}|nil)\\b'
  };
  var NUMBER = {
    className: 'number',
    variants: [
      {begin: LISP_SIMPLE_NUMBER_RE, relevance: 0},
      {begin: '#b[0-1]+(/[0-1]+)?'},
      {begin: '#o[0-7]+(/[0-7]+)?'},
      {begin: '#x[0-9a-f]+(/[0-9a-f]+)?'},
      {begin: '#c\\(' + LISP_SIMPLE_NUMBER_RE + ' +' + LISP_SIMPLE_NUMBER_RE, end: '\\)'}
    ]
  };
  var STRING = hljs.inherit(hljs.QUOTE_STRING_MODE, {illegal: null});
  var COMMENT = {
    className: 'comment',
    begin: ';', end: '$'
  };
  var VARIABLE = {
    className: 'variable',
    begin: '\\*', end: '\\*'
  };
  var KEYWORD = {
    className: 'keyword',
    begin: '[:&]' + LISP_IDENT_RE
  };
  var QUOTED_LIST = {
    begin: '\\(', end: '\\)',
    contains: ['self', LITERAL, STRING, NUMBER]
  };
  var QUOTED = {
    className: 'quoted',
    contains: [NUMBER, STRING, VARIABLE, KEYWORD, QUOTED_LIST],
    variants: [
      {
        begin: '[\'`]\\(', end: '\\)'
      },
      {
        begin: '\\(quote ', end: '\\)',
        keywords: {title: 'quote'}
      }
    ]
  };
  var LIST = {
    className: 'list',
    begin: '\\(', end: '\\)'
  };
  var BODY = {
    endsWithParent: true,
    relevance: 0
  };
  LIST.contains = [{className: 'title', begin: LISP_IDENT_RE}, BODY];
  BODY.contains = [QUOTED, LIST, LITERAL, NUMBER, STRING, COMMENT, VARIABLE, KEYWORD];

  return {
    illegal: /\S/,
    contains: [
      NUMBER,
      SHEBANG,
      LITERAL,
      STRING,
      COMMENT,
      QUOTED,
      LIST
    ]
  };
};
},{}],58:[function(require,module,exports){
module.exports = function(hljs) {
  var OPENING_LONG_BRACKET = '\\[=*\\[';
  var CLOSING_LONG_BRACKET = '\\]=*\\]';
  var LONG_BRACKETS = {
    begin: OPENING_LONG_BRACKET, end: CLOSING_LONG_BRACKET,
    contains: ['self']
  };
  var COMMENTS = [
    {
      className: 'comment',
      begin: '--(?!' + OPENING_LONG_BRACKET + ')', end: '$'
    },
    {
      className: 'comment',
      begin: '--' + OPENING_LONG_BRACKET, end: CLOSING_LONG_BRACKET,
      contains: [LONG_BRACKETS],
      relevance: 10
    }
  ]
  return {
    lexemes: hljs.UNDERSCORE_IDENT_RE,
    keywords: {
      keyword:
        'and break do else elseif end false for if in local nil not or repeat return then ' +
        'true until while',
      built_in:
        '_G _VERSION assert collectgarbage dofile error getfenv getmetatable ipairs load ' +
        'loadfile loadstring module next pairs pcall print rawequal rawget rawset require ' +
        'select setfenv setmetatable tonumber tostring type unpack xpcall coroutine debug ' +
        'io math os package string table'
    },
    contains: COMMENTS.concat([
      {
        className: 'function',
        beginKeywords: 'function', end: '\\)',
        contains: [
          hljs.inherit(hljs.TITLE_MODE, {begin: '([_a-zA-Z]\\w*\\.)*([_a-zA-Z]\\w*:)?[_a-zA-Z]\\w*'}),
          {
            className: 'params',
            begin: '\\(', endsWithParent: true,
            contains: COMMENTS
          }
        ].concat(COMMENTS)
      },
      hljs.C_NUMBER_MODE,
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      {
        className: 'string',
        begin: OPENING_LONG_BRACKET, end: CLOSING_LONG_BRACKET,
        contains: [LONG_BRACKETS],
        relevance: 10
      }
    ])
  };
};
},{}],59:[function(require,module,exports){
module.exports = function(hljs) {
  var VARIABLE = {
    className: 'variable',
    begin: /\$\(/, end: /\)/,
    contains: [hljs.BACKSLASH_ESCAPE]
  };
  return {
    aliases: ['mk', 'mak'],
    contains: [
      hljs.HASH_COMMENT_MODE,
      {
        begin: /^\w+\s*\W*=/, returnBegin: true,
        relevance: 0,
        starts: {
          className: 'constant',
          end: /\s*\W*=/, excludeEnd: true,
          starts: {
            end: /$/,
            relevance: 0,
            contains: [
              VARIABLE
            ]
          }
        }
      },
      {
        className: 'title',
        begin: /^[\w]+:\s*$/
      },
      {
        className: 'phony',
        begin: /^\.PHONY:/, end: /$/,
        keywords: '.PHONY', lexemes: /[\.\w]+/
      },
      {
        begin: /^\t+/, end: /$/,
        contains: [
          hljs.QUOTE_STRING_MODE,
          VARIABLE
        ]
      }
    ]
  };
};
},{}],60:[function(require,module,exports){
module.exports = function(hljs) {
  return {
    aliases: ['md', 'mkdown', 'mkd'],
    contains: [
      // highlight headers
      {
        className: 'header',
        variants: [
          { begin: '^#{1,6}', end: '$' },
          { begin: '^.+?\\n[=-]{2,}$' }
        ]
      },
      // inline html
      {
        begin: '<', end: '>',
        subLanguage: 'xml',
        relevance: 0
      },
      // lists (indicators only)
      {
        className: 'bullet',
        begin: '^([*+-]|(\\d+\\.))\\s+'
      },
      // strong segments
      {
        className: 'strong',
        begin: '[*_]{2}.+?[*_]{2}'
      },
      // emphasis segments
      {
        className: 'emphasis',
        variants: [
          { begin: '\\*.+?\\*' },
          { begin: '_.+?_'
          , relevance: 0
          }
        ]
      },
      // blockquotes
      {
        className: 'blockquote',
        begin: '^>\\s+', end: '$'
      },
      // code snippets
      {
        className: 'code',
        variants: [
          { begin: '`.+?`' },
          { begin: '^( {4}|\t)', end: '$'
          , relevance: 0
          }
        ]
      },
      // horizontal rules
      {
        className: 'horizontal_rule',
        begin: '^[-\\*]{3,}', end: '$'
      },
      // using links - title and link
      {
        begin: '\\[.+?\\][\\(\\[].+?[\\)\\]]',
        returnBegin: true,
        contains: [
          {
            className: 'link_label',
            begin: '\\[', end: '\\]',
            excludeBegin: true,
            returnEnd: true,
            relevance: 0
          },
          {
            className: 'link_url',
            begin: '\\]\\(', end: '\\)',
            excludeBegin: true, excludeEnd: true
          },
          {
            className: 'link_reference',
            begin: '\\]\\[', end: '\\]',
            excludeBegin: true, excludeEnd: true
          }
        ],
        relevance: 10
      },
      {
        begin: '^\\[\.+\\]:', end: '$',
        returnBegin: true,
        contains: [
          {
            className: 'link_reference',
            begin: '\\[', end: '\\]',
            excludeBegin: true, excludeEnd: true
          },
          {
            className: 'link_url',
            begin: '\\s', end: '$'
          }
        ]
      }
    ]
  };
};
},{}],61:[function(require,module,exports){
module.exports = function(hljs) {
  var VAR = {
    className: 'variable',
    variants: [
      {begin: /\$\d+/},
      {begin: /\$\{/, end: /}/},
      {begin: '[\\$\\@]' + hljs.UNDERSCORE_IDENT_RE}
    ]
  };
  var DEFAULT = {
    endsWithParent: true,
    lexemes: '[a-z/_]+',
    keywords: {
      built_in:
        'on off yes no true false none blocked debug info notice warn error crit ' +
        'select break last permanent redirect kqueue rtsig epoll poll /dev/poll'
    },
    relevance: 0,
    illegal: '=>',
    contains: [
      hljs.HASH_COMMENT_MODE,
      {
        className: 'string',
        contains: [hljs.BACKSLASH_ESCAPE, VAR],
        variants: [
          {begin: /"/, end: /"/},
          {begin: /'/, end: /'/}
        ]
      },
      {
        className: 'url',
        begin: '([a-z]+):/', end: '\\s', endsWithParent: true, excludeEnd: true
      },
      {
        className: 'regexp',
        contains: [hljs.BACKSLASH_ESCAPE, VAR],
        variants: [
          {begin: "\\s\\^", end: "\\s|{|;", returnEnd: true},
          // regexp locations (~, ~*)
          {begin: "~\\*?\\s+", end: "\\s|{|;", returnEnd: true},
          // *.example.com
          {begin: "\\*(\\.[a-z\\-]+)+"},
          // sub.example.*
          {begin: "([a-z\\-]+\\.)+\\*"}
        ]
      },
      // IP
      {
        className: 'number',
        begin: '\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}(:\\d{1,5})?\\b'
      },
      // units
      {
        className: 'number',
        begin: '\\b\\d+[kKmMgGdshdwy]*\\b',
        relevance: 0
      },
      VAR
    ]
  };

  return {
    aliases: ['nginxconf'],
    contains: [
      hljs.HASH_COMMENT_MODE,
      {
        begin: hljs.UNDERSCORE_IDENT_RE + '\\s', end: ';|{', returnBegin: true,
        contains: [
          {
            className: 'title',
            begin: hljs.UNDERSCORE_IDENT_RE,
            starts: DEFAULT
          }
        ],
        relevance: 0
      }
    ],
    illegal: '[^\\s\\}]'
  };
};
},{}],62:[function(require,module,exports){
module.exports = function(hljs) {
  var OBJC_KEYWORDS = {
    keyword:
      'int float while char export sizeof typedef const struct for union ' +
      'unsigned long volatile static bool mutable if do return goto void ' +
      'enum else break extern asm case short default double register explicit ' +
      'signed typename this switch continue wchar_t inline readonly assign ' +
      'self synchronized id ' +
      'nonatomic super unichar IBOutlet IBAction strong weak ' +
      '@private @protected @public @try @property @end @throw @catch @finally ' +
      '@synthesize @dynamic @selector @optional @required',
    literal:
    	'false true FALSE TRUE nil YES NO NULL',
    built_in:
      'NSString NSDictionary CGRect CGPoint UIButton UILabel UITextView UIWebView MKMapView ' +
      'UISegmentedControl NSObject UITableViewDelegate UITableViewDataSource NSThread ' +
      'UIActivityIndicator UITabbar UIToolBar UIBarButtonItem UIImageView NSAutoreleasePool ' +
      'UITableView BOOL NSInteger CGFloat NSException NSLog NSMutableString NSMutableArray ' +
      'NSMutableDictionary NSURL NSIndexPath CGSize UITableViewCell UIView UIViewController ' +
      'UINavigationBar UINavigationController UITabBarController UIPopoverController ' +
      'UIPopoverControllerDelegate UIImage NSNumber UISearchBar NSFetchedResultsController ' +
      'NSFetchedResultsChangeType UIScrollView UIScrollViewDelegate UIEdgeInsets UIColor ' +
      'UIFont UIApplication NSNotFound NSNotificationCenter NSNotification ' +
      'UILocalNotification NSBundle NSFileManager NSTimeInterval NSDate NSCalendar ' +
      'NSUserDefaults UIWindow NSRange NSArray NSError NSURLRequest NSURLConnection ' +
      'UIInterfaceOrientation MPMoviePlayerController dispatch_once_t ' +
      'dispatch_queue_t dispatch_sync dispatch_async dispatch_once'
  };
  var LEXEMES = /[a-zA-Z@][a-zA-Z0-9_]*/;
  var CLASS_KEYWORDS = '@interface @class @protocol @implementation';
  return {
    aliases: ['m', 'mm', 'objc', 'obj-c'],
    keywords: OBJC_KEYWORDS, lexemes: LEXEMES,
    illegal: '</',
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.C_NUMBER_MODE,
      hljs.QUOTE_STRING_MODE,
      {
        className: 'string',
        begin: '\'',
        end: '[^\\\\]\'',
        illegal: '[^\\\\][^\']'
      },

      {
        className: 'preprocessor',
        begin: '#import',
        end: '$',
        contains: [
        {
          className: 'title',
          begin: '\"',
          end: '\"'
        },
        {
          className: 'title',
          begin: '<',
          end: '>'
        }
        ]
      },
      {
        className: 'preprocessor',
        begin: '#',
        end: '$'
      },
      {
        className: 'class',
        begin: '(' + CLASS_KEYWORDS.split(' ').join('|') + ')\\b', end: '({|$)', excludeEnd: true,
        keywords: CLASS_KEYWORDS, lexemes: LEXEMES,
        contains: [
          hljs.UNDERSCORE_TITLE_MODE
        ]
      },
      {
        className: 'variable',
        begin: '\\.'+hljs.UNDERSCORE_IDENT_RE,
        relevance: 0
      }
    ]
  };
};
},{}],63:[function(require,module,exports){
module.exports = function(hljs) {
  var PERL_KEYWORDS = 'getpwent getservent quotemeta msgrcv scalar kill dbmclose undef lc ' +
    'ma syswrite tr send umask sysopen shmwrite vec qx utime local oct semctl localtime ' +
    'readpipe do return format read sprintf dbmopen pop getpgrp not getpwnam rewinddir qq' +
    'fileno qw endprotoent wait sethostent bless s|0 opendir continue each sleep endgrent ' +
    'shutdown dump chomp connect getsockname die socketpair close flock exists index shmget' +
    'sub for endpwent redo lstat msgctl setpgrp abs exit select print ref gethostbyaddr ' +
    'unshift fcntl syscall goto getnetbyaddr join gmtime symlink semget splice x|0 ' +
    'getpeername recv log setsockopt cos last reverse gethostbyname getgrnam study formline ' +
    'endhostent times chop length gethostent getnetent pack getprotoent getservbyname rand ' +
    'mkdir pos chmod y|0 substr endnetent printf next open msgsnd readdir use unlink ' +
    'getsockopt getpriority rindex wantarray hex system getservbyport endservent int chr ' +
    'untie rmdir prototype tell listen fork shmread ucfirst setprotoent else sysseek link ' +
    'getgrgid shmctl waitpid unpack getnetbyname reset chdir grep split require caller ' +
    'lcfirst until warn while values shift telldir getpwuid my getprotobynumber delete and ' +
    'sort uc defined srand accept package seekdir getprotobyname semop our rename seek if q|0 ' +
    'chroot sysread setpwent no crypt getc chown sqrt write setnetent setpriority foreach ' +
    'tie sin msgget map stat getlogin unless elsif truncate exec keys glob tied closedir' +
    'ioctl socket readlink eval xor readline binmode setservent eof ord bind alarm pipe ' +
    'atan2 getgrent exp time push setgrent gt lt or ne m|0 break given say state when';
  var SUBST = {
    className: 'subst',
    begin: '[$@]\\{', end: '\\}',
    keywords: PERL_KEYWORDS
  };
  var METHOD = {
    begin: '->{', end: '}'
    // contains defined later
  };
  var VAR = {
    className: 'variable',
    variants: [
      {begin: /\$\d/},
      {begin: /[\$\%\@\*](\^\w\b|#\w+(\:\:\w+)*|{\w+}|\w+(\:\:\w*)*)/},
      {begin: /[\$\%\@\*][^\s\w{]/, relevance: 0}
    ]
  };
  var COMMENT = {
    className: 'comment',
    begin: '^(__END__|__DATA__)', end: '\\n$',
    relevance: 5
  };
  var STRING_CONTAINS = [hljs.BACKSLASH_ESCAPE, SUBST, VAR];
  var PERL_DEFAULT_CONTAINS = [
    VAR,
    hljs.HASH_COMMENT_MODE,
    COMMENT,
    {
      className: 'comment',
      begin: '^\\=\\w', end: '\\=cut', endsWithParent: true
    },
    METHOD,
    {
      className: 'string',
      contains: STRING_CONTAINS,
      variants: [
        {
          begin: 'q[qwxr]?\\s*\\(', end: '\\)',
          relevance: 5
        },
        {
          begin: 'q[qwxr]?\\s*\\[', end: '\\]',
          relevance: 5
        },
        {
          begin: 'q[qwxr]?\\s*\\{', end: '\\}',
          relevance: 5
        },
        {
          begin: 'q[qwxr]?\\s*\\|', end: '\\|',
          relevance: 5
        },
        {
          begin: 'q[qwxr]?\\s*\\<', end: '\\>',
          relevance: 5
        },
        {
          begin: 'qw\\s+q', end: 'q',
          relevance: 5
        },
        {
          begin: '\'', end: '\'',
          contains: [hljs.BACKSLASH_ESCAPE]
        },
        {
          begin: '"', end: '"'
        },
        {
          begin: '`', end: '`',
          contains: [hljs.BACKSLASH_ESCAPE]
        },
        {
          begin: '{\\w+}',
          contains: [],
          relevance: 0
        },
        {
          begin: '\-?\\w+\\s*\\=\\>',
          contains: [],
          relevance: 0
        }
      ]
    },
    {
      className: 'number',
      begin: '(\\b0[0-7_]+)|(\\b0x[0-9a-fA-F_]+)|(\\b[1-9][0-9_]*(\\.[0-9_]+)?)|[0_]\\b',
      relevance: 0
    },
    { // regexp container
      begin: '(\\/\\/|' + hljs.RE_STARTERS_RE + '|\\b(split|return|print|reverse|grep)\\b)\\s*',
      keywords: 'split return print reverse grep',
      relevance: 0,
      contains: [
        hljs.HASH_COMMENT_MODE,
        COMMENT,
        {
          className: 'regexp',
          begin: '(s|tr|y)/(\\\\.|[^/])*/(\\\\.|[^/])*/[a-z]*',
          relevance: 10
        },
        {
          className: 'regexp',
          begin: '(m|qr)?/', end: '/[a-z]*',
          contains: [hljs.BACKSLASH_ESCAPE],
          relevance: 0 // allows empty "//" which is a common comment delimiter in other languages
        }
      ]
    },
    {
      className: 'sub',
      beginKeywords: 'sub', end: '(\\s*\\(.*?\\))?[;{]',
      relevance: 5
    },
    {
      className: 'operator',
      begin: '-\\w\\b',
      relevance: 0
    }
  ];
  SUBST.contains = PERL_DEFAULT_CONTAINS;
  METHOD.contains = PERL_DEFAULT_CONTAINS;

  return {
    aliases: ['pl'],
    keywords: PERL_KEYWORDS,
    contains: PERL_DEFAULT_CONTAINS
  };
};
},{}],64:[function(require,module,exports){
module.exports = function(hljs) {
  var VARIABLE = {
    className: 'variable', begin: '\\$+[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*'
  };
  var PREPROCESSOR = {
    className: 'preprocessor', begin: /<\?(php)?|\?>/
  };
  var STRING = {
    className: 'string',
    contains: [hljs.BACKSLASH_ESCAPE, PREPROCESSOR],
    variants: [
      {
        begin: 'b"', end: '"'
      },
      {
        begin: 'b\'', end: '\''
      },
      hljs.inherit(hljs.APOS_STRING_MODE, {illegal: null}),
      hljs.inherit(hljs.QUOTE_STRING_MODE, {illegal: null})
    ]
  };
  var NUMBER = {variants: [hljs.BINARY_NUMBER_MODE, hljs.C_NUMBER_MODE]};
  return {
    aliases: ['php3', 'php4', 'php5', 'php6'],
    case_insensitive: true,
    keywords:
      'and include_once list abstract global private echo interface as static endswitch ' +
      'array null if endwhile or const for endforeach self var while isset public ' +
      'protected exit foreach throw elseif include __FILE__ empty require_once do xor ' +
      'return parent clone use __CLASS__ __LINE__ else break print eval new ' +
      'catch __METHOD__ case exception default die require __FUNCTION__ ' +
      'enddeclare final try switch continue endfor endif declare unset true false ' +
      'trait goto instanceof insteadof __DIR__ __NAMESPACE__ ' +
      'yield finally',
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.HASH_COMMENT_MODE,
      {
        className: 'comment',
        begin: '/\\*', end: '\\*/',
        contains: [
          {
            className: 'phpdoc',
            begin: '\\s@[A-Za-z]+'
          },
          PREPROCESSOR
        ]
      },
      {
          className: 'comment',
          begin: '__halt_compiler.+?;', endsWithParent: true,
          keywords: '__halt_compiler', lexemes: hljs.UNDERSCORE_IDENT_RE
      },
      {
        className: 'string',
        begin: '<<<[\'"]?\\w+[\'"]?$', end: '^\\w+;',
        contains: [hljs.BACKSLASH_ESCAPE]
      },
      PREPROCESSOR,
      VARIABLE,
      {
        className: 'function',
        beginKeywords: 'function', end: /[;{]/, excludeEnd: true,
        illegal: '\\$|\\[|%',
        contains: [
          hljs.UNDERSCORE_TITLE_MODE,
          {
            className: 'params',
            begin: '\\(', end: '\\)',
            contains: [
              'self',
              VARIABLE,
              hljs.C_BLOCK_COMMENT_MODE,
              STRING,
              NUMBER
            ]
          }
        ]
      },
      {
        className: 'class',
        beginKeywords: 'class interface', end: '{', excludeEnd: true,
        illegal: /[:\(\$"]/,
        contains: [
          {
            beginKeywords: 'extends implements',
            relevance: 10
          },
          hljs.UNDERSCORE_TITLE_MODE
        ]
      },
      {
        beginKeywords: 'namespace', end: ';',
        illegal: /[\.']/,
        contains: [hljs.UNDERSCORE_TITLE_MODE]
      },
      {
        beginKeywords: 'use', end: ';',
        contains: [hljs.UNDERSCORE_TITLE_MODE]
      },
      {
        begin: '=>' // No markup, just a relevance booster
      },
      STRING,
      NUMBER
    ]
  };
};
},{}],65:[function(require,module,exports){
module.exports = function(hljs) {
  var PROMPT = {
    className: 'prompt',  begin: /^(>>>|\.\.\.) /
  };
  var STRING = {
    className: 'string',
    contains: [hljs.BACKSLASH_ESCAPE],
    variants: [
      {
        begin: /(u|b)?r?'''/, end: /'''/,
        contains: [PROMPT],
        relevance: 10
      },
      {
        begin: /(u|b)?r?"""/, end: /"""/,
        contains: [PROMPT],
        relevance: 10
      },
      {
        begin: /(u|r|ur)'/, end: /'/,
        relevance: 10
      },
      {
        begin: /(u|r|ur)"/, end: /"/,
        relevance: 10
      },
      {
        begin: /(b|br)'/, end: /'/
      },
      {
        begin: /(b|br)"/, end: /"/
      },
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE
    ]
  };
  var NUMBER = {
    className: 'number', relevance: 0,
    variants: [
      {begin: hljs.BINARY_NUMBER_RE + '[lLjJ]?'},
      {begin: '\\b(0o[0-7]+)[lLjJ]?'},
      {begin: hljs.C_NUMBER_RE + '[lLjJ]?'}
    ]
  };
  var PARAMS = {
    className: 'params',
    begin: /\(/, end: /\)/,
    contains: ['self', PROMPT, NUMBER, STRING]
  };
  var FUNC_CLASS_PROTO = {
    end: /:/,
    illegal: /[${=;\n]/,
    contains: [hljs.UNDERSCORE_TITLE_MODE, PARAMS]
  };

  return {
    aliases: ['py', 'gyp'],
    keywords: {
      keyword:
        'and elif is global as in if from raise for except finally print import pass return ' +
        'exec else break not with class assert yield try while continue del or def lambda ' +
        'nonlocal|10 None True False',
      built_in:
        'Ellipsis NotImplemented'
    },
    illegal: /(<\/|->|\?)/,
    contains: [
      PROMPT,
      NUMBER,
      STRING,
      hljs.HASH_COMMENT_MODE,
      hljs.inherit(FUNC_CLASS_PROTO, {className: 'function', beginKeywords: 'def', relevance: 10}),
      hljs.inherit(FUNC_CLASS_PROTO, {className: 'class', beginKeywords: 'class'}),
      {
        className: 'decorator',
        begin: /@/, end: /$/
      },
      {
        begin: /\b(print|exec)\(/ // don’t highlight keywords-turned-functions in Python 3
      }
    ]
  };
};
},{}],66:[function(require,module,exports){
module.exports = function(hljs) {
  var IDENT_RE = '([a-zA-Z]|\\.[a-zA-Z.])[a-zA-Z0-9._]*';

  return {
    contains: [
      hljs.HASH_COMMENT_MODE,
      {
        begin: IDENT_RE,
        lexemes: IDENT_RE,
        keywords: {
          keyword:
            'function if in break next repeat else for return switch while try tryCatch|10 ' +
            'stop warning require library attach detach source setMethod setGeneric ' +
            'setGroupGeneric setClass ...|10',
          literal:
            'NULL NA TRUE FALSE T F Inf NaN NA_integer_|10 NA_real_|10 NA_character_|10 ' +
            'NA_complex_|10'
        },
        relevance: 0
      },
      {
        // hex value
        className: 'number',
        begin: "0[xX][0-9a-fA-F]+[Li]?\\b",
        relevance: 0
      },
      {
        // explicit integer
        className: 'number',
        begin: "\\d+(?:[eE][+\\-]?\\d*)?L\\b",
        relevance: 0
      },
      {
        // number with trailing decimal
        className: 'number',
        begin: "\\d+\\.(?!\\d)(?:i\\b)?",
        relevance: 0
      },
      {
        // number
        className: 'number',
        begin: "\\d+(?:\\.\\d*)?(?:[eE][+\\-]?\\d*)?i?\\b",
        relevance: 0
      },
      {
        // number with leading decimal
        className: 'number',
        begin: "\\.\\d+(?:[eE][+\\-]?\\d*)?i?\\b",
        relevance: 0
      },

      {
        // escaped identifier
        begin: '`',
        end: '`',
        relevance: 0
      },

      {
        className: 'string',
        contains: [hljs.BACKSLASH_ESCAPE],
        variants: [
          {begin: '"', end: '"'},
          {begin: "'", end: "'"}
        ]
      }
    ]
  };
};
},{}],67:[function(require,module,exports){
module.exports = function(hljs) {
  var RUBY_METHOD_RE = '[a-zA-Z_]\\w*[!?=]?|[-+~]\\@|<<|>>|=~|===?|<=>|[<>]=?|\\*\\*|[-/+%^&*~`|]|\\[\\]=?';
  var RUBY_KEYWORDS =
    'and false then defined module in return redo if BEGIN retry end for true self when ' +
    'next until do begin unless END rescue nil else break undef not super class case ' +
    'require yield alias while ensure elsif or include attr_reader attr_writer attr_accessor';
  var YARDOCTAG = {
    className: 'yardoctag',
    begin: '@[A-Za-z]+'
  };
  var COMMENT = {
    className: 'comment',
    variants: [
      {
        begin: '#', end: '$',
        contains: [YARDOCTAG]
      },
      {
        begin: '^\\=begin', end: '^\\=end',
        contains: [YARDOCTAG],
        relevance: 10
      },
      {
        begin: '^__END__', end: '\\n$'
      }
    ]
  };
  var SUBST = {
    className: 'subst',
    begin: '#\\{', end: '}',
    keywords: RUBY_KEYWORDS
  };
  var STRING = {
    className: 'string',
    contains: [hljs.BACKSLASH_ESCAPE, SUBST],
    variants: [
      {begin: /'/, end: /'/},
      {begin: /"/, end: /"/},
      {begin: '%[qw]?\\(', end: '\\)'},
      {begin: '%[qw]?\\[', end: '\\]'},
      {begin: '%[qw]?{', end: '}'},
      {
        begin: '%[qw]?<', end: '>',
        relevance: 10
      },
      {
        begin: '%[qw]?/', end: '/',
        relevance: 10
      },
      {
        begin: '%[qw]?%', end: '%',
        relevance: 10
      },
      {
        begin: '%[qw]?-', end: '-',
        relevance: 10
      },
      {
        begin: '%[qw]?\\|', end: '\\|',
        relevance: 10
      },
      {
        // \B in the beginning suppresses recognition of ?-sequences where ?
        // is the last character of a preceding identifier, as in: `func?4`
        begin: /\B\?(\\\d{1,3}|\\x[A-Fa-f0-9]{1,2}|\\u[A-Fa-f0-9]{4}|\\?\S)\b/
      }
    ]
  };
  var PARAMS = {
    className: 'params',
    begin: '\\(', end: '\\)',
    keywords: RUBY_KEYWORDS
  };

  var RUBY_DEFAULT_CONTAINS = [
    STRING,
    COMMENT,
    {
      className: 'class',
      beginKeywords: 'class module', end: '$|;',
      illegal: /=/,
      contains: [
        hljs.inherit(hljs.TITLE_MODE, {begin: '[A-Za-z_]\\w*(::\\w+)*(\\?|\\!)?'}),
        {
          className: 'inheritance',
          begin: '<\\s*',
          contains: [{
            className: 'parent',
            begin: '(' + hljs.IDENT_RE + '::)?' + hljs.IDENT_RE
          }]
        },
        COMMENT
      ]
    },
    {
      className: 'function',
      beginKeywords: 'def', end: ' |$|;',
      relevance: 0,
      contains: [
        hljs.inherit(hljs.TITLE_MODE, {begin: RUBY_METHOD_RE}),
        PARAMS,
        COMMENT
      ]
    },
    {
      className: 'constant',
      begin: '(::)?(\\b[A-Z]\\w*(::)?)+',
      relevance: 0
    },
    {
      className: 'symbol',
      begin: ':',
      contains: [STRING, {begin: RUBY_METHOD_RE}],
      relevance: 0
    },
    {
      className: 'symbol',
      begin: hljs.UNDERSCORE_IDENT_RE + '(\\!|\\?)?:',
      relevance: 0
    },
    {
      className: 'number',
      begin: '(\\b0[0-7_]+)|(\\b0x[0-9a-fA-F_]+)|(\\b[1-9][0-9_]*(\\.[0-9_]+)?)|[0_]\\b',
      relevance: 0
    },
    {
      className: 'variable',
      begin: '(\\$\\W)|((\\$|\\@\\@?)(\\w+))'
    },
    { // regexp container
      begin: '(' + hljs.RE_STARTERS_RE + ')\\s*',
      contains: [
        COMMENT,
        {
          className: 'regexp',
          contains: [hljs.BACKSLASH_ESCAPE, SUBST],
          illegal: /\n/,
          variants: [
            {begin: '/', end: '/[a-z]*'},
            {begin: '%r{', end: '}[a-z]*'},
            {begin: '%r\\(', end: '\\)[a-z]*'},
            {begin: '%r!', end: '![a-z]*'},
            {begin: '%r\\[', end: '\\][a-z]*'}
          ]
        }
      ],
      relevance: 0
    }
  ];
  SUBST.contains = RUBY_DEFAULT_CONTAINS;
  PARAMS.contains = RUBY_DEFAULT_CONTAINS;

  return {
    aliases: ['rb', 'gemspec', 'podspec', 'thor'],
    keywords: RUBY_KEYWORDS,
    contains: RUBY_DEFAULT_CONTAINS
  };
};
},{}],68:[function(require,module,exports){
module.exports = function(hljs) {
  return {
    aliases: ['rs'],
    keywords:
      'assert bool break char check claim comm const cont copy dir do drop ' +
      'else enum extern export f32 f64 fail false float fn for i16 i32 i64 i8 ' +
      'if impl int let log loop match mod move mut priv pub pure ref return ' +
      'self static str struct task true trait type u16 u32 u64 u8 uint unsafe ' +
      'use vec while',
    illegal: '</',
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.inherit(hljs.QUOTE_STRING_MODE, {illegal: null}),
      hljs.APOS_STRING_MODE,
      {
        className: 'number',
        begin: '\\b(0[xb][A-Za-z0-9_]+|[0-9_]+(\\.[0-9_]+)?([uif](8|16|32|64)?)?)',
        relevance: 0
      },
      {
        className: 'function',
        beginKeywords: 'fn', end: '(\\(|<)', excludeEnd: true,
        contains: [hljs.UNDERSCORE_TITLE_MODE]
      },
      {
        className: 'preprocessor',
        begin: '#\\[', end: '\\]'
      },
      {
        beginKeywords: 'type', end: '(=|<)',
        contains: [hljs.UNDERSCORE_TITLE_MODE],
        illegal: '\\S'
      },
      {
        beginKeywords: 'trait enum', end: '({|<)',
        contains: [hljs.UNDERSCORE_TITLE_MODE],
        illegal: '\\S'
      },
      {
        begin: hljs.IDENT_RE + '::'
      },
      {
        begin: '->'
      }
    ]
  };
};
},{}],69:[function(require,module,exports){
module.exports = function(hljs) {
  var ANNOTATION = {
    className: 'annotation', begin: '@[A-Za-z]+'
  };
  var STRING = {
    className: 'string',
    begin: 'u?r?"""', end: '"""',
    relevance: 10
  };
  var SYMBOL = {
    className: 'symbol',
    begin: '\'\\w[\\w\\d_]*(?!\')'
  };
  return {
    keywords:
      'type yield lazy override def with val var false true sealed abstract private trait ' +
      'object null if for while throw finally protected extends import final return else ' +
      'break new catch super class case package default try this match continue throws',
    contains: [
      {
        className: 'javadoc',
        begin: '/\\*\\*', end: '\\*/',
        contains: [{
          className: 'javadoctag',
          begin: '@[A-Za-z]+'
        }],
        relevance: 10
      },
      hljs.C_LINE_COMMENT_MODE, hljs.C_BLOCK_COMMENT_MODE,
      STRING, hljs.QUOTE_STRING_MODE,
      SYMBOL,
      {
        className: 'class',
        begin: '((case )?class |object |trait )', // beginKeywords won't work because a single "case" shouldn't start this mode
        end: '({|$)', excludeEnd: true,
        illegal: ':',
        keywords: 'case class trait object',
        contains: [
          {
            beginKeywords: 'extends with',
            relevance: 10
          },
          hljs.UNDERSCORE_TITLE_MODE,
          {
            className: 'params',
            begin: '\\(', end: '\\)',
            contains: [
              hljs.QUOTE_STRING_MODE, STRING,
              ANNOTATION
            ]
          }
        ]
      },
      hljs.C_NUMBER_MODE,
      ANNOTATION
    ]
  };
};
},{}],70:[function(require,module,exports){
module.exports = function(hljs) {
  var IDENT_RE = '[a-zA-Z-][a-zA-Z0-9_-]*';
  var VARIABLE = {
    className: 'variable',
    begin: '(\\$' + IDENT_RE + ')\\b'
  };
  var FUNCTION = {
    className: 'function',
    begin: IDENT_RE + '\\(', 
    returnBegin: true,
    excludeEnd: true,
    end: '\\('
  };
  var HEXCOLOR = {
    className: 'hexcolor', begin: '#[0-9A-Fa-f]+'
  };
  var DEF_INTERNALS = {
    className: 'attribute',
    begin: '[A-Z\\_\\.\\-]+', end: ':',
    excludeEnd: true,
    illegal: '[^\\s]',
    starts: {
      className: 'value',
      endsWithParent: true, excludeEnd: true,
      contains: [
        FUNCTION,
        HEXCOLOR,
        hljs.CSS_NUMBER_MODE,
        hljs.QUOTE_STRING_MODE,
        hljs.APOS_STRING_MODE,
        hljs.C_BLOCK_COMMENT_MODE,
        {
          className: 'important', begin: '!important'
        }
      ]
    }
  };
  return {
    case_insensitive: true,
    illegal: '[=/|\']',
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      FUNCTION,
      {
        className: 'id', begin: '\\#[A-Za-z0-9_-]+',
        relevance: 0
      },
      {
        className: 'class', begin: '\\.[A-Za-z0-9_-]+',
        relevance: 0
      },
      {
        className: 'attr_selector',
        begin: '\\[', end: '\\]',
        illegal: '$'
      },
      {
        className: 'tag', // begin: IDENT_RE, end: '[,|\\s]'
        begin: '\\b(a|abbr|acronym|address|area|article|aside|audio|b|base|big|blockquote|body|br|button|canvas|caption|cite|code|col|colgroup|command|datalist|dd|del|details|dfn|div|dl|dt|em|embed|fieldset|figcaption|figure|footer|form|frame|frameset|(h[1-6])|head|header|hgroup|hr|html|i|iframe|img|input|ins|kbd|keygen|label|legend|li|link|map|mark|meta|meter|nav|noframes|noscript|object|ol|optgroup|option|output|p|param|pre|progress|q|rp|rt|ruby|samp|script|section|select|small|span|strike|strong|style|sub|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|tt|ul|var|video)\\b',
        relevance: 0
      },
      {
        className: 'pseudo',
        begin: ':(visited|valid|root|right|required|read-write|read-only|out-range|optional|only-of-type|only-child|nth-of-type|nth-last-of-type|nth-last-child|nth-child|not|link|left|last-of-type|last-child|lang|invalid|indeterminate|in-range|hover|focus|first-of-type|first-line|first-letter|first-child|first|enabled|empty|disabled|default|checked|before|after|active)'
      },
      {
        className: 'pseudo',
        begin: '::(after|before|choices|first-letter|first-line|repeat-index|repeat-item|selection|value)'
      },
      VARIABLE,
      {
        className: 'attribute',
        begin: '\\b(z-index|word-wrap|word-spacing|word-break|width|widows|white-space|visibility|vertical-align|unicode-bidi|transition-timing-function|transition-property|transition-duration|transition-delay|transition|transform-style|transform-origin|transform|top|text-underline-position|text-transform|text-shadow|text-rendering|text-overflow|text-indent|text-decoration-style|text-decoration-line|text-decoration-color|text-decoration|text-align-last|text-align|tab-size|table-layout|right|resize|quotes|position|pointer-events|perspective-origin|perspective|page-break-inside|page-break-before|page-break-after|padding-top|padding-right|padding-left|padding-bottom|padding|overflow-y|overflow-x|overflow-wrap|overflow|outline-width|outline-style|outline-offset|outline-color|outline|orphans|order|opacity|object-position|object-fit|normal|none|nav-up|nav-right|nav-left|nav-index|nav-down|min-width|min-height|max-width|max-height|mask|marks|margin-top|margin-right|margin-left|margin-bottom|margin|list-style-type|list-style-position|list-style-image|list-style|line-height|letter-spacing|left|justify-content|initial|inherit|ime-mode|image-orientation|image-resolution|image-rendering|icon|hyphens|height|font-weight|font-variant-ligatures|font-variant|font-style|font-stretch|font-size-adjust|font-size|font-language-override|font-kerning|font-feature-settings|font-family|font|float|flex-wrap|flex-shrink|flex-grow|flex-flow|flex-direction|flex-basis|flex|filter|empty-cells|display|direction|cursor|counter-reset|counter-increment|content|column-width|column-span|column-rule-width|column-rule-style|column-rule-color|column-rule|column-gap|column-fill|column-count|columns|color|clip-path|clip|clear|caption-side|break-inside|break-before|break-after|box-sizing|box-shadow|box-decoration-break|bottom|border-width|border-top-width|border-top-style|border-top-right-radius|border-top-left-radius|border-top-color|border-top|border-style|border-spacing|border-right-width|border-right-style|border-right-color|border-right|border-radius|border-left-width|border-left-style|border-left-color|border-left|border-image-width|border-image-source|border-image-slice|border-image-repeat|border-image-outset|border-image|border-color|border-collapse|border-bottom-width|border-bottom-style|border-bottom-right-radius|border-bottom-left-radius|border-bottom-color|border-bottom|border|background-size|background-repeat|background-position|background-origin|background-image|background-color|background-clip|background-attachment|background|backface-visibility|auto|animation-timing-function|animation-play-state|animation-name|animation-iteration-count|animation-fill-mode|animation-duration|animation-direction|animation-delay|animation|align-self|align-items|align-content)\\b',
        illegal: '[^\\s]'
      },
      {
        className: 'value',
        begin: '\\b(whitespace|wait|w-resize|visible|vertical-text|vertical-ideographic|uppercase|upper-roman|upper-alpha|underline|transparent|top|thin|thick|text|text-top|text-bottom|tb-rl|table-header-group|table-footer-group|sw-resize|super|strict|static|square|solid|small-caps|separate|se-resize|scroll|s-resize|rtl|row-resize|ridge|right|repeat|repeat-y|repeat-x|relative|progress|pointer|overline|outside|outset|oblique|nowrap|not-allowed|normal|none|nw-resize|no-repeat|no-drop|newspaper|ne-resize|n-resize|move|middle|medium|ltr|lr-tb|lowercase|lower-roman|lower-alpha|loose|list-item|line|line-through|line-edge|lighter|left|keep-all|justify|italic|inter-word|inter-ideograph|inside|inset|inline|inline-block|inherit|inactive|ideograph-space|ideograph-parenthesis|ideograph-numeric|ideograph-alpha|horizontal|hidden|help|hand|groove|fixed|ellipsis|e-resize|double|dotted|distribute|distribute-space|distribute-letter|distribute-all-lines|disc|disabled|default|decimal|dashed|crosshair|collapse|col-resize|circle|char|center|capitalize|break-word|break-all|bottom|both|bolder|bold|block|bidi-override|below|baseline|auto|always|all-scroll|absolute|table|table-cell)\\b'
      },
      {
        className: 'value',
        begin: ':', end: ';',
        contains: [
          FUNCTION,
          VARIABLE,
          HEXCOLOR,
          hljs.CSS_NUMBER_MODE,
          hljs.QUOTE_STRING_MODE,
          hljs.APOS_STRING_MODE,
          {
            className: 'important', begin: '!important'
          }
        ]
      },
      {
        className: 'at_rule',
        begin: '@', end: '[{;]',
        keywords: 'mixin include extend for if else each while charset import debug media page content font-face namespace warn',
        contains: [
          FUNCTION,
          VARIABLE,
          hljs.QUOTE_STRING_MODE,
          hljs.APOS_STRING_MODE,
          HEXCOLOR,
          hljs.CSS_NUMBER_MODE,
          {
            className: 'preprocessor',
            begin: '\\s[A-Za-z0-9_.-]+',
            relevance: 0
          }
        ]
      }
    ]
  };
};
},{}],71:[function(require,module,exports){
module.exports = function(hljs) {
  var COMMENT_MODE = {
    className: 'comment',
    begin: '--', end: '$'
  };
  return {
    case_insensitive: true,
    illegal: /[<>]/,
    contains: [
      {
        className: 'operator',
        beginKeywords:
          'begin end start commit rollback savepoint lock alter create drop rename call '+
          'delete do handler insert load replace select truncate update set show pragma grant '+
          'merge describe use explain help declare prepare execute deallocate savepoint release '+
          'unlock purge reset change stop analyze cache flush optimize repair kill '+
          'install uninstall checksum restore check backup',
        end: /;/, endsWithParent: true,
        keywords: {
          keyword:
            'abs absolute acos action add adddate addtime aes_decrypt aes_encrypt after aggregate all allocate alter ' +
            'analyze and any are as asc ascii asin assertion at atan atan2 atn2 authorization authors avg backup ' +
            'before begin benchmark between bin binlog bit_and bit_count bit_length bit_or bit_xor both by ' +
            'cache call cascade cascaded case cast catalog ceil ceiling chain change changed char_length ' +
            'character_length charindex charset check checksum checksum_agg choose close coalesce ' +
            'coercibility collate collation collationproperty column columns columns_updated commit compress concat ' +
            'concat_ws concurrent connect connection connection_id consistent constraint constraints continue ' +
            'contributors conv convert convert_tz corresponding cos cot count count_big crc32 create cross cume_dist ' +
            'curdate current current_date current_time current_timestamp current_user cursor curtime data database ' +
            'databases datalength date_add date_format date_sub dateadd datediff datefromparts datename ' +
            'datepart datetime2fromparts datetimeoffsetfromparts day dayname dayofmonth dayofweek dayofyear ' +
            'deallocate declare decode default deferrable deferred degrees delayed delete des_decrypt ' +
            'des_encrypt des_key_file desc describe descriptor diagnostics difference disconnect distinct ' +
            'distinctrow div do domain double drop dumpfile each else elt enclosed encode encrypt end end-exec ' +
            'engine engines eomonth errors escape escaped event eventdata events except exception exec execute ' +
            'exists exp explain export_set extended external extract fast fetch field fields find_in_set ' +
            'first first_value floor flush for force foreign format found found_rows from from_base64 ' +
            'from_days from_unixtime full function get get_format get_lock getdate getutcdate global go goto grant ' +
            'grants greatest group group_concat grouping grouping_id gtid_subset gtid_subtract handler having help ' +
            'hex high_priority hosts hour ident_current ident_incr ident_seed identified identity if ifnull ignore ' +
            'iif ilike immediate in index indicator inet6_aton inet6_ntoa inet_aton inet_ntoa infile initially inner ' +
            'innodb input insert install instr intersect into is is_free_lock is_ipv4 ' +
            'is_ipv4_compat is_ipv4_mapped is_not is_not_null is_used_lock isdate isnull isolation join key kill ' +
            'language last last_day last_insert_id last_value lcase lead leading least leaves left len lenght level ' +
            'like limit lines ln load load_file local localtime localtimestamp locate lock log log10 log2 logfile ' +
            'logs low_priority lower lpad ltrim make_set makedate maketime master master_pos_wait match matched max ' +
            'md5 medium merge microsecond mid min minute mod mode module month monthname mutex name_const names ' +
            'national natural nchar next no no_write_to_binlog not now nullif nvarchar oct ' +
            'octet_length of old_password on only open optimize option optionally or ord order outer outfile output ' +
            'pad parse partial partition password patindex percent_rank percentile_cont percentile_disc period_add ' +
            'period_diff pi plugin position pow power pragma precision prepare preserve primary prior privileges ' +
            'procedure procedure_analyze processlist profile profiles public publishingservername purge quarter ' +
            'query quick quote quotename radians rand read references regexp relative relaylog release ' +
            'release_lock rename repair repeat replace replicate reset restore restrict return returns reverse ' +
            'revoke right rlike rollback rollup round row row_count rows rpad rtrim savepoint schema scroll ' +
            'sec_to_time second section select serializable server session session_user set sha sha1 sha2 share ' +
            'show sign sin size slave sleep smalldatetimefromparts snapshot some soname soundex ' +
            'sounds_like space sql sql_big_result sql_buffer_result sql_cache sql_calc_found_rows sql_no_cache ' +
            'sql_small_result sql_variant_property sqlstate sqrt square start starting status std ' +
            'stddev stddev_pop stddev_samp stdev stdevp stop str str_to_date straight_join strcmp string stuff ' +
            'subdate substr substring subtime subtring_index sum switchoffset sysdate sysdatetime sysdatetimeoffset ' +
            'system_user sysutcdatetime table tables tablespace tan temporary terminated tertiary_weights then time ' +
            'time_format time_to_sec timediff timefromparts timestamp timestampadd timestampdiff timezone_hour ' +
            'timezone_minute to to_base64 to_days to_seconds todatetimeoffset trailing transaction translation ' +
            'trigger trigger_nestlevel triggers trim truncate try_cast try_convert try_parse ucase uncompress ' +
            'uncompressed_length unhex unicode uninstall union unique unix_timestamp unknown unlock update upgrade ' +
            'upped upper usage use user user_resources using utc_date utc_time utc_timestamp uuid uuid_short ' +
            'validate_password_strength value values var var_pop var_samp variables variance varp ' +
            'version view warnings week weekday weekofyear weight_string when whenever where with work write xml ' +
            'xor year yearweek zon',
          literal:
            'true false null',
          built_in:
            'array bigint binary bit blob boolean char character date dec decimal float int integer interval number ' +
            'numeric real serial smallint varchar varying int8 serial8 text'
        },
        contains: [
          {
            className: 'string',
            begin: '\'', end: '\'',
            contains: [hljs.BACKSLASH_ESCAPE, {begin: '\'\''}]
          },
          {
            className: 'string',
            begin: '"', end: '"',
            contains: [hljs.BACKSLASH_ESCAPE, {begin: '""'}]
          },
          {
            className: 'string',
            begin: '`', end: '`',
            contains: [hljs.BACKSLASH_ESCAPE]
          },
          hljs.C_NUMBER_MODE,
          hljs.C_BLOCK_COMMENT_MODE,
          COMMENT_MODE
        ]
      },
      hljs.C_BLOCK_COMMENT_MODE,
      COMMENT_MODE
    ]
  };
};
},{}],72:[function(require,module,exports){
module.exports = function(hljs) {
  var XML_IDENT_RE = '[A-Za-z0-9\\._:-]+';
  var PHP = {
    begin: /<\?(php)?(?!\w)/, end: /\?>/,
    subLanguage: 'php', subLanguageMode: 'continuous'
  };
  var TAG_INTERNALS = {
    endsWithParent: true,
    illegal: /</,
    relevance: 0,
    contains: [
      PHP,
      {
        className: 'attribute',
        begin: XML_IDENT_RE,
        relevance: 0
      },
      {
        begin: '=',
        relevance: 0,
        contains: [
          {
            className: 'value',
            variants: [
              {begin: /"/, end: /"/},
              {begin: /'/, end: /'/},
              {begin: /[^\s\/>]+/}
            ]
          }
        ]
      }
    ]
  };
  return {
    aliases: ['html', 'xhtml', 'rss', 'atom', 'xsl', 'plist'],
    case_insensitive: true,
    contains: [
      {
        className: 'doctype',
        begin: '<!DOCTYPE', end: '>',
        relevance: 10,
        contains: [{begin: '\\[', end: '\\]'}]
      },
      {
        className: 'comment',
        begin: '<!--', end: '-->',
        relevance: 10
      },
      {
        className: 'cdata',
        begin: '<\\!\\[CDATA\\[', end: '\\]\\]>',
        relevance: 10
      },
      {
        className: 'tag',
        /*
        The lookahead pattern (?=...) ensures that 'begin' only matches
        '<style' as a single word, followed by a whitespace or an
        ending braket. The '$' is needed for the lexeme to be recognized
        by hljs.subMode() that tests lexemes outside the stream.
        */
        begin: '<style(?=\\s|>|$)', end: '>',
        keywords: {title: 'style'},
        contains: [TAG_INTERNALS],
        starts: {
          end: '</style>', returnEnd: true,
          subLanguage: 'css'
        }
      },
      {
        className: 'tag',
        // See the comment in the <style tag about the lookahead pattern
        begin: '<script(?=\\s|>|$)', end: '>',
        keywords: {title: 'script'},
        contains: [TAG_INTERNALS],
        starts: {
          end: '</script>', returnEnd: true,
          subLanguage: 'javascript'
        }
      },
      {
        begin: '<%', end: '%>',
        subLanguage: 'vbscript'
      },
      PHP,
      {
        className: 'pi',
        begin: /<\?\w+/, end: /\?>/,
        relevance: 10
      },
      {
        className: 'tag',
        begin: '</?', end: '/?>',
        contains: [
          {
            className: 'title', begin: '[^ /><]+', relevance: 0
          },
          TAG_INTERNALS
        ]
      }
    ]
  };
};
},{}],73:[function(require,module,exports){
'use strict';

var fs = require('fs');
var insertCss = require('insert-css');
var hljs = require('./lib/hljs/index');
var css = "/*\n\nOriginal style from softwaremaniacs.org (c) Ivan Sagalaev <Maniac@SoftwareManiacs.Org>\n\n*/\n\n.hljs {\n  display: block;\n  padding: 0.5em;\n  background: #f0f0f0;\n}\n\n.hljs,\n.hljs-subst,\n.hljs-tag .hljs-title,\n.lisp .hljs-title,\n.clojure .hljs-built_in,\n.nginx .hljs-title {\n  color: black;\n}\n\n.hljs-string,\n.hljs-title,\n.hljs-constant,\n.hljs-parent,\n.hljs-tag .hljs-value,\n.hljs-rules .hljs-value,\n.hljs-preprocessor,\n.hljs-pragma,\n.haml .hljs-symbol,\n.ruby .hljs-symbol,\n.ruby .hljs-symbol .hljs-string,\n.hljs-template_tag,\n.django .hljs-variable,\n.smalltalk .hljs-class,\n.hljs-addition,\n.hljs-flow,\n.hljs-stream,\n.bash .hljs-variable,\n.apache .hljs-tag,\n.apache .hljs-cbracket,\n.tex .hljs-command,\n.tex .hljs-special,\n.erlang_repl .hljs-function_or_atom,\n.asciidoc .hljs-header,\n.markdown .hljs-header,\n.coffeescript .hljs-attribute {\n  color: #800;\n}\n\n.smartquote,\n.hljs-comment,\n.hljs-annotation,\n.hljs-template_comment,\n.diff .hljs-header,\n.hljs-chunk,\n.asciidoc .hljs-blockquote,\n.markdown .hljs-blockquote {\n  color: #888;\n}\n\n.hljs-number,\n.hljs-date,\n.hljs-regexp,\n.hljs-literal,\n.hljs-hexcolor,\n.smalltalk .hljs-symbol,\n.smalltalk .hljs-char,\n.go .hljs-constant,\n.hljs-change,\n.lasso .hljs-variable,\n.makefile .hljs-variable,\n.asciidoc .hljs-bullet,\n.markdown .hljs-bullet,\n.asciidoc .hljs-link_url,\n.markdown .hljs-link_url {\n  color: #080;\n}\n\n.hljs-label,\n.hljs-javadoc,\n.ruby .hljs-string,\n.hljs-decorator,\n.hljs-filter .hljs-argument,\n.hljs-localvars,\n.hljs-array,\n.hljs-attr_selector,\n.hljs-important,\n.hljs-pseudo,\n.hljs-pi,\n.haml .hljs-bullet,\n.hljs-doctype,\n.hljs-deletion,\n.hljs-envvar,\n.hljs-shebang,\n.apache .hljs-sqbracket,\n.nginx .hljs-built_in,\n.tex .hljs-formula,\n.erlang_repl .hljs-reserved,\n.hljs-prompt,\n.asciidoc .hljs-link_label,\n.markdown .hljs-link_label,\n.vhdl .hljs-attribute,\n.clojure .hljs-attribute,\n.asciidoc .hljs-attribute,\n.lasso .hljs-attribute,\n.coffeescript .hljs-property,\n.hljs-phony {\n  color: #88f;\n}\n\n.hljs-keyword,\n.hljs-id,\n.hljs-title,\n.hljs-built_in,\n.css .hljs-tag,\n.hljs-javadoctag,\n.hljs-phpdoc,\n.hljs-yardoctag,\n.smalltalk .hljs-class,\n.hljs-winutils,\n.bash .hljs-variable,\n.apache .hljs-tag,\n.go .hljs-typename,\n.tex .hljs-command,\n.asciidoc .hljs-strong,\n.markdown .hljs-strong,\n.hljs-request,\n.hljs-status {\n  font-weight: bold;\n}\n\n.asciidoc .hljs-emphasis,\n.markdown .hljs-emphasis {\n  font-style: italic;\n}\n\n.nginx .hljs-built_in {\n  font-weight: normal;\n}\n\n.coffeescript .javascript,\n.javascript .xml,\n.lasso .markup,\n.tex .hljs-formula,\n.xml .javascript,\n.xml .vbscript,\n.xml .css,\n.xml .hljs-cdata {\n  opacity: 0.5;\n}\n";
var codeBlockTemplate = "<pre><code ng-bind-html=\"highlightedCode\"></code></pre>";

insertCss(css);

/**
 * Syntax Highlight Element
 *
 * Assuming the directive is named "syntax":
 * 
 * Element Name Usage
 *     <syntax syntax-language="language">{{code}}</syntax>
 *     =>
 *     <pre syntax-language="language"><code>{{highlightedCode}}</code></pre>
 * Attribute Usage
 *     <e syntax syntax-language="language">{{code}}</syntax>
 *     =>
 *     <pre syntax syntax-language="language"><code>{{highlightedCode}}</code></pre>
 *
 * @param {string} syntaxLanguage Determines the language to highlight
 */
module.exports = ['$sce', function($sce){

    return {
        scope: {
            'syntaxLanguage': '@'
        }, 
        restrict: 'AE',
        template: codeBlockTemplate, 
        transclude: true, 
        replace: true, 
        link: function (scope, element, attributes, controller, transclude) {

            //transclude's clone is the child elements of the directive element, it will wrap any unwrapped text nodes with the span tag
            transclude(scope, function (clone) {

                //get the directive element's content as text, this will be the {{code}}
                var code = angular.element(clone).text();

                //convert the code string into a highlighted code string
                var highlightedCode = hljs.highlight(scope.syntaxLanguage, code, true);

                //bind to the scope as trusted HTML
                scope.highlightedCode = $sce.trustAsHtml(highlightedCode.value);

            });

        }
    };

}];
},{"./lib/hljs/index":39,"fs":1,"insert-css":85}],74:[function(require,module,exports){
'use strict';

/**
 * Filters
 */
angular.module('App.Filters', []);

module.exports = angular.module('App.Filters');
},{}],75:[function(require,module,exports){
'use strict';

/**
 * Modules
 */
angular.module('App.Modules', [
    require('./UserSystem').name
]);

module.exports = angular.module('App.Modules');
},{"./UserSystem":76}],76:[function(require,module,exports){
'use strict';

/**
 * User System Module
 */
angular.module('UserSystemMod', [])
    .provider('UserSystemServ', require('./UserSystemServ'))
    .run(require('./UserSystemRun'));

module.exports = angular.module('UserSystemMod');
},{"./UserSystemRun":77,"./UserSystemServ":78}],77:[function(require,module,exports){
'use strict';

/**
 * User System Run Block
 */
module.exports = ['UserSystemServ', function (UserSystemServ) {

    //attempt to get the user's session upon startup, there are three outcomes:
    //1. continues with the current session with a valid session cookie
    //2. triggers autologin with an autologin cookie and returns a valid session cookie
    //3. remains as an anonymous user
    //in cases where there is valid session cookie these events sessionProvided -> sessionLogin -> accountProvided will be broadcasted
    UserSystemServ.getSession();

}];
},{}],78:[function(require,module,exports){
'use strict';

/**
 * User System Service Provider.
 * Relies on Restangular.
 */
module.exports = function () {

    var userState = false,
        userData = {},
        accountsResource = 'accounts',
        sessionResource = 'sessions';

    this.setAccountsResource = function (resource) {
        accountsResource = resource;
    };

    this.setSessionResource = function (resource) {
        sessionResource = resource;
    };

    this.$get = [
        '$rootScope',
        '$location',
        'Restangular',
        function ($rootScope, $location, Restangular) {

            //these functions will return a promise
            var userApi = {
                getUserState: function () {
                    return userState;
                    // if (Object.keys(userData).length === 0) {
                    //     return false;
                    // } else {
                    //     return true;
                    // }
                },
                getUserData: function () {
                    return userData;
                },
                setUserData: function (data) {
                    userData = data;
                },
                mergeUserData: function (data) {
                    angular.extend(userData, data);
                },
                getAccount: function (id) {
                    return Restangular.all(accountsResource).get(id).then(function (response) {
                        $rootScope.$broadcast('accountProvided.UserSystem', response.content);
                        return response;
                    });
                },
                registerAccount: function (payload) {
                    return Restangular.all(accountsResource).post(payload).then(function (response) {
                        $rootScope.$broadcast('accountRegistered.UserSystem', payload);
                        return response;
                    });
                },
                updateAccount: function (payload) {
                    return Restangular.one(accountsResource, userData.id).customPUT(payload).then(function (response) {
                        $rootScope.$broadcast('accountUpdated.UserSystem', payload);
                        return response;
                    });
                },
                patchAccount: function (payload) {
                    return Restangular.one(accountsResource, userData.id).patch(payload).then(function (response) {
                        $rootScope.$broadcast('accountPatched.UserSystem', payload);
                        return response;
                    });
                },
                deleteAccount: function () {
                    return Restangular.one(accountsResource, userData.id).remove().then(function (response) {
                        $rootScope.$broadcast('accountDestroyed.UserSystem', userData.id);
                        return response;
                    });
                },
                getSession: function () {
                    return Restangular.all(sessionResource).customGET().then(function (response) {
                        $rootScope.$broadcast('sessionProvided.UserSystem', response.content);
                        return response;
                    });
                },
                loginSession: function (payload) {
                    return Restangular.all(sessionResource).post(payload).then(function (response) {
                        $rootScope.$broadcast('sessionLogin.UserSystem', response.content);
                        return response;
                    });
                },
                logoutSession: function () {
                    return Restangular.all(sessionResource).customDELETE().then(function (response) {
                        $rootScope.$broadcast('sessionLogout.UserSystem', userData.id);
                        return response;
                    });
                }
            };

            /**
             * Upon the account being provided, the user data is set to the response content.
             */
            $rootScope.$on('accountProvided.UserSystem', function (event, content) {
                userState = true;
                userApi.setUserData(content);
            });

            /**
             * Upon the account being registered, attempt to login given the registration payload's username, email or password.
             */
            $rootScope.$on('accountRegistered.UserSystem', function (event, payload) {
                userApi.loginSession({
                    'username': payload.username,
                    'email': payload.email,
                    'password': payload.password
                });
            });

            /**
             * Upon the account being updated, replace the user data with the payload.
             */
            $rootScope.$on('accountUpdated.UserSystem', function (event, payload) {
                userApi.setUserData(payload);
            });

            /**
             * Upon the account being patched, merge the user data with the payload.
             */
            $rootScope.$on('accountPatched.UserSystem', function (event, payload) {
                userApi.mergeUserData(payload);
            });

            /**
             * Upon the account being destroyed, attempt to logout.
             */
            $rootScope.$on('accountDestroyed.UserSystem', function (event, id) {
                userState = false;
                userApi.logoutSession();
            });

            /**
             * Upon the session being provided, check if the session is registered. If registered broadcast a sessionLogin event.
             */
            $rootScope.$on('sessionProvided.UserSystem', function (event, id) {
                if (id !== 'anonymous') {
                    userState = true;
                    $rootScope.$broadcast('sessionLogin.UserSystem', id);
                }
            });

            /**
             * Upon session login, get the account.
             */
            $rootScope.$on('sessionLogin.UserSystem', function (event, id) {
                userState = true;
                userApi.getAccount(id);
            });

            /**
             * Upon session logout, clear the userData.
             */
            $rootScope.$on('sessionLogout.UserSystem', function (event, args) {
                userState = false;
                userApi.setUserData({});
            });

            return userApi;

        }
    ];

};
},{}],79:[function(require,module,exports){
'use strict';

/**
 * Authentication State Run Block
 */
module.exports = ['$rootScope', 'UserSystemServ', function ($rootScope, UserSystemServ) {

    $rootScope.loggedIn = false;
    $rootScope.loggedOut = true;

    $rootScope.$watch(function () {

        return UserSystemServ.getUserState();
    
    }, function (state) {

        $rootScope.loggedIn = state;
        $rootScope.loggedOut = !state;

    });

}];
},{}],80:[function(require,module,exports){
'use strict';

/**
 * Base Url Constant
 */
module.exports = angular.element('base').attr('href');
},{}],81:[function(require,module,exports){
'use strict';

/**
 * Calculate Service
 */
module.exports = [function () {

    /**
     * Rounds to the nearest place. It can be decimal place, or negative place.
     * 
     * @param  {string|integer|float} value  Number to be rounded
     * @param  {integer}              places Places can be positive or negative.
     * @return {integer|float}
     */
    this.round = function round(value, places) {

        if (typeof places === 'undefined' || +places === 0)
        return Math.round(value);

        value = +value;
        places  = +places;

        if (isNaN(value) || !(typeof places === 'number' && places % 1 === 0))
        return NaN;

        // Shift
        value = value.toString().split('e');
        value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] + places) : places)));

        // Shift back
        value = value.toString().split('e');
        return +(value[0] + 'e' + (value[1] ? (+value[1] - places) : -places));

    };

}];
},{}],82:[function(require,module,exports){
'use strict';

/**
 * Restangular Config Block
 */
module.exports = ['RestangularProvider', 'BaseUrlConst', function (RestangularProvider, BaseUrlConst) {

    //trim the base url of slashes if they exist
    BaseUrlConst = BaseUrlConst.replace(new RegExp('/' + '*$'), '');

    RestangularProvider.setBaseUrl(BaseUrlConst + '/api');

}];
},{}],83:[function(require,module,exports){
'use strict';

/**
 * Services
 */
angular.module('App.Services', []);

module.exports = angular.module('App.Services')
    //Constants
    .constant('BaseUrlConst', require('./BaseUrlConst'))
    //Configuration Services
    .config(require('./RestangularConfig'))
    .config(require('./UserSystemConfig'))
    //Initialisation Services
    .run(require('./AuthenticationStateRun'))
    // .run(require('./RestangularXSRF')) // doesn't yet work, need cookies in response interception
    //Service Objects
    .service('CalculateServ', require('./CalculateServ'));
},{"./AuthenticationStateRun":79,"./BaseUrlConst":80,"./CalculateServ":81,"./RestangularConfig":82,"./UserSystemConfig":84}],84:[function(require,module,exports){
'use strict';

/**
 * User System Config Block
 */
module.exports = ['UserSystemServProvider', function (UserSystemServProvider) {

    UserSystemServProvider.setAccountsResource('accounts');
    UserSystemServProvider.setSessionResource('session');

}];
},{}],85:[function(require,module,exports){
var inserted = {};

module.exports = function (css) {
    if (inserted[css]) return;
    inserted[css] = true;
    
    var elem = document.createElement('style');
    elem.setAttribute('type', 'text/css');

    if ('textContent' in elem) {
      elem.textContent = css;
    } else {
      elem.styleSheet.cssText = css;
    }
    
    var head = document.getElementsByTagName('head')[0];
    head.appendChild(elem);
};

},{}]},{},[5])