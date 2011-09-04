/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010-2011, IBM Corporation
 */

if (typeof PhoneGap === "undefined") {

/**
 * The order of events during page load and PhoneGap startup is as follows:
 *
 * onDOMContentLoaded         Internal event that is received when the web page is loaded and parsed.
 * window.onload              Body onload event.
 * onNativeReady              Internal event that indicates the PhoneGap native side is ready.
 * onPhoneGapInit             Internal event that kicks off creation of all PhoneGap JavaScript objects (runs constructors).
 * onPhoneGapReady            Internal event fired when all PhoneGap JavaScript objects have been created
 * onPhoneGapInfoReady        Internal event fired when device properties are available
 * onDeviceReady              User event fired to indicate that PhoneGap is ready
 * onResume                   User event fired to indicate a start/resume lifecycle event
 * onPause                    User event fired to indicate a pause lifecycle event
 * onDestroy                  Internal event fired when app is being destroyed (User should use window.onunload event, not this one).
 *
 * The only PhoneGap events that user code should register for are:
 *      onDeviceReady
 *      onResume
 *
 * Listeners can be registered as:
 *      document.addEventListener("deviceready", myDeviceReadyListener, false);
 *      document.addEventListener("resume", myResumeListener, false);
 *      document.addEventListener("pause", myPauseListener, false);
 */

if ( typeof (DeviceInfo) !== 'object') {
  var DeviceInfo = {};
}

/**
 * This represents the PhoneGap API itself, and provides a global namespace for accessing
 * information about the state of PhoneGap.
 * @class
 */
var PhoneGap = {
  queue: {
      ready: true,
      commands: [],
      timer: null
  },
  documentEventHandler: {},   // Collection of custom document event handlers
  windowEventHandler: {}      // Collection of custom window event handlers
};

/**
 * List of resource files loaded by PhoneGap.
 * This is used to ensure JS and other files are loaded only once.
 */
PhoneGap.resources = {base: true};

/**
 * Determine if resource has been loaded by PhoneGap
 *
 * @param name
 * @return
 */
PhoneGap.hasResource = function(name) {
  return PhoneGap.resources[name];
};

/**
 * Add a resource to list of loaded resources by PhoneGap
 *
 * @param name
 */
PhoneGap.addResource = function(name) {
  PhoneGap.resources[name] = true;
};

/**
 * Custom pub-sub channel that can have functions subscribed to it
 * @constructor
 */
PhoneGap.Channel = function (type)
{
  this.type = type;
  this.handlers = {};
  this.guid = 0;
  this.fired = false;
  this.enabled = true;
};

/**
 * Subscribes the given function to the channel. Any time that
 * Channel.fire is called so too will the function.
 * Optionally specify an execution context for the function
 * and a guid that can be used to stop subscribing to the channel.
 * Returns the guid.
 */
PhoneGap.Channel.prototype.subscribe = function (f, c, g)
{
  // need a function to call
  if (f === null) { return; }

  var func = f;
  if (typeof c === "object" && typeof f === "function")
  { func = PhoneGap.close(c, f); }

  g = g || func.observer_guid || f.observer_guid || this.guid++;
  func.observer_guid = g;
  f.observer_guid = g;
  this.handlers[g] = func;
  return g;
};

/**
 * Like subscribe but the function is only called once and then it
 * auto-unsubscribes itself.
 */
PhoneGap.Channel.prototype.subscribeOnce = function (f, c)
{
  var g = null;
  var _this = this;
  var m = function() {
    f.apply(c || null, arguments);
    _this.unsubscribe(g);
  };
  if (this.fired) {
    if (typeof c === "object" && typeof f === "function")
    { f = PhoneGap.close(c, f); }
    f.apply(this, this.fireArgs);
  } else {
    g = this.subscribe(m);
  }
  return g;
};

/**
 * Unsubscribes the function with the given guid from the channel.
 */
PhoneGap.Channel.prototype.unsubscribe = function(g)
{
  if (typeof g === "function") { g = g.observer_guid; }
  this.handlers[g] = null;
  delete this.handlers[g];
};

/**
 * Calls all functions subscribed to this channel.
 */
PhoneGap.Channel.prototype.fire = function (e)
{
  if (this.enabled) {
    var fail = false;
    var item, handler, rv;
    for (item in this.handlers) {
      if (this.handlers.hasOwnProperty(item)) {
        handler = this.handlers[item];
        if (typeof handler === "function") {
            rv = (handler.apply(this, arguments) === false);
            fail = fail || rv;
        }
      }
    }
    this.fired = true;
    this.fireArgs = arguments;
    return !fail;
  }
  return true;
};

/**
 * Calls the provided function only after all of the channels specified
 * have been fired.
 */
PhoneGap.Channel.join = function (h, c)
{
  var i = c.length;
  var f = function() {
    if (!(--i)) {
        h();
    }
  };
  var len = i;
  var j;
  for (j=0; j<len; j++)
  {
    if (!c[j].fired) {
      c[j].subscribeOnce(f);
    }
    else {
      i--;
    }
  }
  if (!i) {
    h();
  }
};

/**
 * Boolean flag indicating if the PhoneGap API is available and initialized.
 */ // TODO: Remove this, it is unused here ... -jm
PhoneGap.available = DeviceInfo.uuid !== undefined;

/**
 * Add an initialization function to a queue that ensures it will run and initialize
 * application constructors only once PhoneGap has been initialized.
 * @param {Function} func The function callback you want run once PhoneGap is initialized
 */
PhoneGap.addConstructor = function (func)
{
  PhoneGap.onPhoneGapInit.subscribeOnce (function ()
  {
    try {
      func();
    } catch(e) {
      console.log("Failed to run constructor: " + e);
    }
  });
};

/**
 * Plugins object
 */
if (!window.plugins) {
    window.plugins = {};
}

/**
 * Adds a plugin object to window.plugins.
 * The plugin is accessed using window.plugins.<name>
 *
 * @param name          The plugin name
 * @param obj           The plugin object
 */
PhoneGap.addPlugin = function (name, obj)
{
  if (!window.plugins [name]) {
    window.plugins[name] = obj;
  }
  else {
    console.log("Error: Plugin "+name+" already exists.");
  }
};

/**
 * onDOMContentLoaded channel is fired when the DOM content
 * of the page has been parsed.
 */
PhoneGap.onDOMContentLoaded = new PhoneGap.Channel ('onDOMContentLoaded');

/**
 * onNativeReady channel is fired when the PhoneGap native code
 * has been initialized.
 */
PhoneGap.onNativeReady = new PhoneGap.Channel ('onNativeReady');

/**
 * onPhoneGapInit channel is fired when the web page is fully loaded and
 * PhoneGap native code has been initialized.
 */
PhoneGap.onPhoneGapInit = new PhoneGap.Channel ('onPhoneGapInit');

/**
 * onPhoneGapReady channel is fired when the JS PhoneGap objects have been created.
 */
PhoneGap.onPhoneGapReady = new PhoneGap.Channel ('onPhoneGapReady');

/**
 * onPhoneGapInfoReady channel is fired when the PhoneGap device properties
 * has been set.
 */
PhoneGap.onPhoneGapInfoReady = new PhoneGap.Channel ('onPhoneGapInfoReady');

/**
 * onPhoneGapConnectionReady channel is fired when the PhoneGap connection properties
 * has been set.
 */
PhoneGap.onPhoneGapConnectionReady = new PhoneGap.Channel('onPhoneGapConnectionReady');

/**
 * onResume channel is fired when the PhoneGap native code
 * resumes.
 */
PhoneGap.onResume = new PhoneGap.Channel('onResume');

/**
 * onPause channel is fired when the PhoneGap native code
 * pauses.
 */
PhoneGap.onPause = new PhoneGap.Channel('onPause');

/**
 * onDestroy channel is fired when the PhoneGap native code
 * is destroyed.  It is used internally.
 * Window.onunload should be used by the user.
 */
PhoneGap.onDestroy = new PhoneGap.Channel('onDestroy');
PhoneGap.onDestroy.subscribeOnce(function() {
    PhoneGap.shuttingDown = true;
});
PhoneGap.shuttingDown = false;

// _nativeReady is global variable that the native side can set
// to signify that the native code is ready. It is a global since
// it may be called before any PhoneGap JS is ready.
if (typeof _nativeReady !== 'undefined') { PhoneGap.onNativeReady.fire(); }

/**
 * onDeviceReady is fired only after all PhoneGap objects are created and
 * the device properties are set.
 */
PhoneGap.onDeviceReady = new PhoneGap.Channel('onDeviceReady');


// Array of channels that must fire before "deviceready" is fired
PhoneGap.deviceReadyChannelsArray = [ PhoneGap.onPhoneGapReady, PhoneGap.onPhoneGapInfoReady, PhoneGap.onPhoneGapConnectionReady];

// Hashtable of user defined channels that must also fire before "deviceready" is fired
PhoneGap.deviceReadyChannelsMap = {};

/**
 * Indicate that a feature needs to be initialized before it is ready to be used.
 * This holds up PhoneGap's "deviceready" event until the feature has been initialized
 * and PhoneGap.initComplete(feature) is called.
 *
 * @param feature {String}     The unique feature name
 */
PhoneGap.waitForInitialization = function(feature) {
  if (feature) {
    var channel = new PhoneGap.Channel(feature);
    PhoneGap.deviceReadyChannelsMap[feature] = channel;
    PhoneGap.deviceReadyChannelsArray.push(channel);
  }
};

/**
 * Indicate that initialization code has completed and the feature is ready
 * to be used.
 *
 * @param feature {String}     The unique feature name
 */
PhoneGap.initializationComplete = function (feature) {
  var channel = PhoneGap.deviceReadyChannelsMap[feature];
  if (channel) {
      channel.fire();
  }
};

/**
 * Create all PhoneGap objects once page has fully loaded and native side is ready.
 */
PhoneGap.Channel.join (function()
{
  // Run PhoneGap constructors
  PhoneGap.onPhoneGapInit.fire ();

  // Fire event to notify that all objects are created
  PhoneGap.onPhoneGapReady.fire ();

  // Fire onDeviceReady event once all constructors have run and PhoneGap info 
  // has been received from native side, and any user defined initialization
  // channels.
  PhoneGap.Channel.join(function()
  {
    // Let native code know we are inited on JS side
    GapApp.gapInit ();

    PhoneGap.onDeviceReady.fire ();

    // Fire the onresume event, since first one happens before JavaScript
    // is loaded
    PhoneGap.onResume.fire();
  }, PhoneGap.deviceReadyChannelsArray);

}, [ PhoneGap.onDOMContentLoaded, PhoneGap.onNativeReady ]);

// Listen for DOMContentLoaded and notify our channel subscribers
document.addEventListener ('DOMContentLoaded', function() {
  PhoneGap.onDOMContentLoaded.fire ();
}, false);

// Intercept calls to document.addEventListener and watch for deviceready
PhoneGap.m_document_addEventListener = document.addEventListener;

// Intercept calls to window.addEventListener
PhoneGap.m_window_addEventListener = window.addEventListener;

/**
 * Add a custom window event handler.
 *
 * @param {String} event            The event name that callback handles
 * @param {Function} callback       The event handler
 */
PhoneGap.addWindowEventHandler = function(event, callback) {
  PhoneGap.windowEventHandler[event] = callback;
}

/**
 * Add a custom document event handler.
 *
 * @param {String} event            The event name that callback handles
 * @param {Function} callback       The event handler
 */
PhoneGap.addDocumentEventHandler = function(event, callback) {
  PhoneGap.documentEventHandler[event] = callback;
}

/**
 * Intercept adding document event listeners and handle our own
 *
 * @param {Object} evt
 * @param {Function} handler
 * @param capture
 */
document.addEventListener = function(evt, handler, capture)
{
  var e = evt.toLowerCase();
  if (e === 'deviceready') {
    PhoneGap.onDeviceReady.subscribeOnce (handler);
  } else if (e === 'resume') {
    PhoneGap.onResume.subscribe (handler);
    if (PhoneGap.onDeviceReady.fired) {
        PhoneGap.onResume.fire ();
    }
  } else if (e === 'pause') {
    PhoneGap.onPause.subscribe (handler);
  }
  else
  {
    // If subscribing to an event that is handled by a plugin
    if (typeof PhoneGap.documentEventHandler[e] !== "undefined")
    {
      if (PhoneGap.documentEventHandler[e](e, handler, true))
      {
        return; // Stop default behavior
      }
    }
    
    PhoneGap.m_document_addEventListener.call(document, evt, handler, capture);
  }
};

/**
 * Intercept adding window event listeners and handle our own
 *
 * @param {Object} evt
 * @param {Function} handler
 * @param capture
 */
window.addEventListener = function(evt, handler, capture) {
    var e = evt.toLowerCase();
        
    // If subscribing to an event that is handled by a plugin
    if (typeof PhoneGap.windowEventHandler[e] !== "undefined") {
        if (PhoneGap.windowEventHandler[e](e, handler, true)) {
            return; // Stop default behavior
        }
    }
        
    PhoneGap.m_window_addEventListener.call(window, evt, handler, capture);
};

// Intercept calls to document.removeEventListener and watch for events that
// are generated by PhoneGap native code
PhoneGap.m_document_removeEventListener = document.removeEventListener;

// Intercept calls to window.removeEventListener
PhoneGap.m_window_removeEventListener = window.removeEventListener;

/**
 * Intercept removing document event listeners and handle our own
 *
 * @param {Object} evt
 * @param {Function} handler
 * @param capture
 */
document.removeEventListener = function(evt, handler, capture)
{
  var e = evt.toLowerCase();

  // If unsubcribing from an event that is handled by a plugin
  if (typeof PhoneGap.documentEventHandler[e] !== "undefined") {
    if (PhoneGap.documentEventHandler[e](e, handler, false)) {
      return; // Stop default behavior
    }
  }

  PhoneGap.m_document_removeEventListener.call(document, evt, handler, capture);
};

/**
 * Intercept removing window event listeners and handle our own
 *
 * @param {Object} evt
 * @param {Function} handler
 * @param capture
 */
window.removeEventListener = function(evt, handler, capture) {
    var e = evt.toLowerCase();

    // If unsubcribing from an event that is handled by a plugin
    if (typeof PhoneGap.windowEventHandler[e] !== "undefined") {
        if (PhoneGap.windowEventHandler[e](e, handler, false)) {
            return; // Stop default behavior
        }
    }

    PhoneGap.m_window_removeEventListener.call(window, evt, handler, capture);
};

/**
 * Method to fire document event
 *
 * @param {String} type             The event type to fire
 * @param {Object} data             Data to send with event
 */
PhoneGap.fireDocumentEvent = function(type, data) {
    var e = document.createEvent('Events');
    e.initEvent(type);
    if (data) {
        for (var i in data) {
            e[i] = data[i];
        }
    }
    document.dispatchEvent(e);
};

/**
 * Method to fire window event
 *
 * @param {String} type             The event type to fire
 * @param {Object} data             Data to send with event
 */
PhoneGap.fireWindowEvent = function(type, data) {
    var e = document.createEvent('Events');
    e.initEvent(type);
    if (data) {
        for (var i in data) {
            e[i] = data[i];
        }
    }
    window.dispatchEvent(e);
};

/**
 * Does a deep clone of the object.
 *
 * @param obj
 * @return {Object}
 */
PhoneGap.clone = function(obj)
{
  var i, retVal;
  if(!obj) { 
    return obj;
  }
  
  if (obj instanceof Array)
  {
    retVal = [];
    for(i = 0; i < obj.length; ++i){
      retVal.push(PhoneGap.clone(obj[i]));
    }
    return retVal;
  }
  
  if (typeof obj === "function") {
    return obj;
  }
  
  if(!(obj instanceof Object)){
    return obj;
  }
  
  if (obj instanceof Date) {
      return obj;
  }
  
  retVal = {};
  for(i in obj){
    if(!(i in retVal) || retVal[i] !== obj[i]) {
        retVal[i] = PhoneGap.clone(obj[i]);
    }
  }
  return retVal;
};

PhoneGap.callbackId = 0;
PhoneGap.callbacks = {};
PhoneGap.callbackStatus = {
    NO_RESULT: 0,
    OK: 1,
    CLASS_NOT_FOUND_EXCEPTION: 2,
    ILLEGAL_ACCESS_EXCEPTION: 3,
    INSTANTIATION_EXCEPTION: 4,
    MALFORMED_URL_EXCEPTION: 5,
    IO_EXCEPTION: 6,
    INVALID_ACTION: 7,
    JSON_EXCEPTION: 8,
    ERROR: 9
    };


/**
 * Execute a PhoneGap command.  It is up to the native side whether this action is synch or async.
 * The native side can return:
 *      Synchronous: PluginResult object as a JSON string
 *      Asynchrounous: Empty string ""
 * If async, the native side will PhoneGap.callbackSuccess or PhoneGap.callbackError,
 * depending upon the result of the action.
 *
 * @param {Function} success    The success callback
 * @param {Function} fail       The fail callback
 * @param {String} service      The name of the service to use
 * @param {String} action       Action to be run in PhoneGap
 * @param {Array.<String>} [args]     Zero or more arguments to pass to the method
 */
PhoneGap.exec = function (success, fail, service, action, args)
{
  try
  {
    var callbackId = service + PhoneGap.callbackId++;
    if (success || fail) {
        PhoneGap.callbacks[callbackId] = {success:success, fail:fail};
    }

//    var r = prompt (JSON.stringify(args),
//      "gap:"+JSON.stringify([service, action, callbackId, true]));
      
    var r = GapCore.exec (service, action, args, callbackId);

    // If a result was returned
    if (r.length > 0)
    {
      eval("var v="+r+";");
  
      // If status is OK, then return value back to caller
      if (v.status === PhoneGap.callbackStatus.OK)
      {
        // If there is a success callback, then call it now with
        // returned value
        if (success)
        {
          try {
            console.log ("Result " + v.message);
            success (v.message);
          } catch (e) {
            console.log ("Error in success callback: " + callbackId  + 
              " = " + e);
          }
  
          // Clear callback if not expecting any more results
          if (!v.keepCallback) {
            delete PhoneGap.callbacks[callbackId];
          }
        }
        return v.message;
      }
  
      // If no result
      else if (v.status === PhoneGap.callbackStatus.NO_RESULT)
      {
        // Clear callback if not expecting any more results
        if (!v.keepCallback) {
            delete PhoneGap.callbacks[callbackId];
        }
      }
  
      // If error, then display error
      else
      {
        console.log("Error: Status="+v.status+" Message="+v.message);
  
        // If there is a fail callback, then call it now with returned value
        if (fail) {
          try {
            fail(v.message);
          }
          catch (e1) {
            console.log("Error in error callback: "+callbackId+" = "+e1);
          }
  
          // Clear callback if not expecting any more results
          if (!v.keepCallback) {
            delete PhoneGap.callbacks[callbackId];
          }
        }
        return null;
      }
    }
  }
  catch (e2)
  {
    console.log ("Error: "+e2);
  }
};

/**
 * Called by native code when returning successful result from an action.
 *
 * @param callbackId
 * @param args
 */
PhoneGap.callbackSuccess = function(callbackId, args) {
  if (PhoneGap.callbacks[callbackId])
  {
    // If result is to be sent to callback
    if (args.status === PhoneGap.callbackStatus.OK)
    {
      try
      {
        if (PhoneGap.callbacks[callbackId].success)
        {
          PhoneGap.callbacks[callbackId].success(args.message);
        }
      }
      catch (e)
      {
        console.log("Error in success callback: "+callbackId+" = "+e);
      }
    }

    // Clear callback if not expecting any more results
    if (!args.keepCallback)
    {
      delete PhoneGap.callbacks[callbackId];
    }
  }
};

/**
 * Called by native code when returning error result from an action.
 *
 * @param callbackId
 * @param args
 */
PhoneGap.callbackError = function(callbackId, args)
{
  if (PhoneGap.callbacks[callbackId])
  {
    try
    {
      if (PhoneGap.callbacks[callbackId].fail)
      {
        PhoneGap.callbacks[callbackId].fail(args.message);
      }
    }
    catch (e)
    {
      console.log("Error in error callback: "+callbackId+" = "+e);
    }

    // Clear callback if not expecting any more results
    if (!args.keepCallback)
    {
      delete PhoneGap.callbacks[callbackId];
    }
  }
};

/**
 * Create a UUID
 *
 * @return {String}
 */
PhoneGap.createUUID = function()
{
  return PhoneGap.UUIDcreatePart(4) + '-' +
    PhoneGap.UUIDcreatePart(2) + '-' +
    PhoneGap.UUIDcreatePart(2) + '-' +
    PhoneGap.UUIDcreatePart(2) + '-' +
    PhoneGap.UUIDcreatePart(6);
};

PhoneGap.UUIDcreatePart = function (length)
{
  var uuidpart = "";
  var i, uuidchar;
  for (i=0; i<length; i++)
  {
    uuidchar = parseInt((Math.random() * 256),0).toString(16);
    if (uuidchar.length === 1) {
        uuidchar = "0" + uuidchar;
    }
    uuidpart += uuidchar;
  }
  return uuidpart;
};

PhoneGap.close = function(context, func, params) {
    if (typeof params === 'undefined') {
        return function() {
            return func.apply(context, arguments);
        };
    } else {
        return function() {
            return func.apply(context, params);
        };
    }
};

/**
 * Load a JavaScript file after page has loaded.
 *
 * @param {String} jsfile               The url of the JavaScript file to load.
 * @param {Function} successCallback    The callback to call when the file has been loaded.
 */
PhoneGap.includeJavascript = function(jsfile, successCallback) {
    var id = document.getElementsByTagName("head")[0];
    var el = document.createElement('script');
    el.type = 'text/javascript';
    if (typeof successCallback === 'function') {
        el.onload = successCallback;
    }
    el.src = jsfile;
    id.appendChild(el);
};

}


