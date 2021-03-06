
'use strict';

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var promise = createCommonjsModule(function (module) {
(function (root) {

  // Store setTimeout reference so promise-polyfill will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var setTimeoutFunc = setTimeout;

  function noop() {}
  
  // Polyfill for Function.prototype.bind
  function bind(fn, thisArg) {
    return function () {
      fn.apply(thisArg, arguments);
    };
  }

  function Promise(fn) {
    if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');
    if (typeof fn !== 'function') throw new TypeError('not a function');
    this._state = 0;
    this._handled = false;
    this._value = undefined;
    this._deferreds = [];

    doResolve(fn, this);
  }

  function handle(self, deferred) {
    while (self._state === 3) {
      self = self._value;
    }
    if (self._state === 0) {
      self._deferreds.push(deferred);
      return;
    }
    self._handled = true;
    Promise._immediateFn(function () {
      var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
      if (cb === null) {
        (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
        return;
      }
      var ret;
      try {
        ret = cb(self._value);
      } catch (e) {
        reject(deferred.promise, e);
        return;
      }
      resolve(deferred.promise, ret);
    });
  }

  function resolve(self, newValue) {
    try {
      // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
      if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.');
      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
        var then = newValue.then;
        if (newValue instanceof Promise) {
          self._state = 3;
          self._value = newValue;
          finale(self);
          return;
        } else if (typeof then === 'function') {
          doResolve(bind(then, newValue), self);
          return;
        }
      }
      self._state = 1;
      self._value = newValue;
      finale(self);
    } catch (e) {
      reject(self, e);
    }
  }

  function reject(self, newValue) {
    self._state = 2;
    self._value = newValue;
    finale(self);
  }

  function finale(self) {
    if (self._state === 2 && self._deferreds.length === 0) {
      Promise._immediateFn(function() {
        if (!self._handled) {
          Promise._unhandledRejectionFn(self._value);
        }
      });
    }

    for (var i = 0, len = self._deferreds.length; i < len; i++) {
      handle(self, self._deferreds[i]);
    }
    self._deferreds = null;
  }

  function Handler(onFulfilled, onRejected, promise) {
    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
    this.promise = promise;
  }

  /**
   * Take a potentially misbehaving resolver function and make sure
   * onFulfilled and onRejected are only called once.
   *
   * Makes no guarantees about asynchrony.
   */
  function doResolve(fn, self) {
    var done = false;
    try {
      fn(function (value) {
        if (done) return;
        done = true;
        resolve(self, value);
      }, function (reason) {
        if (done) return;
        done = true;
        reject(self, reason);
      });
    } catch (ex) {
      if (done) return;
      done = true;
      reject(self, ex);
    }
  }

  Promise.prototype['catch'] = function (onRejected) {
    return this.then(null, onRejected);
  };

  Promise.prototype.then = function (onFulfilled, onRejected) {
    var prom = new (this.constructor)(noop);

    handle(this, new Handler(onFulfilled, onRejected, prom));
    return prom;
  };

  Promise.all = function (arr) {
    var args = Array.prototype.slice.call(arr);

    return new Promise(function (resolve, reject) {
      if (args.length === 0) return resolve([]);
      var remaining = args.length;

      function res(i, val) {
        try {
          if (val && (typeof val === 'object' || typeof val === 'function')) {
            var then = val.then;
            if (typeof then === 'function') {
              then.call(val, function (val) {
                res(i, val);
              }, reject);
              return;
            }
          }
          args[i] = val;
          if (--remaining === 0) {
            resolve(args);
          }
        } catch (ex) {
          reject(ex);
        }
      }

      for (var i = 0; i < args.length; i++) {
        res(i, args[i]);
      }
    });
  };

  Promise.resolve = function (value) {
    if (value && typeof value === 'object' && value.constructor === Promise) {
      return value;
    }

    return new Promise(function (resolve) {
      resolve(value);
    });
  };

  Promise.reject = function (value) {
    return new Promise(function (resolve, reject) {
      reject(value);
    });
  };

  Promise.race = function (values) {
    return new Promise(function (resolve, reject) {
      for (var i = 0, len = values.length; i < len; i++) {
        values[i].then(resolve, reject);
      }
    });
  };

  // Use polyfill for setImmediate for performance gains
  Promise._immediateFn = (typeof setImmediate === 'function' && function (fn) { setImmediate(fn); }) ||
    function (fn) {
      setTimeoutFunc(fn, 0);
    };

  Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
    if (typeof console !== 'undefined' && console) {
      console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
    }
  };

  /**
   * Set the immediate function to execute callbacks
   * @param fn {function} Function to execute
   * @deprecated
   */
  Promise._setImmediateFn = function _setImmediateFn(fn) {
    Promise._immediateFn = fn;
  };

  /**
   * Change the function to execute on unhandled rejection
   * @param {function} fn Function to execute on unhandled rejection
   * @deprecated
   */
  Promise._setUnhandledRejectionFn = function _setUnhandledRejectionFn(fn) {
    Promise._unhandledRejectionFn = fn;
  };
  
  if ('object' !== 'undefined' && module.exports) {
    module.exports = Promise;
  } else if (!root.Promise) {
    root.Promise = Promise;
  }

})(commonjsGlobal);
});