function Accelerometer ()
{
  this.getCurrentAcceleration =
    function (accelerometerSuccess, accelerometerError)
  {
    try
    {
      var accel = GapAccelerometer.getCurrentAcceleration ();
      accelerometerSuccess (accel);
    }
    catch (err)
    {
      accelerometerError ();
    }
  };
  
  this.watchAcceleration =
    function (accelerometerSuccess, accelerometerError, options)
  {
    var freq = (options && options.frequency)?options.frequency:500;
    var self = this;
    return setInterval(function ()
    {
      self.getCurrentAcceleration (accelerometerSuccess, accelerometerError);
    }, freq);
  };
    
  this.clearWatch = function (watchID)
  {
    clearInterval (watchID);
  };
}

function Compass ()
{
  this.getCurrentHeading =
    function (compassSuccess, compassError)
  {
    try
    {
      var heading = GapCompass.getCurrentHeading ();
      compassSuccess (heading);
    }
    catch (err)
    {
      compassError ();
    }
  };
  
  this.watchHeading =
    function (compassSuccess, compassError, options)
  {
    var freq = (options && options.frequency)?options.frequency:500;
    var self = this;
    return setInterval(function ()
    {
      self.getCurrentHeading (compassSuccess, compassError);
    }, freq);
  };
    
  this.clearWatch = function (watchID)
  {
    clearInterval (watchID);
  };
}


function DebugConsole() {
}

DebugConsole.prototype.log = function (output, showTime)
{
  if (showTime)
  {
    var now = "" + new Date().getTime();
    output = now.substring(now.length - 5) + ": " + output;
  }
  GapDebugConsole.log ("LOG: " + output);
}

DebugConsole.prototype.warn = function (output, showTime)
{
  if (showTime)
  {
    var now = "" + new Date().getTime();
    output = now.substring(now.length - 5) + ": " + output;
  }
  GapDebugConsole.log ("WARNING: " + output);
}

DebugConsole.prototype.error = function (output, showTime)
{
  if (showTime)
  {
    var now = "" + new Date().getTime();
    output = now.substring(now.length - 5) + ": " + output;
  }
  GapDebugConsole.log ("ERROR: " + output);
}


/**
 * This class provides access to the device camera.
 * @constructor
 */
Camera = function() {
        this.successCallback = null;
        this.errorCallback = null;
        var self = this;

        window.GapCamera.pictureDataCaptured.connect(function(image) {
                if (typeof(self.successCallback) == 'function') {
                        console.log("pictureDataCaptured");
                        self.successCallback(image);
                }
        });

        window.GapCamera.pictureFileCaptured.connect(function(fileName) {
                if (typeof(self.successCallback) == 'function') {
                        console.log("pictureFileCaptured");
                        self.successCallback(fileName);
                }
        });

        window.GapCamera.error.connect(function(errorCode, message) {
                if (typeof(self.errorCallback) == 'function') {
                        /// @todo translate error message
                        self.errorCallback(message);
                }
        });
}