/**
 * Analyze client useragent
 *   1. detect client type
 *   2. gather necessary information
 */

function ua () {
  var APP = ['eleme', 'napos']
  var OS = ['windows', 'android', 'iphone_os', 'ios']
  var REGX_ID = /^[a-f0-9]{8}-[a-f0-9]{4}-[34][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/
  var REGX_VER = /^(\d+)(?:\.(\d+)|)(?:\.(\d+)|)(?:-(alpha|beta|rc)(\d*)|)(?:-(dev)|)$/
  var UA = navigator.userAgent
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .split(';')[0]
    .split(' ')

  var info = { isClient: false }

  var uaCore = UA.map(function (str) {
    var sp = str.indexOf('/')
    return [ str.substr(0, sp), str.substr(sp + 1) ]
  })
  if (uaCore.length < 5) {
    info.uaNotRecognized = 'INFO_SHORTAGE'
    return info
  }

  var hasRomInfo = uaCore.length >= 6
  if (hasRomInfo) {
    while (uaCore.length > 6) {
      uaCore.splice(4, 1)
    }
  }

  var ref = uaCore.pop();
  var key = ref[0];
  var appId = ref[1];
  if (key !== 'id' || !REGX_ID.test(appId)) {
    info.uaNotRecognized = 'ILLEGAL_APPID'
    return info
  }
  info.id = appId

  var ref$1 = uaCore.pop();
  var appName = ref$1[0];
  var appVersion = ref$1[1];
  if (APP.indexOf(appName) === -1 || !REGX_VER.test(appVersion)) {
    info.uaNotRecognized = 'UNKNOWN_APP'
    return info
  }
  info.app = { name: appName, version: appVersion }

  info.display = hasRomInfo ? uaCore.pop()[1] : null

  var ref$2 = uaCore.pop();
  var osName = ref$2[0];
  var osVersion = ref$2[1];
  if (OS.indexOf(osName) === -1) {
    info.uaNotRecognized = 'UNKNOWN_OS'
    return info
  }
  info.os = {
    name: osName === 'iphone_os' ? 'ios' : osName,
    version: osVersion
  }

  var ref$3 = uaCore.pop();
  var deviceName = ref$3[0];
  var deviceModel = ref$3[1];
  info.device = {
    name: deviceName,
    model: deviceName === 'pc' ? '' : deviceModel
  }

  info.isClient = true
  return info
}

var ua$1 = ua()

function error (condition, message) {
  if (!condition) {
    typeof console !== 'undefined' && console.error(("[eleme-openApi-jssdk] " + message))
  }
}

function isFunction (fn) {
  return typeof fn === 'function'
}

function isObject (obj) {
  return typeof obj === 'object'
}

function generateUTID (oneDirection) {
  if ( oneDirection === void 0 ) oneDirection = false;

  var UTID_CHAR_ARRAY = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('')
  var UTID_CHAR_COUNT = UTID_CHAR_ARRAY.length
  var UTID_LENGTH = 16
  var str = ''
  if (!oneDirection) {
    for (var i = 0; i < UTID_LENGTH; i++) {
      var index = Math.floor(Math.random() * UTID_CHAR_COUNT)
      str += UTID_CHAR_ARRAY[index]
    }
  }
  return str
}

function isNeedleView() {
  return navigator.userAgent.indexOf('NEEDLE') !== -1 || navigator.userAgent.indexOf('Needle') !== -1
}

var FakeNativeApi = function FakeNativeApi () {};

FakeNativeApi.prototype.requestToClient = function requestToClient (requestJson) {
  var request = JSON.parse(requestJson)
  var fnName = request.functionName
  var args = request['arguments']
  var utid = request.utid
  var error = null
  var results = []

  switch (fnName) {
    case 'browser.dismiss':
      window.history.back()
      break

    case 'get':
      switch (args[0]) {
        case 'runtime.topbar.title':
          results = [ window.document.title ]
          break

        case 'runtime.browser.isAppInstalled':
          results = [ true ]
          break

        case 'runtime.auth.ksid':
        case 'runtime.restaurant.restaurantId':
          error = { code: -1, message: 'Unsupported method' }
          break
      }
      break

    case 'set':
      switch (args[0]) {
        case 'runtime.topbar.title':
          if (typeof args[1] != 'string') {
            error = {code: -2, message: 'Invalid argument, #1 should be string'};
          } else {
            window.document.title = args[1];
            results = [true];
          }
          break;
        }
        break;

    default:
      error = { code: -1, message: 'Invalid function name "' + fnName + '"' }
      break
  }

  setTimeout(function () {
    window.__napos__respondToBrowser__({ utid: utid, error: error, results: results })
  }, 200)
};

FakeNativeApi.prototype.respondToClient = function respondToClient () {};

var requestToClient = function () {}
var respondToClient = function () {}
if (!isNeedleView()) {
  if (!ua$1.isClient) {
    var fakeApi = new FakeNativeApi()
    requestToClient = fakeApi.requestToClient.bind(fakeApi)
    respondToClient = fakeApi.respondToClient.bind(fakeApi)
  } else if (ua$1.os.name === 'android') {
    if (isObject(window.__napos__)) {
      if (isFunction(window.__napos__.requestToClient)) {
        requestToClient = window.__napos__.requestToClient.bind(window.__napos__)
      } else {
        error(false, 'cannot detect window.__napos__.requestToClient function')
      }

      if (isFunction(window.__napos__.respondToClient)) {
        respondToClient = window.__napos__.respondToClient.bind(window.__napos__)
      } else {
        error(false, 'cannot detect window.__napos__.respondToClient function')
      }
    } else {
      error(false, 'cannot detect window.__napos__ object')
    }
  } else if (ua$1.os.name === 'ios') {
    var loadUrl = function (scheme, url) {
      var ifr = document.createElement('iframe')
      ifr.setAttribute('src', scheme + '://' + encodeURIComponent(url))
      ifr.setAttribute('style', 'display: none')
      ifr.setAttribute('height', '0px')
      ifr.setAttribute('width', '0px')
      ifr.setAttribute('frameborder', '0')
      document.body.appendChild(ifr)
      ifr.parentNode.removeChild(ifr)
      ifr = null
    }
    requestToClient = loadUrl.bind(null, 'napos-request-to-client')
  }
}

// Native -> Web (Native request, Web response)
var handlers = {}

function doRespondToClient (utid, error, results) {
  respondToClient(JSON.stringify({ utid: utid, error: error, results: results }))
}

if (ua$1.os && ua$1.os.name !== 'windows') {
  window.__napos__requestToBrowser__ = function (request) {
    var functionName = request[0];
    var utid = request[1];
    var handler = handlers[functionName]
    if (isFunction(handler)) {
      var args = request['arguments']
      if (utid) {
        args.push(doRespondToClient.bind(null, utid))
      }
      handler.apply(void 0, args)
    }
  }
}

// Web -> Native (Web request, Native response)
var callbacks = {}

function doRequestToClient (oneDirection, functionName, args, cb) {
  if ( args === void 0 ) args = [];

  var _utid = generateUTID(oneDirection)
  if (!oneDirection && isFunction(cb)) {
    callbacks[_utid] = cb
  }
  requestToClient(JSON.stringify({
    utid: _utid,
    functionName: functionName,
    'arguments': args
  }))
}

if (ua$1.os && ua$1.os.name !== 'windows') {
  window.__napos__respondToBrowser__ = function (respond) {
    var utid = respond.utid;
    var results = respond.results;
    var error = respond.error;
    var cb = callbacks[utid]
    if (isFunction(cb)) {
      var _r = results || []
      cb.apply(void 0, [ error ].concat( _r ))
    }
  }
}

var lib = createCommonjsModule(function (module, exports) {
;(function (root, factory) {
  if (typeof undefined === 'function' && undefined.amd) {
    undefined([], factory);
  } else if ('object' === 'object') {
    module.exports = factory();
  } else {}
}(commonjsGlobal, function () {
  if (typeof weex === 'object') {
    window = {
      navigator: {
        userAgent: weex.config.env.platform + ' Needle/Weex'
      }
    };
  }

  /**
   * @namespace needle
   * @version 0.3.0
   * @global
   * @author hongju.wang@ele.me, jianxiang.jin@ele.me
   */
  var callQueue = [];
  var eventMap = {};
  var stashedEvents = [];

  /**
   * ????????????????????????ndroid?????????
   * @return {Boolean}
   * @function
   * @memberof needle
   * @return {Boolean}
   */
  function isAndroid() {
    var ua = window.navigator.userAgent.toLowerCase();
    return ua.indexOf('android') > -1;
  }

  /**
   * ??????????????????????????? Needle ??????ebView ?????????
   * @return {Boolean}
   * @function
   * @memberof needle
   * @return {Boolean}
   */
  function isNeedle() {
    var ua = window.navigator.userAgent.toLowerCase();
    return ua.indexOf('needle') > -1;
  }

  /**
   * ????????????????????????OS?????????
   * @return {Boolean}
   * @function
   * @memberof needle
   * @return {Boolean}
   */
  function isIOS() {
    var ua = window.navigator.userAgent.toLowerCase();
    return ua.indexOf('iphone') > -1;
  }

  /**
   * ???????????????????????? Weex ?????????
   * @return {Boolean}
   * @function
   * @memberof needle
   * @return {Boolean}
   */
  function isWeex() {
    return typeof weex === 'object';
  }

  if (isWeex()) {
    var globalEvent = weex.requireModule('globalEvent');
    globalEvent.addEventListener('_needleEvent', function (event) {
      var eventName = event.eventName;
      var eventData = event.data;
      if (typeof event.data === 'object') {
        eventData = event.data;
      } else {
        try {
          eventData = JSON.parse(event.data);
        } catch (e) {}
      }
      var callback = eventAndCallbackMap[eventName];
      setTimeout(function () {
        !!callback && callback(eventData);
      }, 0);
    });

    globalEvent.addEventListener('_needleCall', function (event) {
      var response = event.data;
      if (typeof event.data === 'object') {
        response = event.data;
      } else {
        try {
          response = JSON.parse(event.data);
        } catch (e) {}
      }
      var callback = callingAndCallbackMap[response.id];
      response = response.result;
      setTimeout(function () {
        if (!!callback && !!response) {
          if (!!(response.err)) {
            callback(response.err, null);
          } else {
            callback(null, response.res);
          }
        }
        delete callingAndCallbackMap[response.id];
      }, 0);
    });
  }

  // For Android only
  var uniqueId = 0; //???????????????????????? message ID
  var callingAndCallbackMap = {};//???????????????????????????????????????????????????
  var eventAndCallbackMap = {};//?????????????????????????????????????????????????????????????????????
  if (!isWeex()) {
    window.__needleBrowserTunnel = {
      /**
       * read data from Android
       * {id, params, result}
       */
      read: function (responseString) {
        var response = JSON.parse(responseString);
        var callback = callingAndCallbackMap[response.id];
        response = response.result;
        setTimeout(function () {
          if (!!callback && !!response) {
            if (!!(response.err)) {
              callback(response.err, null);
            } else {
              callback(null, response.res);
            }
          }
          delete callingAndCallbackMap[response.id];
        }, 0);
      },
      on: function (eventName, data) {
        /**
         * receive event and event data from Android
         */
        var eventData = data;
        try {
          eventData = JSON.parse(data);
        } catch (e) {
        }
        var callback = eventAndCallbackMap[eventName];
        setTimeout(function () {
          !!callback && callback(eventData);
        }, 0);
      }
    };
  }

  /**
   * ????????????????????????????????????(?????????????????????????????????)
   * @function
   * @memberof needle
   * @param {String} name ??????????????????(???????????????????????????????????????????????????????????????????????????????????????, ???????????????????????????????????? needle ???????????????????????????????????????????????????????????????????????????????????????????????????????????????)
   * @param {Object} params ?????????
   * @param {function} callback ??????????????????, ??????????????????callback(err, res),???????????????????????? err, ???????????????????????????????????? response????????? Node.js ????????????????????????
   */
  function execute(name, params, callback) {
    if (isWeex()) {
      var id = 'msg_' + (uniqueId++) + '_' + new Date().getTime();
      callingAndCallbackMap[id] = callback;
      weex.requireModule('NeedleNativeModule').execute({id: id, name: name, params: params});
      return;
    }

    if (isAndroid() && !!window.__needleClientTunnel) {
      var id = 'msg_' + (uniqueId++) + '_' + new Date().getTime();
      callingAndCallbackMap[id] = callback;
      window.__needleClientTunnel.read(JSON.stringify({id: id, name: name, params: params}));
    } else {
      if (!!window.WebViewJavascriptBridge) {
        _doCall(name, params, callback);
      } else {
        callQueue.push({name: name, params: params, callback: callback});
      }
    }
  }

  /**
   * ?????????????????? ready
   * @function
   * @memberof needle
   * @return {Boolean} true ????????? needle ????????????????????????
   */
  function isReady() {
    return !!window.WebViewJavascriptBridge || !!window.__needleClientTunnel || isWeex();
  }

  function _doCall(name, params, callback) {
    !!window.WebViewJavascriptBridge && window.WebViewJavascriptBridge.callHandler(name, params, function (res) {
      var response = isAndroid() ? JSON.parse(res) : res;
      if (!!callback && !!response) {
        if (!!(response.err)) {
          callback(response.err, null);
        } else {
          callback(null, response.res);
          if (window.__needle__debug) {
            console.log('Plugin name:', name, ', Params:', params, ', Response:', response);
          }
        }
      }
    });
  }

  /**
   * ???????????????????????????
   * @function
   * @memberof needle
   * @param {String} eventName  ??????????????????
   * @param {function} callback ????????????????????????????????????
   */
  function on(eventName, callback) {
    if (isWeex()) {
      eventAndCallbackMap[eventName] = callback;
      return;
    }

    if (isAndroid() && !!window.__needleClientTunnel) {
      eventAndCallbackMap[eventName] = callback;
      return;
    }

    eventMap[eventName] = {eventName: eventName, callback: callback};
    if (!!window.WebViewJavascriptBridge) {
      WebViewJavascriptBridge.registerHandler(eventName, function (data) {
        _doFlushEventListeners(eventName, data);
      });
    } else {
      stashedEvents.push({eventName: eventName, callback: callback});
    }
  }

  function _doFlushEventListeners(eventName, data) {
    var event = eventMap[eventName];
    if (!!event) {
      event.callback(data);
    }
  }

  /**
   * ???????????????????????? API
   *@namespace needle.app
   *@memberof needle
   */
  var app = {
    /**
     * ???????????????????????????
     * @example
     ## ???????????????
     {
       appId : "me.ele.needle",
       appVersion : "1.0",
       buildNumber : 1,
       deviceId : "2146F58E-97A2-4D94-A18A-3C72B6C68BFB",
       platform : enum('Android', 'iOS')
       resolution : 640x1136,
       systemVersion : "10.1",
       networkType : enum('2G', '3G', '4G', 'WIFI', 'UNKNOW'),
       userAgent : "Mozilla/5.0 (iP......
       sdkVersion: '0.1.12'
      }
     * @function
     * @memberof needle.app
     * @param {function} callback ??????????????????
     */
    getEnvInfo: function (callback) {
      execute('needle.app.env', {}, callback);
    },

    /**
     * ????????????????????????????????? APP ??????????????????
     * @function
     * @memberof needle.app
     * @param {Object} param - {package: String, schemeUrl: String}, Android id ?????? package??????OS ?????? schemeUrl
     * @param {function} callback ?????????????????? - res: {isAppInstalled: Boolean}
     */
    isAppInstalled: function (param, callback) {
      execute('needle.app.installation', param, callback);
    },

    /**
     * ???????????????????????????????????????????????????????????????????????????????????????
     * @example
     ##?????????
     var option = {
            tel: 13857702077,
            message: 'this is a needle sms message.'
        };
     needle.app.sendSMS(option,function(err, res){
        if(!err){
           ;
        }
      });
     * @function
     * @memberof needle.app
     * @param {Object} param - {tel: String, message: String}
     * @param {function} callback ??????????????????
     */
    sendSMS: function (param, callback) {
      execute('needle.app.sms', param, callback);
    },

    /**
     * ???????????????????????????
     * @example
     * needle.app.getLocation(function(err, res){
     *   if(!err){
     *      res = {
                "longitude":89.33 ,
                "latitude": 101.11
            }
     *   }
     * });
     * @example
     ##??????????????????
     {
       "longitude":89.33 ,
       "latitude": 101.11
     }
     * @function
     * @memberof needle.app
     * @param {function} callback ??????????????????
     */
    getLocation: function (callback) {
      execute('needle.app.location', {}, callback);
    },

    /**
     * ??????????????? WebView ???????????????????????? Uri
     * @function
     * @example
     * //?????????
     * {
     *   url: "http://www.google.com"
     *   external: true
     * }
     * @memberof needle.app
     * @param {Object} param {url: String, external: Boolean}, external ???????????????????????????????????????????????????
     * @param {function} callback ??????????????????
     */
    openUri: function (param, callback) {
      execute('needle.app.uri', param, callback);
    },

    /**
     * ?????????webview?????????
     * Added: Android: 0.1.2
     * Added: iOS: 0.1.0
     * @function
     * @memberof needle.app
     * @param {function} callback ??????????????????
     */
    clearWebsiteCache: function (callback) {
      execute('needle.app.web.cache.clear', {}, callback);
    }
  };

  /**
   * WebView ???????????????????????????????????????????????????????????????
   *@namespace needle.container
   *@memberof needle
   */
  var container = {
    /**
     * ????????? Toast
     * @example
     ## ?????????
     {
       message: msg,
       duration: 1000,
       offset: 0
     }
     * @function
     * @memberof needle.container
     */
    toast: function (param) {
      execute('needle.container.toast', param, null);
    },

    /**
     * ?????????????????????????????????ative ???????????????
     * @function
     * @memberof needle.container
     */
    close: function () {
      execute('needle.container.window', {type: 'close'}, null);
    },

    /**
     * reload ????????????????????????????????? url
     * @function
     * @example
     ## param ?????????
     {
       url: 'http://www.google.com'
     }
     * @memberof needle.container
     * @param {function} callback ??????????????????
     */
    reload: function (param, callback) {
      var param = param || {};
      param.type = 'reload';
      execute('needle.container.window', param, callback);
    },

    /**
     * ??????????????????????????????
     * @function
     * @memberof needle.container
     * @param {function} callback ??????????????????
     */
    goBack: function (callback) {
      execute('needle.container.window', {type: 'back'}, callback);
    },

    /**
     * ????????? loading
     * @function
     * @memberof needle.container
     */
    showLoading: function () {
      execute('needle.container.loading', {type: 'show'}, null);
    },

    /**
     * ????????? loading
     * @function
     * @memberof needle.container
     */
    hideLoading: function () {
      execute('needle.container.loading', {type: 'hide'}, null);
    },

    /**
     * ????????????????????????????????????
     * @function
     * @example
     ## param ?????????
     {
       title: ???????????????????????????'
     }
     * @memberof needle.container
     * @param param ???????????????
     * @param {function} callback ??????????????????
     */
    setTitle: function (param, callback) {
      var param = param || {};
      param.type = 'set';
      execute('needle.container.title', param, null);
    },

    /**
     * ????????????????????????????????????
     * @function
     * @example
     ## callback res
     "{
       title: '???????????????????????????'
     "}
     * @memberof needle.container
     * @param {function} callback ??????????????????
     */
    getTitle: function (callback) {
      execute('needle.container.title', {type: 'get'}, callback);
    },

    /**
     * ?????????????????????????????????
     * @function
     * @memberof needle.container
     * @param {function} callback ??????????????????
     */
    showTitleBar: function (callback) {
      execute('needle.container.titleBar', {type: 'show'}, callback);
    },

    /**
     * ?????????????????????????????????
     * @function
     * @memberof needle.container
     * @param {function} callback ??????????????????
     */
    hideTitleBar: function (callback) {
      execute('needle.container.titleBar', {type: 'hide'}, callback);
    },

    /**
     * ????????????????????????????????????????????? menu ??????con
     * @function
     * @example
     ## param ?????????
     {
       icon: 'http://icon_url' //
     }
     @example
     ## ??????????????????
     needle.container.registerMenu({ icon: 'http://avatar.csdn.net/7/A/A/1_qq_19711823.jpg'}, function () {
            toast("Menu clicked:");
     });
     * @memberof needle.container
     * @param {Object} param {icon: String}
     * @param {function} onclick menu ?????????????????????????? callback
     */
    registerMenu: function (param, onclick) {
      execute('needle.container.menu', param, null);
      on('needle.container.menu.onclick', onclick);
    },

    /**
     * ??????????????????????????? menu ?????? icon???????????????, key
     * @function
     * @example
     ## param ?????????
     menus: [{
                        icon: '',
                        text: '',
                        key: '' // ??????????????????
                    }]
     ## callback res ?????????
     {
       icon: '',
       text: '',
       key: ''
     }
     * @memberof needle.container
     * @param {Object} param - ???????????????
     * @param {function} callback ??????????????????
     */
    registerBottomMenu: function (param, callback) {
      execute('needle.container.bottomMenu', param, null);
      on('needle.container.bottomMenu.onclick', callback);
    }
  };

  /**
   * ?????????????????????????????????????????????????????? API
   *@namespace needle.image
   *@memberof needle
   */
  var image = {
    /**
     * ??????????????????
     * @example
     ## param ?????????
     {
      type: enum('camera', 'album'),
      options: {
        maxSize: Number, // b, ????????? 1024*50 = 50 Kb
        width: Number,
        height:Number
      }
     }
     @example
     ## callback res ?????????
     {
       base64: 'base64 encode'
     }
     * @function
     * @memberof needle.image
     * @param {Object} param ???????????????
     * @param {function} callback ??????????????????
     */
    pick: function (param, callback) {
      execute('needle.image.picker', param, callback);
    },

    /**
     * ??????????????????
     * @function
     @example
     ## param ?????????
     { images :[{uri: 'uri'}] }
     * @memberof needle.image
     * @param {Object} param { images :[{uri: 'url'}] }
     * @param {function} callback ??????????????????
     */
    preview: function (param, callback) {
      execute('needle.image.previewer', param, callback);
    },

    /**
     * ??????????????????????????????????????????
     * Added: Android 0.1.5
     * Added: iOS ?
     * @function
     @example
     ## param ?????????
     { base64: 'base64 string'}
     * @memberof needle.image
     * @param {Object} param { base64: String}
     * @param {function} callback ??????????????????
     */
    save: function (param, callback) {
      execute('needle.image.save', param, callback);
    }
  };

  /**
   * ????????? WebView ??????????????? K-V ????????? API??????
   * ?????????????????? HOST ??????????????????????????? Cache??????????????? needle.ele.me ?????? needle.elenet.me ?????????????????? Cache??????
   *@namespace needle.cache
   *@memberof needle
   */
  var cache = {
    /**
     * ????????? K-V, ??????????????? key ??????????????????
     * @function
     * @example
     ## param ?????????
     {key: 'key', value: 'value'}
     * @memberof needle.cache
     * @param {Object} param {key: String, value: String}
     * @param {function} callback ??????????????????
     */
    set: function (param, callback) {
      var param = param || {};
      param.method = 'set';
      execute('needle.cache', param, callback);
    },

    /**
     * ????????? key ???????????????
     * @function
     * @example
     ## param ?????????
     {key: 'key'}
     * @memberof needle.cache
     * @param {Object} param {key: String}
     * @param {function} callback ??????????????????
     */
    get: function (param, callback) {
      var param = param || {};
      param.method = 'get';
      execute('needle.cache', param, callback);
    },

    /**
     * delete key ???????????????
     * Added: Android 0.1.3
     * Added: iOS: 0.1.0
     * @function
     * @example
     ## param ?????????
     {key: 'key'}
     * @memberof needle.cache
     * @param {Object} param {key: String}
     * @param {function} callback ??????????????????
     */
    delete: function (param, callback) {
      var param = param || {};
      param.method = 'delete';
      execute('needle.cache', param, callback);
    },

    /**
     * ????????????????????? key ?????????????????????
     * Added: Android 0.1.3
     * Added: iOS: 0.1.0
     * @function
     * @memberof needle.cache
     * @param {function} callback ??????????????????
     */
    deleteAll: function (callback) {
      var param = param || {};
      param.method = 'clear';
      execute('needle.cache', param, callback);
    }
  };

  if (!isWeex()) {
    if (window.WebViewJavascriptBridge) {
      initJS();
    } else {
      // WebViewJavascriptBridgeReady ???????????????????????? WebView ???????????????????????? JavaScript ?????????
      document.addEventListener('WebViewJavascriptBridgeReady', initJS, false);
    }
  }

  function _flushQueue() {
    callQueue.forEach(function (item) {
      _doCall(item.name, item.params, item.callback);
    });
    callQueue = [];
  }

  function _flushEventListener() {
    stashedEvents.forEach(function (event) {
      !!WebViewJavascriptBridge && WebViewJavascriptBridge.registerHandler(event.eventName, function (data) {
        _doFlushEventListeners(event.eventName, data)
      });
    });
    stashedEvents = [];
  }

  function initJS() {
    _flushEventListener();
    _flushQueue();
    var needleReadyEvent = document.createEvent('Events');
    needleReadyEvent.initEvent('needleReady');
    document.dispatchEvent(needleReadyEvent);
  }

  return {
    version: '0.3.0',
    isAndroid: isAndroid,
    isIOS: isIOS,
    isNeedle: isNeedle,
    isWeex: isWeex,
    isReady: isReady,
    execute: execute,
    on: on,
    app: app,
    container: container,
    image: image,
    cache: cache,
  };
}));
});

function versionLowerThen730(version) {
  if (!version || typeof version !== 'string') {
    return true
  }
  // ?????????????????????????????????????????????10,??????????????????????????????????????????
  return parseInt(version.split('.').join('')) < 730
}
var Mobile = function Mobile () {
  this.platform = 'mobile'
  this.isNeddle = isNeedleView()
  this.callbacks = []
};

Mobile.prototype._get = function _get (key, cb) {
  doRequestToClient(false, 'get', [key], cb)
};

Mobile.prototype._set = function _set (key, val, cb) {
  doRequestToClient(false, 'set', [key, val], cb)
};

Mobile.prototype._setUserId = function _setUserId (val, cb) {
    var this$1 = this;

  return new Promise(function (resolve, reject) {
    if (!this$1.isNeddle) {
      this$1._set('runtime.browser.userId', val, function (error, userId) {
        error ? reject(error) : resolve(userId)
      })
    } else {
      this$1.execute('napos.setUserId', val, function(err, res) {
        if (err) {
          reject(err)
        } else {
          resolve(res)
        }
      })
    }
  })
};

Mobile.prototype.execute = function execute (name, params, cb) {
  lib.execute(name, params, cb)
};

// functions expose to third parts
Mobile.prototype.dismiss = function dismiss () {
  doRequestToClient(true, 'browser.dismiss')
};

Mobile.prototype.goForwardWithBrowser = function goForwardWithBrowser (url) {
  doRequestToClient(true, 'browser.goForwardWithBrowser', [ url ])
};

Mobile.prototype.openNaposFileChooser = function openNaposFileChooser (cb) {
  doRequestToClient(false, 'browser.openNaposFileChooser', [], cb)
};

Mobile.prototype.isAppInstalled = function isAppInstalled (packageId, cb) {
  doRequestToClient(false, 'get', [ 'runtime.browser.isAppInstalled', packageId ], cb)
};

Mobile.prototype.printOrder = function printOrder (orderJsonString) {
  doRequestToClient(true, 'browser.printOrder', [ orderJsonString ])
};

Mobile.prototype.picture = function picture (uploadUrl, cb) {
  doRequestToClient(false, 'browser.picture', [ uploadUrl ], cb)
};

Mobile.prototype.hideActionBar = function hideActionBar () {
  doRequestToClient(true, 'browser.hideActionBar')
};

Mobile.prototype.showActionBar = function showActionBar () {
  doRequestToClient(true, 'browser.showActionBar')
};

Mobile.prototype.showToast = function showToast (content) {
  doRequestToClient(true, 'browser.showToast', [ content ])
};

Mobile.prototype.hideLoading = function hideLoading () {
  doRequestToClient(true, 'browser.hideLoading')
};

Mobile.prototype.showLoading = function showLoading () {
  doRequestToClient(true, 'browser.showLoading')
};

Mobile.prototype.getUserId = function getUserId () {
    var this$1 = this;

  return new Promise(function (resolve, reject) {
    if (!this$1.isNeddle) {
      this$1._get('runtime.browser.userId', function (error, userId) {
        error ? reject(error) : resolve(userId)
      })
    } else {
      this$1.execute('napos.getUserId', {}, function(err, res) {
        if (err) {
          reject(err)
        } else {
          resolve(res)
        }
      })
    }
  }) 
};

Mobile.prototype.getCurrentShopId = function getCurrentShopId (cb) {
    var this$1 = this;

  function resolveSync () {
    return (window.__napos__ && window.__napos__.getNaposRSTid) ? window.__napos__.getNaposRSTid() : null
  }
  if (!this.isNeddle) {
    return new Promise(function (resolve, reject) {
      this$1._get('runtime.restaurant.restaurantId', function (error, shopId) {
        error ? resolve(resolveSync()) : resolve(shopId)
      })
    })
  } else {
    return new Promise(function (resolve, reject) {
      this$1.execute('napos.getShopId', {}, function(err, res) {
        if (err) {
          reject(err)
        } else {
          resolve(res)
        }
      })
    })
  }
    
};

Mobile.prototype.setTitle = function setTitle (title) {
  if (!this.isNeddle) {
    this._set('runtime.topbar.title', title)
  } else {
    lib.container.setTitle({title: title})
  }
};

Mobile.prototype.nativeAuth = function nativeAuth (config) {
    var this$1 = this;

  var appinfo = ua$1
  var version = appinfo && appinfo.app && appinfo.app.version
  if (versionLowerThen730(version)) {
    return Promise.reject('???????????????????????????native?????????,???????????????eb??????????????????')
  }
  var keys = ['clientId', 'state', 'redirectUrl', 'scope']
  keys.forEach(function (key) {
    if (!config[key]) {
      throw Error(key + 'can not be empty')
    }
  })
  if (typeof config.isProduction !== 'boolean') {
    throw Error('isProduction must be boolean')
  }
  return new Promise(function (resolve, reject) {
    this$1.execute('napos.native.auth', config, function(err, res) {
      if (err) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
};

// iframe -> melody (message: { utid, type, method, params })
var callbacks$1 = {}
function requestToContainer (method, params) {
  if ( params === void 0 ) params = [];

  var _utid = generateUTID()
  return new Promise(function (resolve, reject) {
    if (window.parent === window) {
      reject('run environment is not iframe!')
    } else {
      window.top.postMessage({
        utid: _utid,
        type: 'jssdk-request',
        method: method,
        params: params
      }, '*')
      callbacks$1[_utid] = {resolve: resolve, reject: reject}
    }
  })
}

if (!ua$1.isClient || (ua$1.os && ua$1.os.name === 'windows')) {
  window.addEventListener('message', function (event) {
    var ref = event.data;
    var utid = ref.utid;
    var type = ref.type;
    var result = ref.result;
    var error = ref.error;
    if (type !== 'jssdk-response') {
      return
    }
    if (callbacks$1[utid]) {
      var ref$1 = callbacks$1[utid];
      var resolve = ref$1.resolve;
      var reject = ref$1.reject;
      if (error) {
        reject(error)
      } else {
        resolve(result)
      }
    }
  }, true)
}

var Pc = function Pc () {
  this.platform = 'pc'
};

Pc.prototype._setAppId = function _setAppId (appId) {
  return requestToContainer('setAppId', appId)
};

// functions expose to third parts
Pc.prototype.getContainerLocation = function getContainerLocation () {
  return requestToContainer('getLocation')
};

Pc.prototype.getUserId = function getUserId () {
  return requestToContainer('getUserId')
};

Pc.prototype.getCurrentShopId = function getCurrentShopId () {
  return requestToContainer('getCurrentShopId')
};

Pc.prototype.getChainRestaurantId = function getChainRestaurantId () {
  return requestToContainer('getChainRestaurantId') 
};

Pc.prototype.getCodeForIdentity = function getCodeForIdentity (params) {
  var keys = ['appKey']
  keys.forEach(function (key) {
    if (!params[key]) {
      throw Error(key + 'can not be empty')
    }
  })
  if (typeof params.isProduction === 'undefined') {
    params.isProduction = true
  }
  return requestToContainer('getCodeForIdentity', params)
};

if (!window.Promise) {
  window.Promise = promise
}
var Client = (ua$1.isClient && ua$1.os && ua$1.os.name !== 'windows') ? Mobile : Pc

var Main = (function (Client) {
  function Main () {
    Client.call(this)
    this.userAgent = ua$1
  }

  if ( Client ) Main.__proto__ = Client;
  Main.prototype = Object.create( Client && Client.prototype );
  Main.prototype.constructor = Main;

  Main.prototype.getUserAgent = function getUserAgent () {
    return this.userAgent
  };

  Main.prototype.hasMethod = function hasMethod (methodName) {
    return !!this[methodName]
  };

  return Main;
}(Client));

var main = new Main()

// delete developer's private functions
var _proto = Object.getPrototypeOf(main)
for (var key in _proto) {
  if (key.charAt(0) === '_') {
    delete _proto[key]
  }
}

window.eleme = main