/**
 * Format of image returned from getPicture
 */
Camera.DestinationType = {
        DATA_URL: 0,
        FILE_URI: 1
};
Camera.prototype.DestinationType = Camera.DestinationType;

/**
 * We use the Platform Services 2.0 API here. So we must include a portion of the
 * PS 2.0 source code (camera API).
 * @param {Function} successCallback
 * @param {Function} errorCallback
 * @param {Object} options
 */
Camera.prototype.getPicture = function(successCallback, errorCallback, options){

        this.successCallback = successCallback;
        this.errorCallback = errorCallback;

        GapCamera.quality = (typeof(options) == 'object' && options.quality) ? options.quality : 75;
        GapCamera.destinationType = (typeof(options) == 'object' && options.destinationType) ?
                                                                 options.destinationType :
                                                                 this.DestinationType.DATA_URL; // default to BASE64 encoded image

        GapCamera.takePicture();
}


NetworkStatus = {
    NOT_REACHABLE: 0,
    REACHABLE_VIA_WIFI_NETWORK: 1,
    REACHABLE_VIA_CARRIER_DATA_NETWORK: 2
};

function Network() {

    this.isReachable = function(hostName, successCb, options) {
        var xhr = new XMLHttpRequest;
        xhr.open("GET", hostName, true);
        xhr.onreadystatechange = function(req) {
            if (xhr.readyState != 4) {
                return;
            }

            alert(xhr.status);
            if (xhr.status != 200 && xhr.status != 304) {
                successCb(NetworkStatus.NOT_REACHABLE);
            } else {
                successCb(NetworkStatus.REACHABLE_VIA_WIFI_NETWORK);
            }
        };
        xhr.send();
    }
}


/**
 * This class provides access to device GPS data.
 * @constructor
 */
function Geolocation ()
{
  /**
   * The last known GPS position.
   */
  this.lastPosition = null;
  this.lastError = null;
  this._watcher = 0;
 
  var self = this;
  GapGeolocation.positionUpdated.connect (function (position)
  {
    self.lastPosition = position;
  });
  
  GapGeolocation.error.connect (function (error)
  {
    self.lastError = error;
  });
}

/**
 * Position error object
 *
 * @constructor
 * @param code
 * @param message
 */
var PositionError = function(code, message) {
    this.code = code;
    this.message = message;
};

PositionError.PERMISSION_DENIED = 1;
PositionError.POSITION_UNAVAILABLE = 2;
PositionError.TIMEOUT = 3;

/**
 * Asynchronously aquires the current position.
 * @param {Function} successCallback The function to call when the position
 * data is available
 * @param {Function} errorCallback The function to call when there is an error
 * getting the position data.
 * @param {PositionOptions} options The options for getting the position data
 * such as timeout.
 */
Geolocation.prototype.getCurrentPosition =
  function(successCallback, errorCallback, options)
{
  var timeout = 20000;
  var interval = (options && options.interval)?options.interval:500;

  var referenceTime = 0;
  if (this.lastPosition)
  {
    referenceTime = this.lastPosition.timeout;
  }
  else
  {
    this._start (interval);
  }

  if (typeof(successCallback) !== 'function')
  {
    successCallback = function() {};
  }
  if (typeof (errorCallback) !== 'function')
  {
    errorCallback = function () {};
  }

  var self = this;
  var delay = 0;
  var timer = setInterval (function ()
  {
    delay += interval;

    if (self.lastPosition && 
        self.lastPosition.timestamp > referenceTime)
    {
      successCallback (self.lastPosition);
      clearInterval(timer);
    }
    else if (delay >= timeout)
    {
      errorCallback (new PositionError
       (PositionError.TIMEOUT, "A timeout occurred."));
      clearInterval(timer);
      self._stop ();
    } else {
        // the interval gets called again
    }
  }, interval);
};

/**
 * Asynchronously aquires the position repeatedly at a given interval.
 * @param {Function} successCallback The function to call each time the position
 * data is available
 * @param {Function} errorCallback The function to call when there is an error
 * getting the position data.
 * @param {PositionOptions} options The options for getting the position data
 * such as timeout and the frequency of the watch.
 */
Geolocation.prototype.watchPosition =
  function (successCallback, errorCallback, options)
{
  // Invoke the appropriate callback with a new Position object every time the implementation
  // determines that the position of the hosting device has changed.

  // manage compte watcher. Use to stop Geolocation system
  // when its need
  if (!this._watcher) { this._start (); }
  this._watcher ++;

  this.getCurrentPosition (successCallback, errorCallback, options);
  var maximumAge = 10000;
  if (typeof(options) === 'object' && options.maximumAge)
  {
    maximumAge = options.maximumAge;
  }

  var self = this;
  return setInterval (function()
  {
    self.getCurrentPosition (successCallback, errorCallback, options);
  }, maximumAge);
};

/**
 * Clears the specified position watch.
 * @param {String} watchId The ID of the watch returned from #watchPosition.
 */
Geolocation.prototype.clearWatch = function (watchId)
{
  clearInterval (watchId);
  this._watcher --;
  if (!this._watcher) { this._stop (); }
};

Geolocation.prototype._start = function (interval)
{
  console.log ('_start');
  GapGeolocation.start (interval);
};

Geolocation.prototype._stop = function ()
{
  console.log ('_stop');
  GapGeolocation.stop ();
};

function Notification() {

    this.vibrate = function(milis) {
        GapNotification.vibrate(milis);
    };
    
    this.alert = function(message, callback, title, button) {
        alert(message);
        callback();
    };
    
    this.confirm = function(message, callback, title, buttons) {
        var result = confirm(message);
        callback();
        return result;
    };
    
    this.beep = function (times) {
        alert("not implemented");
    };
}


function Utility() {

    this.exit = function() {
        GapUtility.exit();
    };
}

/**
* This class contains information about the current network Connection.
* @constructor
*/
var Connection = function ()
{
  this.type = null;
  this._firstRun = true;
  this._timer = null;
  this.timeout = 500;

  var me = this;
  this.getInfo (
    function (type)
    {
      // Need to send events if we are on or offline
      if (type == "none")
      {
        // set a timer if still offline at the end of timer send the
        // offline event
        me._timer = setTimeout (function ()
        {
          me.type = type;
          PhoneGap.fireDocumentEvent ('offline');
          me._timer = null;
        }, me.timeout);
      } 
      else
      {
        // If there is a current offline event pending clear it
        if (me._timer != null)
        {
          clearTimeout (me._timer);
          me._timer = null;
        }
        me.type = type;
        PhoneGap.fireDocumentEvent ('online');
      }
      
      // should only fire this once
      if (me._firstRun)
      {
        me._firstRun = false;
        PhoneGap.onPhoneGapConnectionReady.fire ();
      }
    },
    function (e)
    {
      console.log ("Error initializing Network Connection: " + e);
    });
};

Connection.UNKNOWN = "unknown";
Connection.ETHERNET = "ethernet";
Connection.WIFI = "wifi";
Connection.CELL_2G = "2g";
Connection.CELL_3G = "3g";
Connection.CELL_4G = "4g";
Connection.NONE = "none";

/**
* Get connection info
*
* @param {Function} successCallback The function to call when the
*  Connection data is available
* @param {Function} errorCallback The function to call when there is
*  an error getting the Connection data. (OPTIONAL)
*/
Connection.prototype.getInfo = function(successCallback, errorCallback)
{
  // Get info
  PhoneGap.exec (successCallback, errorCallback, "Network Status", "getConnectionInfo", []);
};

























































/**
* Contact name.
* @constructor
* @param formatted
* @param familyName
* @param givenName
* @param middle
* @param prefix
* @param suffix
*/
var ContactName = function (formatted, familyName, givenName, middle, prefix, suffix)
{
  this.formatted = formatted || null;
  this.familyName = familyName || null;
  this.givenName = givenName || null;
  this.middleName = middle || null;
  this.honorificPrefix = prefix || null;
  this.honorificSuffix = suffix || null;
};

/**
* Generic contact field.
* @constructor
* @param {DOMString} id unique identifier, should only be set by native code
* @param type
* @param value
* @param pref
*/
var ContactField = function (type, value, pref)
{
  this.id = null;
  this.type = type || null;
  this.value = value || null;
  this.pref = pref || null;
};

/**
* Contact address.
* @constructor
* @param {DOMString} id unique identifier, should only be set by native code
* @param formatted
* @param streetAddress
* @param locality
* @param region
* @param postalCode
* @param country
*/
var ContactAddress = function (pref, type, formatted, streetAddress, locality, region, postalCode, country)
{
  this.id = null;
  this.pref = pref || null;
  this.type = type || null;
  this.formatted = formatted || null;
  this.streetAddress = streetAddress || null;
  this.locality = locality || null;
  this.region = region || null;
  this.postalCode = postalCode || null;
  this.country = country || null;
};

/**
* Contact organization.
* @constructor
* @param {DOMString} id unique identifier, should only be set by native code
* @param name
* @param dept
* @param title
* @param startDate
* @param endDate
* @param location
* @param desc
*/
var ContactOrganization = function (pref, type, name, dept, title)
{
  this.id = null;
  this.pref = pref || null;
  this.type = type || null;
  this.name = name || null;
  this.department = dept || null;
  this.title = title || null;
};

/**
 * ContactFindOptions.
 * @constructor
 * @param filter used to match contacts against
 * @param multiple boolean used to determine if more than one contact should be returned
 */
var ContactFindOptions = function (filter, multiple)
{
  this.filter = filter || '';
  if (multiple) this.multiple = true;
  else this.multiple = false;
};


/**
* Represents a group of Contacts.
* @constructor
*/
var Contacts = function() {
    this.inProgress = false;
    this.records = [];
};

/**
* Returns an array of Contacts matching the search criteria.
* @param fields that should be searched
* @param successCB success callback
* @param errorCB error callback
* @param {ContactFindOptions} options that can be applied to contact searching
* @return array of Contacts matching search criteria
*/
Contacts.prototype.find = function (fields, successCB, errorCB, options)
{
  if (successCB === null)
  {
    throw new TypeError
      ("You must specify a success callback for the find command.");
  }
  if (fields === null || fields === "undefined" ||
      fields.length === "undefined" || fields.length <= 0)
  {
    if (typeof errorCB === "function")
    {
      errorCB ({"code": ContactError.INVALID_ARGUMENT_ERROR});
    }
  } else {
    PhoneGap.exec (successCB, errorCB, "ContactManager", "find", [fields, options]);        
  }
};







































function Device()
{
  this.name = GapDeviceInfo.name;
  this.platform = GapDeviceInfo.platform;
  this.uuid = GapDeviceInfo.uuid;
  this.version = GapDeviceInfo.version;
  this.phonegap = '0.9.2';
}


PhoneGap.addConstructor (function()
{
  console.log ("new DebugConsole");
  window._console = console;
  window.console = new DebugConsole ();
});

PhoneGap.addConstructor (function()
{
  console.log ("new Accelerometer");
  navigator.accelerometer = new Accelerometer ();
});

PhoneGap.addConstructor (function()
{
  console.log ("new Compass");
  navigator.compass = new Compass ();
});

PhoneGap.addConstructor (function()
{
  console.log ("new Geolocation");
  navigator.geolocation = new Geolocation ();
});

/**
 * Add the contact interface into the browser.
 */
PhoneGap.addConstructor (function()
{
  console.log ("new Contacts");
  navigator.contacts = new Contacts ();
});

PhoneGap.addConstructor (function()
{
  console.log ("new Connection");

  if (typeof navigator.network === "undefined")
  {
    navigator.network = new Object();
  }
  if (typeof navigator.network.connection === "undefined")
  {
    navigator.network.connection = new Connection();
  }
});


//if (typeof navigator.camera == "undefined") navigator.camera = new Camera();

//if (typeof navigator.network == "undefined") navigator.network = new Network();
//if (typeof navigator.notification == "undefined") navigator.notification = new Notification();
//if (typeof navigator.utility == "undefined") navigator.utility = new Utility();
