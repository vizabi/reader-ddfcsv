var DDFCsvReader =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", { value: true });
	var frontend_file_reader_1 = __webpack_require__(1);
	var frontend_file_reader_2 = __webpack_require__(1);
	exports.FrontendFileReader = frontend_file_reader_2.FrontendFileReader;
	var ddfcsv_error_1 = __webpack_require__(3);
	exports.DdfCsvError = ddfcsv_error_1.DdfCsvError;
	var ddfcsv_reader_1 = __webpack_require__(4);
	exports.getDDFCsvReaderObject = ddfcsv_reader_1.prepareDDFCsvReaderObject(new frontend_file_reader_1.FrontendFileReader());
	//# sourceMappingURL=index-web.js.map

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	Object.defineProperty(exports, "__esModule", { value: true });
	__webpack_require__(2);
	
	var FrontendFileReader = function () {
	    function FrontendFileReader() {
	        _classCallCheck(this, FrontendFileReader);
	    }
	
	    _createClass(FrontendFileReader, [{
	        key: "setRecordTransformer",
	        value: function setRecordTransformer(recordTransformer) {
	            this.recordTransformer = recordTransformer;
	        }
	    }, {
	        key: "readText",
	        value: function readText(filePath, onFileRead) {
	            fetch(filePath).then(function (response) {
	                return response.text();
	            }).then(function (text) {
	                onFileRead(null, text);
	            }).catch(function (err) {
	                onFileRead(err || filePath + " read error");
	            });
	        }
	    }]);
	
	    return FrontendFileReader;
	}();
	
	exports.FrontendFileReader = FrontendFileReader;
	//# sourceMappingURL=frontend-file-reader.js.map

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';
	
	(function () {
	  'use strict';
	
	  if (self.fetch) {
	    return;
	  }
	
	  function normalizeName(name) {
	    if (typeof name !== 'string') {
	      name = name.toString();
	    }
	    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
	      throw new TypeError('Invalid character in header field name');
	    }
	    return name.toLowerCase();
	  }
	
	  function normalizeValue(value) {
	    if (typeof value !== 'string') {
	      value = value.toString();
	    }
	    return value;
	  }
	
	  function Headers(headers) {
	    this.map = {};
	
	    var self = this;
	    if (headers instanceof Headers) {
	      headers.forEach(function (name, values) {
	        values.forEach(function (value) {
	          self.append(name, value);
	        });
	      });
	    } else if (headers) {
	      Object.getOwnPropertyNames(headers).forEach(function (name) {
	        self.append(name, headers[name]);
	      });
	    }
	  }
	
	  Headers.prototype.append = function (name, value) {
	    name = normalizeName(name);
	    value = normalizeValue(value);
	    var list = this.map[name];
	    if (!list) {
	      list = [];
	      this.map[name] = list;
	    }
	    list.push(value);
	  };
	
	  Headers.prototype['delete'] = function (name) {
	    delete this.map[normalizeName(name)];
	  };
	
	  Headers.prototype.get = function (name) {
	    var values = this.map[normalizeName(name)];
	    return values ? values[0] : null;
	  };
	
	  Headers.prototype.getAll = function (name) {
	    return this.map[normalizeName(name)] || [];
	  };
	
	  Headers.prototype.has = function (name) {
	    return this.map.hasOwnProperty(normalizeName(name));
	  };
	
	  Headers.prototype.set = function (name, value) {
	    this.map[normalizeName(name)] = [normalizeValue(value)];
	  };
	
	  // Instead of iterable for now.
	  Headers.prototype.forEach = function (callback) {
	    var self = this;
	    Object.getOwnPropertyNames(this.map).forEach(function (name) {
	      callback(name, self.map[name]);
	    });
	  };
	
	  function consumed(body) {
	    if (body.bodyUsed) {
	      return fetch.Promise.reject(new TypeError('Already read'));
	    }
	    body.bodyUsed = true;
	  }
	
	  function fileReaderReady(reader) {
	    return new fetch.Promise(function (resolve, reject) {
	      reader.onload = function () {
	        resolve(reader.result);
	      };
	      reader.onerror = function () {
	        reject(reader.error);
	      };
	    });
	  }
	
	  function readBlobAsArrayBuffer(blob) {
	    var reader = new FileReader();
	    reader.readAsArrayBuffer(blob);
	    return fileReaderReady(reader);
	  }
	
	  function readBlobAsText(blob) {
	    var reader = new FileReader();
	    reader.readAsText(blob);
	    return fileReaderReady(reader);
	  }
	
	  var support = {
	    blob: 'FileReader' in self && 'Blob' in self && function () {
	      try {
	        new Blob();
	        return true;
	      } catch (e) {
	        return false;
	      }
	    }(),
	    formData: 'FormData' in self
	  };
	
	  function Body() {
	    this.bodyUsed = false;
	
	    this._initBody = function (body) {
	      this._bodyInit = body;
	      if (typeof body === 'string') {
	        this._bodyText = body;
	      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
	        this._bodyBlob = body;
	      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
	        this._bodyFormData = body;
	      } else if (!body) {
	        this._bodyText = '';
	      } else {
	        throw new Error('unsupported BodyInit type');
	      }
	    };
	
	    if (support.blob) {
	      this.blob = function () {
	        var rejected = consumed(this);
	        if (rejected) {
	          return rejected;
	        }
	
	        if (this._bodyBlob) {
	          return fetch.Promise.resolve(this._bodyBlob);
	        } else if (this._bodyFormData) {
	          throw new Error('could not read FormData body as blob');
	        } else {
	          return fetch.Promise.resolve(new Blob([this._bodyText]));
	        }
	      };
	
	      this.arrayBuffer = function () {
	        return this.blob().then(readBlobAsArrayBuffer);
	      };
	
	      this.text = function () {
	        var rejected = consumed(this);
	        if (rejected) {
	          return rejected;
	        }
	
	        if (this._bodyBlob) {
	          return readBlobAsText(this._bodyBlob);
	        } else if (this._bodyFormData) {
	          throw new Error('could not read FormData body as text');
	        } else {
	          return fetch.Promise.resolve(this._bodyText);
	        }
	      };
	    } else {
	      this.text = function () {
	        var rejected = consumed(this);
	        return rejected ? rejected : fetch.Promise.resolve(this._bodyText);
	      };
	    }
	
	    if (support.formData) {
	      this.formData = function () {
	        return this.text().then(decode);
	      };
	    }
	
	    this.json = function () {
	      return this.text().then(function (text) {
	        return JSON.parse(text);
	      });
	    };
	
	    return this;
	  }
	
	  // HTTP methods whose capitalization should be normalized
	  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];
	
	  function normalizeMethod(method) {
	    var upcased = method.toUpperCase();
	    return methods.indexOf(upcased) > -1 ? upcased : method;
	  }
	
	  function Request(url, options) {
	    options = options || {};
	    this.url = url;
	
	    this.credentials = options.credentials || 'omit';
	    this.headers = new Headers(options.headers);
	    this.method = normalizeMethod(options.method || 'GET');
	    this.mode = options.mode || null;
	    this.referrer = null;
	
	    if ((this.method === 'GET' || this.method === 'HEAD') && options.body) {
	      throw new TypeError('Body not allowed for GET or HEAD requests');
	    }
	    this._initBody(options.body);
	  }
	
	  function decode(body) {
	    var form = new FormData();
	    body.trim().split('&').forEach(function (bytes) {
	      if (bytes) {
	        var split = bytes.split('=');
	        var name = split.shift().replace(/\+/g, ' ');
	        var value = split.join('=').replace(/\+/g, ' ');
	        form.append(decodeURIComponent(name), decodeURIComponent(value));
	      }
	    });
	    return form;
	  }
	
	  function headers(xhr) {
	    var head = new Headers();
	    var pairs = xhr.getAllResponseHeaders().trim().split('\n');
	    pairs.forEach(function (header) {
	      var split = header.trim().split(':');
	      var key = split.shift().trim();
	      var value = split.join(':').trim();
	      head.append(key, value);
	    });
	    return head;
	  }
	
	  var noXhrPatch = typeof window !== 'undefined' && !!window.ActiveXObject && !(window.XMLHttpRequest && new XMLHttpRequest().dispatchEvent);
	
	  function getXhr() {
	    // from backbone.js 1.1.2
	    // https://github.com/jashkenas/backbone/blob/1.1.2/backbone.js#L1181
	    if (noXhrPatch && !/^(get|post|head|put|delete|options)$/i.test(this.method)) {
	      this.usingActiveXhr = true;
	      return new ActiveXObject("Microsoft.XMLHTTP");
	    }
	    return new XMLHttpRequest();
	  }
	
	  Body.call(Request.prototype);
	
	  function Response(bodyInit, options) {
	    if (!options) {
	      options = {};
	    }
	
	    this._initBody(bodyInit);
	    this.type = 'default';
	    this.url = null;
	    this.status = options.status;
	    this.ok = this.status >= 200 && this.status < 300;
	    this.statusText = options.statusText;
	    this.headers = options.headers instanceof Headers ? options.headers : new Headers(options.headers);
	    this.url = options.url || '';
	  }
	
	  Body.call(Response.prototype);
	
	  self.Headers = Headers;
	  self.Request = Request;
	  self.Response = Response;
	
	  self.fetch = function (input, init) {
	    // TODO: Request constructor should accept input, init
	    var request;
	    if (Request.prototype.isPrototypeOf(input) && !init) {
	      request = input;
	    } else {
	      request = new Request(input, init);
	    }
	
	    return new fetch.Promise(function (resolve, reject) {
	      var xhr = getXhr();
	      if (request.credentials === 'cors') {
	        xhr.withCredentials = true;
	      }
	
	      function responseURL() {
	        if ('responseURL' in xhr) {
	          return xhr.responseURL;
	        }
	
	        // Avoid security warnings on getResponseHeader when not allowed by CORS
	        if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
	          return xhr.getResponseHeader('X-Request-URL');
	        }
	
	        return;
	      }
	
	      function onload() {
	        if (xhr.readyState !== 4) {
	          return;
	        }
	        var status = xhr.status === 1223 ? 204 : xhr.status;
	        if (status < 100 || status > 599) {
	          reject(new TypeError('Network request failed'));
	          return;
	        }
	        var options = {
	          status: status,
	          statusText: xhr.statusText,
	          headers: headers(xhr),
	          url: responseURL()
	        };
	        var body = 'response' in xhr ? xhr.response : xhr.responseText;
	        resolve(new Response(body, options));
	      }
	      xhr.onreadystatechange = onload;
	      if (!self.usingActiveXhr) {
	        xhr.onload = onload;
	        xhr.onerror = function () {
	          reject(new TypeError('Network request failed'));
	        };
	      }
	
	      xhr.open(request.method, request.url, true);
	
	      if ('responseType' in xhr && support.blob) {
	        xhr.responseType = 'blob';
	      }
	
	      request.headers.forEach(function (name, values) {
	        values.forEach(function (value) {
	          xhr.setRequestHeader(name, value);
	        });
	      });
	
	      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
	    });
	  };
	  fetch.Promise = self.Promise; // you could change it to your favorite alternative
	  self.fetch.polyfill = true;
	})();

/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.FILE_READING_ERROR = 'File reading error';
	exports.JSON_PARSING_ERROR = 'JSON parsing error';
	exports.CSV_PARSING_ERROR = 'CSV parsing error';
	exports.DDF_ERROR = 'DDF error';
	
	var DdfCsvError = function (_Error) {
	    _inherits(DdfCsvError, _Error);
	
	    function DdfCsvError(message, details, file) {
	        _classCallCheck(this, DdfCsvError);
	
	        var _this = _possibleConstructorReturn(this, (DdfCsvError.__proto__ || Object.getPrototypeOf(DdfCsvError)).call(this));
	
	        _this.details = details;
	        _this.file = file;
	        _this.name = 'DdfCsvError';
	        _this.message = message;
	        _this.details = details;
	        _this.file = file;
	        return _this;
	    }
	
	    return DdfCsvError;
	}(Error);
	
	exports.DdfCsvError = DdfCsvError;
	//# sourceMappingURL=ddfcsv-error.js.map

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", { value: true });
	var Promise = __webpack_require__(5);
	var ddf_csv_1 = __webpack_require__(44);
	function prepareDDFCsvReaderObject(defaultFileReader) {
	    return function (externalFileReader, logger) {
	        return {
	            init: function init(readerInfo) {
	                this._basepath = readerInfo.path;
	                this._lastModified = readerInfo._lastModified;
	                this.fileReader = externalFileReader || defaultFileReader;
	                this.logger = logger;
	                this.resultTransformer = readerInfo.resultTransformer;
	                this.reader = ddf_csv_1.ddfCsvReader(this._basepath + "/datapackage.json", this.fileReader, this.logger);
	            },
	            getAsset: function getAsset(asset) {
	                var _this = this;
	
	                var isJsonAsset = asset.slice(-'.json'.length) === '.json';
	                return new Promise(function (resolve, reject) {
	                    _this.fileReader.readText(_this._basepath + "/" + asset, function (err, data) {
	                        if (err) {
	                            reject(err);
	                            return;
	                        }
	                        if (isJsonAsset) {
	                            try {
	                                resolve(JSON.parse(data));
	                            } catch (jsonErr) {
	                                reject(err);
	                            }
	                        } else {
	                            resolve(data);
	                        }
	                    });
	                });
	            },
	            read: function read(queryPar, parsers) {
	                var _this2 = this;
	
	                function prettifyData(data) {
	                    return data.map(function (record) {
	                        var keys = Object.keys(record);
	                        keys.forEach(function (key) {
	                            if (parsers[key]) {
	                                record[key] = parsers[key](record[key]);
	                            }
	                        });
	                        return record;
	                    });
	                }
	                return this.reader.query(queryPar).then(function (result) {
	                    result = parsers ? prettifyData(result) : result;
	                    if (_this2.resultTransformer) {
	                        result = _this2.resultTransformer(result);
	                    }
	                    if (_this2.logger && _this2.logger.log) {
	                        logger.log(JSON.stringify(queryPar), result.length);
	                        logger.log(result);
	                    }
	                    return result;
	                });
	            }
	        };
	    };
	}
	exports.prepareDDFCsvReaderObject = prepareDDFCsvReaderObject;
	//# sourceMappingURL=ddfcsv-reader.js.map

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var old;
	if (typeof Promise !== "undefined") old = Promise;
	function noConflict() {
	    try {
	        if (Promise === bluebird) Promise = old;
	    } catch (e) {}
	    return bluebird;
	}
	var bluebird = __webpack_require__(6)();
	bluebird.noConflict = noConflict;
	module.exports = bluebird;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {"use strict";
	
	module.exports = function () {
	    var makeSelfResolutionError = function makeSelfResolutionError() {
	        return new TypeError("circular promise resolution chain\n\n    See http://goo.gl/MqrFmX\n");
	    };
	    var reflectHandler = function reflectHandler() {
	        return new Promise.PromiseInspection(this._target());
	    };
	    var apiRejection = function apiRejection(msg) {
	        return Promise.reject(new TypeError(msg));
	    };
	    function Proxyable() {}
	    var UNDEFINED_BINDING = {};
	    var util = __webpack_require__(8);
	
	    var getDomain;
	    if (util.isNode) {
	        getDomain = function getDomain() {
	            var ret = process.domain;
	            if (ret === undefined) ret = null;
	            return ret;
	        };
	    } else {
	        getDomain = function getDomain() {
	            return null;
	        };
	    }
	    util.notEnumerableProp(Promise, "_getDomain", getDomain);
	
	    var es5 = __webpack_require__(9);
	    var Async = __webpack_require__(10);
	    var async = new Async();
	    es5.defineProperty(Promise, "_async", { value: async });
	    var errors = __webpack_require__(15);
	    var TypeError = Promise.TypeError = errors.TypeError;
	    Promise.RangeError = errors.RangeError;
	    var CancellationError = Promise.CancellationError = errors.CancellationError;
	    Promise.TimeoutError = errors.TimeoutError;
	    Promise.OperationalError = errors.OperationalError;
	    Promise.RejectionError = errors.OperationalError;
	    Promise.AggregateError = errors.AggregateError;
	    var INTERNAL = function INTERNAL() {};
	    var APPLY = {};
	    var NEXT_FILTER = {};
	    var tryConvertToPromise = __webpack_require__(16)(Promise, INTERNAL);
	    var PromiseArray = __webpack_require__(17)(Promise, INTERNAL, tryConvertToPromise, apiRejection, Proxyable);
	    var Context = __webpack_require__(18)(Promise);
	    /*jshint unused:false*/
	    var createContext = Context.create;
	    var debug = __webpack_require__(19)(Promise, Context);
	    var CapturedTrace = debug.CapturedTrace;
	    var PassThroughHandlerContext = __webpack_require__(20)(Promise, tryConvertToPromise, NEXT_FILTER);
	    var catchFilter = __webpack_require__(21)(NEXT_FILTER);
	    var nodebackForPromise = __webpack_require__(22);
	    var errorObj = util.errorObj;
	    var tryCatch = util.tryCatch;
	    function check(self, executor) {
	        if (self == null || self.constructor !== Promise) {
	            throw new TypeError("the promise constructor cannot be invoked directly\n\n    See http://goo.gl/MqrFmX\n");
	        }
	        if (typeof executor !== "function") {
	            throw new TypeError("expecting a function but got " + util.classString(executor));
	        }
	    }
	
	    function Promise(executor) {
	        if (executor !== INTERNAL) {
	            check(this, executor);
	        }
	        this._bitField = 0;
	        this._fulfillmentHandler0 = undefined;
	        this._rejectionHandler0 = undefined;
	        this._promise0 = undefined;
	        this._receiver0 = undefined;
	        this._resolveFromExecutor(executor);
	        this._promiseCreated();
	        this._fireEvent("promiseCreated", this);
	    }
	
	    Promise.prototype.toString = function () {
	        return "[object Promise]";
	    };
	
	    Promise.prototype.caught = Promise.prototype["catch"] = function (fn) {
	        var len = arguments.length;
	        if (len > 1) {
	            var catchInstances = new Array(len - 1),
	                j = 0,
	                i;
	            for (i = 0; i < len - 1; ++i) {
	                var item = arguments[i];
	                if (util.isObject(item)) {
	                    catchInstances[j++] = item;
	                } else {
	                    return apiRejection("Catch statement predicate: " + "expecting an object but got " + util.classString(item));
	                }
	            }
	            catchInstances.length = j;
	            fn = arguments[i];
	            return this.then(undefined, catchFilter(catchInstances, fn, this));
	        }
	        return this.then(undefined, fn);
	    };
	
	    Promise.prototype.reflect = function () {
	        return this._then(reflectHandler, reflectHandler, undefined, this, undefined);
	    };
	
	    Promise.prototype.then = function (didFulfill, didReject) {
	        if (debug.warnings() && arguments.length > 0 && typeof didFulfill !== "function" && typeof didReject !== "function") {
	            var msg = ".then() only accepts functions but was passed: " + util.classString(didFulfill);
	            if (arguments.length > 1) {
	                msg += ", " + util.classString(didReject);
	            }
	            this._warn(msg);
	        }
	        return this._then(didFulfill, didReject, undefined, undefined, undefined);
	    };
	
	    Promise.prototype.done = function (didFulfill, didReject) {
	        var promise = this._then(didFulfill, didReject, undefined, undefined, undefined);
	        promise._setIsFinal();
	    };
	
	    Promise.prototype.spread = function (fn) {
	        if (typeof fn !== "function") {
	            return apiRejection("expecting a function but got " + util.classString(fn));
	        }
	        return this.all()._then(fn, undefined, undefined, APPLY, undefined);
	    };
	
	    Promise.prototype.toJSON = function () {
	        var ret = {
	            isFulfilled: false,
	            isRejected: false,
	            fulfillmentValue: undefined,
	            rejectionReason: undefined
	        };
	        if (this.isFulfilled()) {
	            ret.fulfillmentValue = this.value();
	            ret.isFulfilled = true;
	        } else if (this.isRejected()) {
	            ret.rejectionReason = this.reason();
	            ret.isRejected = true;
	        }
	        return ret;
	    };
	
	    Promise.prototype.all = function () {
	        if (arguments.length > 0) {
	            this._warn(".all() was passed arguments but it does not take any");
	        }
	        return new PromiseArray(this).promise();
	    };
	
	    Promise.prototype.error = function (fn) {
	        return this.caught(util.originatesFromRejection, fn);
	    };
	
	    Promise.getNewLibraryCopy = module.exports;
	
	    Promise.is = function (val) {
	        return val instanceof Promise;
	    };
	
	    Promise.fromNode = Promise.fromCallback = function (fn) {
	        var ret = new Promise(INTERNAL);
	        ret._captureStackTrace();
	        var multiArgs = arguments.length > 1 ? !!Object(arguments[1]).multiArgs : false;
	        var result = tryCatch(fn)(nodebackForPromise(ret, multiArgs));
	        if (result === errorObj) {
	            ret._rejectCallback(result.e, true);
	        }
	        if (!ret._isFateSealed()) ret._setAsyncGuaranteed();
	        return ret;
	    };
	
	    Promise.all = function (promises) {
	        return new PromiseArray(promises).promise();
	    };
	
	    Promise.cast = function (obj) {
	        var ret = tryConvertToPromise(obj);
	        if (!(ret instanceof Promise)) {
	            ret = new Promise(INTERNAL);
	            ret._captureStackTrace();
	            ret._setFulfilled();
	            ret._rejectionHandler0 = obj;
	        }
	        return ret;
	    };
	
	    Promise.resolve = Promise.fulfilled = Promise.cast;
	
	    Promise.reject = Promise.rejected = function (reason) {
	        var ret = new Promise(INTERNAL);
	        ret._captureStackTrace();
	        ret._rejectCallback(reason, true);
	        return ret;
	    };
	
	    Promise.setScheduler = function (fn) {
	        if (typeof fn !== "function") {
	            throw new TypeError("expecting a function but got " + util.classString(fn));
	        }
	        return async.setScheduler(fn);
	    };
	
	    Promise.prototype._then = function (didFulfill, didReject, _, receiver, internalData) {
	        var haveInternalData = internalData !== undefined;
	        var promise = haveInternalData ? internalData : new Promise(INTERNAL);
	        var target = this._target();
	        var bitField = target._bitField;
	
	        if (!haveInternalData) {
	            promise._propagateFrom(this, 3);
	            promise._captureStackTrace();
	            if (receiver === undefined && (this._bitField & 2097152) !== 0) {
	                if (!((bitField & 50397184) === 0)) {
	                    receiver = this._boundValue();
	                } else {
	                    receiver = target === this ? undefined : this._boundTo;
	                }
	            }
	            this._fireEvent("promiseChained", this, promise);
	        }
	
	        var domain = getDomain();
	        if (!((bitField & 50397184) === 0)) {
	            var handler,
	                value,
	                settler = target._settlePromiseCtx;
	            if ((bitField & 33554432) !== 0) {
	                value = target._rejectionHandler0;
	                handler = didFulfill;
	            } else if ((bitField & 16777216) !== 0) {
	                value = target._fulfillmentHandler0;
	                handler = didReject;
	                target._unsetRejectionIsUnhandled();
	            } else {
	                settler = target._settlePromiseLateCancellationObserver;
	                value = new CancellationError("late cancellation observer");
	                target._attachExtraTrace(value);
	                handler = didReject;
	            }
	
	            async.invoke(settler, target, {
	                handler: domain === null ? handler : typeof handler === "function" && util.domainBind(domain, handler),
	                promise: promise,
	                receiver: receiver,
	                value: value
	            });
	        } else {
	            target._addCallbacks(didFulfill, didReject, promise, receiver, domain);
	        }
	
	        return promise;
	    };
	
	    Promise.prototype._length = function () {
	        return this._bitField & 65535;
	    };
	
	    Promise.prototype._isFateSealed = function () {
	        return (this._bitField & 117506048) !== 0;
	    };
	
	    Promise.prototype._isFollowing = function () {
	        return (this._bitField & 67108864) === 67108864;
	    };
	
	    Promise.prototype._setLength = function (len) {
	        this._bitField = this._bitField & -65536 | len & 65535;
	    };
	
	    Promise.prototype._setFulfilled = function () {
	        this._bitField = this._bitField | 33554432;
	        this._fireEvent("promiseFulfilled", this);
	    };
	
	    Promise.prototype._setRejected = function () {
	        this._bitField = this._bitField | 16777216;
	        this._fireEvent("promiseRejected", this);
	    };
	
	    Promise.prototype._setFollowing = function () {
	        this._bitField = this._bitField | 67108864;
	        this._fireEvent("promiseResolved", this);
	    };
	
	    Promise.prototype._setIsFinal = function () {
	        this._bitField = this._bitField | 4194304;
	    };
	
	    Promise.prototype._isFinal = function () {
	        return (this._bitField & 4194304) > 0;
	    };
	
	    Promise.prototype._unsetCancelled = function () {
	        this._bitField = this._bitField & ~65536;
	    };
	
	    Promise.prototype._setCancelled = function () {
	        this._bitField = this._bitField | 65536;
	        this._fireEvent("promiseCancelled", this);
	    };
	
	    Promise.prototype._setWillBeCancelled = function () {
	        this._bitField = this._bitField | 8388608;
	    };
	
	    Promise.prototype._setAsyncGuaranteed = function () {
	        if (async.hasCustomScheduler()) return;
	        this._bitField = this._bitField | 134217728;
	    };
	
	    Promise.prototype._receiverAt = function (index) {
	        var ret = index === 0 ? this._receiver0 : this[index * 4 - 4 + 3];
	        if (ret === UNDEFINED_BINDING) {
	            return undefined;
	        } else if (ret === undefined && this._isBound()) {
	            return this._boundValue();
	        }
	        return ret;
	    };
	
	    Promise.prototype._promiseAt = function (index) {
	        return this[index * 4 - 4 + 2];
	    };
	
	    Promise.prototype._fulfillmentHandlerAt = function (index) {
	        return this[index * 4 - 4 + 0];
	    };
	
	    Promise.prototype._rejectionHandlerAt = function (index) {
	        return this[index * 4 - 4 + 1];
	    };
	
	    Promise.prototype._boundValue = function () {};
	
	    Promise.prototype._migrateCallback0 = function (follower) {
	        var bitField = follower._bitField;
	        var fulfill = follower._fulfillmentHandler0;
	        var reject = follower._rejectionHandler0;
	        var promise = follower._promise0;
	        var receiver = follower._receiverAt(0);
	        if (receiver === undefined) receiver = UNDEFINED_BINDING;
	        this._addCallbacks(fulfill, reject, promise, receiver, null);
	    };
	
	    Promise.prototype._migrateCallbackAt = function (follower, index) {
	        var fulfill = follower._fulfillmentHandlerAt(index);
	        var reject = follower._rejectionHandlerAt(index);
	        var promise = follower._promiseAt(index);
	        var receiver = follower._receiverAt(index);
	        if (receiver === undefined) receiver = UNDEFINED_BINDING;
	        this._addCallbacks(fulfill, reject, promise, receiver, null);
	    };
	
	    Promise.prototype._addCallbacks = function (fulfill, reject, promise, receiver, domain) {
	        var index = this._length();
	
	        if (index >= 65535 - 4) {
	            index = 0;
	            this._setLength(0);
	        }
	
	        if (index === 0) {
	            this._promise0 = promise;
	            this._receiver0 = receiver;
	            if (typeof fulfill === "function") {
	                this._fulfillmentHandler0 = domain === null ? fulfill : util.domainBind(domain, fulfill);
	            }
	            if (typeof reject === "function") {
	                this._rejectionHandler0 = domain === null ? reject : util.domainBind(domain, reject);
	            }
	        } else {
	            var base = index * 4 - 4;
	            this[base + 2] = promise;
	            this[base + 3] = receiver;
	            if (typeof fulfill === "function") {
	                this[base + 0] = domain === null ? fulfill : util.domainBind(domain, fulfill);
	            }
	            if (typeof reject === "function") {
	                this[base + 1] = domain === null ? reject : util.domainBind(domain, reject);
	            }
	        }
	        this._setLength(index + 1);
	        return index;
	    };
	
	    Promise.prototype._proxy = function (proxyable, arg) {
	        this._addCallbacks(undefined, undefined, arg, proxyable, null);
	    };
	
	    Promise.prototype._resolveCallback = function (value, shouldBind) {
	        if ((this._bitField & 117506048) !== 0) return;
	        if (value === this) return this._rejectCallback(makeSelfResolutionError(), false);
	        var maybePromise = tryConvertToPromise(value, this);
	        if (!(maybePromise instanceof Promise)) return this._fulfill(value);
	
	        if (shouldBind) this._propagateFrom(maybePromise, 2);
	
	        var promise = maybePromise._target();
	
	        if (promise === this) {
	            this._reject(makeSelfResolutionError());
	            return;
	        }
	
	        var bitField = promise._bitField;
	        if ((bitField & 50397184) === 0) {
	            var len = this._length();
	            if (len > 0) promise._migrateCallback0(this);
	            for (var i = 1; i < len; ++i) {
	                promise._migrateCallbackAt(this, i);
	            }
	            this._setFollowing();
	            this._setLength(0);
	            this._setFollowee(promise);
	        } else if ((bitField & 33554432) !== 0) {
	            this._fulfill(promise._value());
	        } else if ((bitField & 16777216) !== 0) {
	            this._reject(promise._reason());
	        } else {
	            var reason = new CancellationError("late cancellation observer");
	            promise._attachExtraTrace(reason);
	            this._reject(reason);
	        }
	    };
	
	    Promise.prototype._rejectCallback = function (reason, synchronous, ignoreNonErrorWarnings) {
	        var trace = util.ensureErrorObject(reason);
	        var hasStack = trace === reason;
	        if (!hasStack && !ignoreNonErrorWarnings && debug.warnings()) {
	            var message = "a promise was rejected with a non-error: " + util.classString(reason);
	            this._warn(message, true);
	        }
	        this._attachExtraTrace(trace, synchronous ? hasStack : false);
	        this._reject(reason);
	    };
	
	    Promise.prototype._resolveFromExecutor = function (executor) {
	        if (executor === INTERNAL) return;
	        var promise = this;
	        this._captureStackTrace();
	        this._pushContext();
	        var synchronous = true;
	        var r = this._execute(executor, function (value) {
	            promise._resolveCallback(value);
	        }, function (reason) {
	            promise._rejectCallback(reason, synchronous);
	        });
	        synchronous = false;
	        this._popContext();
	
	        if (r !== undefined) {
	            promise._rejectCallback(r, true);
	        }
	    };
	
	    Promise.prototype._settlePromiseFromHandler = function (handler, receiver, value, promise) {
	        var bitField = promise._bitField;
	        if ((bitField & 65536) !== 0) return;
	        promise._pushContext();
	        var x;
	        if (receiver === APPLY) {
	            if (!value || typeof value.length !== "number") {
	                x = errorObj;
	                x.e = new TypeError("cannot .spread() a non-array: " + util.classString(value));
	            } else {
	                x = tryCatch(handler).apply(this._boundValue(), value);
	            }
	        } else {
	            x = tryCatch(handler).call(receiver, value);
	        }
	        var promiseCreated = promise._popContext();
	        bitField = promise._bitField;
	        if ((bitField & 65536) !== 0) return;
	
	        if (x === NEXT_FILTER) {
	            promise._reject(value);
	        } else if (x === errorObj) {
	            promise._rejectCallback(x.e, false);
	        } else {
	            debug.checkForgottenReturns(x, promiseCreated, "", promise, this);
	            promise._resolveCallback(x);
	        }
	    };
	
	    Promise.prototype._target = function () {
	        var ret = this;
	        while (ret._isFollowing()) {
	            ret = ret._followee();
	        }return ret;
	    };
	
	    Promise.prototype._followee = function () {
	        return this._rejectionHandler0;
	    };
	
	    Promise.prototype._setFollowee = function (promise) {
	        this._rejectionHandler0 = promise;
	    };
	
	    Promise.prototype._settlePromise = function (promise, handler, receiver, value) {
	        var isPromise = promise instanceof Promise;
	        var bitField = this._bitField;
	        var asyncGuaranteed = (bitField & 134217728) !== 0;
	        if ((bitField & 65536) !== 0) {
	            if (isPromise) promise._invokeInternalOnCancel();
	
	            if (receiver instanceof PassThroughHandlerContext && receiver.isFinallyHandler()) {
	                receiver.cancelPromise = promise;
	                if (tryCatch(handler).call(receiver, value) === errorObj) {
	                    promise._reject(errorObj.e);
	                }
	            } else if (handler === reflectHandler) {
	                promise._fulfill(reflectHandler.call(receiver));
	            } else if (receiver instanceof Proxyable) {
	                receiver._promiseCancelled(promise);
	            } else if (isPromise || promise instanceof PromiseArray) {
	                promise._cancel();
	            } else {
	                receiver.cancel();
	            }
	        } else if (typeof handler === "function") {
	            if (!isPromise) {
	                handler.call(receiver, value, promise);
	            } else {
	                if (asyncGuaranteed) promise._setAsyncGuaranteed();
	                this._settlePromiseFromHandler(handler, receiver, value, promise);
	            }
	        } else if (receiver instanceof Proxyable) {
	            if (!receiver._isResolved()) {
	                if ((bitField & 33554432) !== 0) {
	                    receiver._promiseFulfilled(value, promise);
	                } else {
	                    receiver._promiseRejected(value, promise);
	                }
	            }
	        } else if (isPromise) {
	            if (asyncGuaranteed) promise._setAsyncGuaranteed();
	            if ((bitField & 33554432) !== 0) {
	                promise._fulfill(value);
	            } else {
	                promise._reject(value);
	            }
	        }
	    };
	
	    Promise.prototype._settlePromiseLateCancellationObserver = function (ctx) {
	        var handler = ctx.handler;
	        var promise = ctx.promise;
	        var receiver = ctx.receiver;
	        var value = ctx.value;
	        if (typeof handler === "function") {
	            if (!(promise instanceof Promise)) {
	                handler.call(receiver, value, promise);
	            } else {
	                this._settlePromiseFromHandler(handler, receiver, value, promise);
	            }
	        } else if (promise instanceof Promise) {
	            promise._reject(value);
	        }
	    };
	
	    Promise.prototype._settlePromiseCtx = function (ctx) {
	        this._settlePromise(ctx.promise, ctx.handler, ctx.receiver, ctx.value);
	    };
	
	    Promise.prototype._settlePromise0 = function (handler, value, bitField) {
	        var promise = this._promise0;
	        var receiver = this._receiverAt(0);
	        this._promise0 = undefined;
	        this._receiver0 = undefined;
	        this._settlePromise(promise, handler, receiver, value);
	    };
	
	    Promise.prototype._clearCallbackDataAtIndex = function (index) {
	        var base = index * 4 - 4;
	        this[base + 2] = this[base + 3] = this[base + 0] = this[base + 1] = undefined;
	    };
	
	    Promise.prototype._fulfill = function (value) {
	        var bitField = this._bitField;
	        if ((bitField & 117506048) >>> 16) return;
	        if (value === this) {
	            var err = makeSelfResolutionError();
	            this._attachExtraTrace(err);
	            return this._reject(err);
	        }
	        this._setFulfilled();
	        this._rejectionHandler0 = value;
	
	        if ((bitField & 65535) > 0) {
	            if ((bitField & 134217728) !== 0) {
	                this._settlePromises();
	            } else {
	                async.settlePromises(this);
	            }
	        }
	    };
	
	    Promise.prototype._reject = function (reason) {
	        var bitField = this._bitField;
	        if ((bitField & 117506048) >>> 16) return;
	        this._setRejected();
	        this._fulfillmentHandler0 = reason;
	
	        if (this._isFinal()) {
	            return async.fatalError(reason, util.isNode);
	        }
	
	        if ((bitField & 65535) > 0) {
	            async.settlePromises(this);
	        } else {
	            this._ensurePossibleRejectionHandled();
	        }
	    };
	
	    Promise.prototype._fulfillPromises = function (len, value) {
	        for (var i = 1; i < len; i++) {
	            var handler = this._fulfillmentHandlerAt(i);
	            var promise = this._promiseAt(i);
	            var receiver = this._receiverAt(i);
	            this._clearCallbackDataAtIndex(i);
	            this._settlePromise(promise, handler, receiver, value);
	        }
	    };
	
	    Promise.prototype._rejectPromises = function (len, reason) {
	        for (var i = 1; i < len; i++) {
	            var handler = this._rejectionHandlerAt(i);
	            var promise = this._promiseAt(i);
	            var receiver = this._receiverAt(i);
	            this._clearCallbackDataAtIndex(i);
	            this._settlePromise(promise, handler, receiver, reason);
	        }
	    };
	
	    Promise.prototype._settlePromises = function () {
	        var bitField = this._bitField;
	        var len = bitField & 65535;
	
	        if (len > 0) {
	            if ((bitField & 16842752) !== 0) {
	                var reason = this._fulfillmentHandler0;
	                this._settlePromise0(this._rejectionHandler0, reason, bitField);
	                this._rejectPromises(len, reason);
	            } else {
	                var value = this._rejectionHandler0;
	                this._settlePromise0(this._fulfillmentHandler0, value, bitField);
	                this._fulfillPromises(len, value);
	            }
	            this._setLength(0);
	        }
	        this._clearCancellationData();
	    };
	
	    Promise.prototype._settledValue = function () {
	        var bitField = this._bitField;
	        if ((bitField & 33554432) !== 0) {
	            return this._rejectionHandler0;
	        } else if ((bitField & 16777216) !== 0) {
	            return this._fulfillmentHandler0;
	        }
	    };
	
	    function deferResolve(v) {
	        this.promise._resolveCallback(v);
	    }
	    function deferReject(v) {
	        this.promise._rejectCallback(v, false);
	    }
	
	    Promise.defer = Promise.pending = function () {
	        debug.deprecated("Promise.defer", "new Promise");
	        var promise = new Promise(INTERNAL);
	        return {
	            promise: promise,
	            resolve: deferResolve,
	            reject: deferReject
	        };
	    };
	
	    util.notEnumerableProp(Promise, "_makeSelfResolutionError", makeSelfResolutionError);
	
	    __webpack_require__(23)(Promise, INTERNAL, tryConvertToPromise, apiRejection, debug);
	    __webpack_require__(24)(Promise, INTERNAL, tryConvertToPromise, debug);
	    __webpack_require__(25)(Promise, PromiseArray, apiRejection, debug);
	    __webpack_require__(26)(Promise);
	    __webpack_require__(27)(Promise);
	    __webpack_require__(28)(Promise, PromiseArray, tryConvertToPromise, INTERNAL, async, getDomain);
	    Promise.Promise = Promise;
	    Promise.version = "3.5.0";
	    __webpack_require__(29)(Promise, PromiseArray, apiRejection, tryConvertToPromise, INTERNAL, debug);
	    __webpack_require__(30)(Promise);
	    __webpack_require__(31)(Promise, apiRejection, tryConvertToPromise, createContext, INTERNAL, debug);
	    __webpack_require__(32)(Promise, INTERNAL, debug);
	    __webpack_require__(33)(Promise, apiRejection, INTERNAL, tryConvertToPromise, Proxyable, debug);
	    __webpack_require__(34)(Promise);
	    __webpack_require__(35)(Promise, INTERNAL);
	    __webpack_require__(36)(Promise, PromiseArray, tryConvertToPromise, apiRejection);
	    __webpack_require__(37)(Promise, INTERNAL, tryConvertToPromise, apiRejection);
	    __webpack_require__(38)(Promise, PromiseArray, apiRejection, tryConvertToPromise, INTERNAL, debug);
	    __webpack_require__(39)(Promise, PromiseArray, debug);
	    __webpack_require__(40)(Promise, PromiseArray, apiRejection);
	    __webpack_require__(41)(Promise, INTERNAL);
	    __webpack_require__(42)(Promise, INTERNAL);
	    __webpack_require__(43)(Promise);
	
	    util.toFastProperties(Promise);
	    util.toFastProperties(Promise.prototype);
	    function fillTypes(value) {
	        var p = new Promise(INTERNAL);
	        p._fulfillmentHandler0 = value;
	        p._rejectionHandler0 = value;
	        p._promise0 = value;
	        p._receiver0 = value;
	    }
	    // Complete slack tracking, opt out of field-type tracking and           
	    // stabilize map                                                         
	    fillTypes({ a: 1 });
	    fillTypes({ b: 2 });
	    fillTypes({ c: 3 });
	    fillTypes(1);
	    fillTypes(function () {});
	    fillTypes(undefined);
	    fillTypes(false);
	    fillTypes(new Promise(INTERNAL));
	    debug.setBounds(Async.firstLineError, util.lastLineError);
	    return Promise;
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ },
/* 7 */
/***/ function(module, exports) {

	'use strict';
	
	// shim for using process in browser
	var process = module.exports = {};
	
	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.
	
	var cachedSetTimeout;
	var cachedClearTimeout;
	
	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout() {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	})();
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch (e) {
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch (e) {
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }
	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e) {
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e) {
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }
	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;
	
	    var len = queue.length;
	    while (len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}
	
	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	process.prependListener = noop;
	process.prependOnceListener = noop;
	
	process.listeners = function (name) {
	    return [];
	};
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () {
	    return '/';
	};
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function () {
	    return 0;
	};

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {"use strict";
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var es5 = __webpack_require__(9);
	var canEvaluate = typeof navigator == "undefined";
	
	var errorObj = { e: {} };
	var tryCatchTarget;
	var globalObject = typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : undefined !== undefined ? undefined : null;
	
	function tryCatcher() {
	    try {
	        var target = tryCatchTarget;
	        tryCatchTarget = null;
	        return target.apply(this, arguments);
	    } catch (e) {
	        errorObj.e = e;
	        return errorObj;
	    }
	}
	function tryCatch(fn) {
	    tryCatchTarget = fn;
	    return tryCatcher;
	}
	
	var inherits = function inherits(Child, Parent) {
	    var hasProp = {}.hasOwnProperty;
	
	    function T() {
	        this.constructor = Child;
	        this.constructor$ = Parent;
	        for (var propertyName in Parent.prototype) {
	            if (hasProp.call(Parent.prototype, propertyName) && propertyName.charAt(propertyName.length - 1) !== "$") {
	                this[propertyName + "$"] = Parent.prototype[propertyName];
	            }
	        }
	    }
	    T.prototype = Parent.prototype;
	    Child.prototype = new T();
	    return Child.prototype;
	};
	
	function isPrimitive(val) {
	    return val == null || val === true || val === false || typeof val === "string" || typeof val === "number";
	}
	
	function isObject(value) {
	    return typeof value === "function" || (typeof value === "undefined" ? "undefined" : _typeof(value)) === "object" && value !== null;
	}
	
	function maybeWrapAsError(maybeError) {
	    if (!isPrimitive(maybeError)) return maybeError;
	
	    return new Error(safeToString(maybeError));
	}
	
	function withAppended(target, appendee) {
	    var len = target.length;
	    var ret = new Array(len + 1);
	    var i;
	    for (i = 0; i < len; ++i) {
	        ret[i] = target[i];
	    }
	    ret[i] = appendee;
	    return ret;
	}
	
	function getDataPropertyOrDefault(obj, key, defaultValue) {
	    if (es5.isES5) {
	        var desc = Object.getOwnPropertyDescriptor(obj, key);
	
	        if (desc != null) {
	            return desc.get == null && desc.set == null ? desc.value : defaultValue;
	        }
	    } else {
	        return {}.hasOwnProperty.call(obj, key) ? obj[key] : undefined;
	    }
	}
	
	function notEnumerableProp(obj, name, value) {
	    if (isPrimitive(obj)) return obj;
	    var descriptor = {
	        value: value,
	        configurable: true,
	        enumerable: false,
	        writable: true
	    };
	    es5.defineProperty(obj, name, descriptor);
	    return obj;
	}
	
	function thrower(r) {
	    throw r;
	}
	
	var inheritedDataKeys = function () {
	    var excludedPrototypes = [Array.prototype, Object.prototype, Function.prototype];
	
	    var isExcludedProto = function isExcludedProto(val) {
	        for (var i = 0; i < excludedPrototypes.length; ++i) {
	            if (excludedPrototypes[i] === val) {
	                return true;
	            }
	        }
	        return false;
	    };
	
	    if (es5.isES5) {
	        var getKeys = Object.getOwnPropertyNames;
	        return function (obj) {
	            var ret = [];
	            var visitedKeys = Object.create(null);
	            while (obj != null && !isExcludedProto(obj)) {
	                var keys;
	                try {
	                    keys = getKeys(obj);
	                } catch (e) {
	                    return ret;
	                }
	                for (var i = 0; i < keys.length; ++i) {
	                    var key = keys[i];
	                    if (visitedKeys[key]) continue;
	                    visitedKeys[key] = true;
	                    var desc = Object.getOwnPropertyDescriptor(obj, key);
	                    if (desc != null && desc.get == null && desc.set == null) {
	                        ret.push(key);
	                    }
	                }
	                obj = es5.getPrototypeOf(obj);
	            }
	            return ret;
	        };
	    } else {
	        var hasProp = {}.hasOwnProperty;
	        return function (obj) {
	            if (isExcludedProto(obj)) return [];
	            var ret = [];
	
	            /*jshint forin:false */
	            enumeration: for (var key in obj) {
	                if (hasProp.call(obj, key)) {
	                    ret.push(key);
	                } else {
	                    for (var i = 0; i < excludedPrototypes.length; ++i) {
	                        if (hasProp.call(excludedPrototypes[i], key)) {
	                            continue enumeration;
	                        }
	                    }
	                    ret.push(key);
	                }
	            }
	            return ret;
	        };
	    }
	}();
	
	var thisAssignmentPattern = /this\s*\.\s*\S+\s*=/;
	function isClass(fn) {
	    try {
	        if (typeof fn === "function") {
	            var keys = es5.names(fn.prototype);
	
	            var hasMethods = es5.isES5 && keys.length > 1;
	            var hasMethodsOtherThanConstructor = keys.length > 0 && !(keys.length === 1 && keys[0] === "constructor");
	            var hasThisAssignmentAndStaticMethods = thisAssignmentPattern.test(fn + "") && es5.names(fn).length > 0;
	
	            if (hasMethods || hasMethodsOtherThanConstructor || hasThisAssignmentAndStaticMethods) {
	                return true;
	            }
	        }
	        return false;
	    } catch (e) {
	        return false;
	    }
	}
	
	function toFastProperties(obj) {
	    /*jshint -W027,-W055,-W031*/
	    function FakeConstructor() {}
	    FakeConstructor.prototype = obj;
	    var l = 8;
	    while (l--) {
	        new FakeConstructor();
	    }return obj;
	    eval(obj);
	}
	
	var rident = /^[a-z$_][a-z$_0-9]*$/i;
	function isIdentifier(str) {
	    return rident.test(str);
	}
	
	function filledRange(count, prefix, suffix) {
	    var ret = new Array(count);
	    for (var i = 0; i < count; ++i) {
	        ret[i] = prefix + i + suffix;
	    }
	    return ret;
	}
	
	function safeToString(obj) {
	    try {
	        return obj + "";
	    } catch (e) {
	        return "[no string representation]";
	    }
	}
	
	function isError(obj) {
	    return obj !== null && (typeof obj === "undefined" ? "undefined" : _typeof(obj)) === "object" && typeof obj.message === "string" && typeof obj.name === "string";
	}
	
	function markAsOriginatingFromRejection(e) {
	    try {
	        notEnumerableProp(e, "isOperational", true);
	    } catch (ignore) {}
	}
	
	function originatesFromRejection(e) {
	    if (e == null) return false;
	    return e instanceof Error["__BluebirdErrorTypes__"].OperationalError || e["isOperational"] === true;
	}
	
	function canAttachTrace(obj) {
	    return isError(obj) && es5.propertyIsWritable(obj, "stack");
	}
	
	var ensureErrorObject = function () {
	    if (!("stack" in new Error())) {
	        return function (value) {
	            if (canAttachTrace(value)) return value;
	            try {
	                throw new Error(safeToString(value));
	            } catch (err) {
	                return err;
	            }
	        };
	    } else {
	        return function (value) {
	            if (canAttachTrace(value)) return value;
	            return new Error(safeToString(value));
	        };
	    }
	}();
	
	function classString(obj) {
	    return {}.toString.call(obj);
	}
	
	function copyDescriptors(from, to, filter) {
	    var keys = es5.names(from);
	    for (var i = 0; i < keys.length; ++i) {
	        var key = keys[i];
	        if (filter(key)) {
	            try {
	                es5.defineProperty(to, key, es5.getDescriptor(from, key));
	            } catch (ignore) {}
	        }
	    }
	}
	
	var asArray = function asArray(v) {
	    if (es5.isArray(v)) {
	        return v;
	    }
	    return null;
	};
	
	if (typeof Symbol !== "undefined" && Symbol.iterator) {
	    var ArrayFrom = typeof Array.from === "function" ? function (v) {
	        return Array.from(v);
	    } : function (v) {
	        var ret = [];
	        var it = v[Symbol.iterator]();
	        var itResult;
	        while (!(itResult = it.next()).done) {
	            ret.push(itResult.value);
	        }
	        return ret;
	    };
	
	    asArray = function asArray(v) {
	        if (es5.isArray(v)) {
	            return v;
	        } else if (v != null && typeof v[Symbol.iterator] === "function") {
	            return ArrayFrom(v);
	        }
	        return null;
	    };
	}
	
	var isNode = typeof process !== "undefined" && classString(process).toLowerCase() === "[object process]";
	
	var hasEnvVariables = typeof process !== "undefined" && typeof process.env !== "undefined";
	
	function env(key) {
	    return hasEnvVariables ? process.env[key] : undefined;
	}
	
	function getNativePromise() {
	    if (typeof Promise === "function") {
	        try {
	            var promise = new Promise(function () {});
	            if ({}.toString.call(promise) === "[object Promise]") {
	                return Promise;
	            }
	        } catch (e) {}
	    }
	}
	
	function domainBind(self, cb) {
	    return self.bind(cb);
	}
	
	var ret = {
	    isClass: isClass,
	    isIdentifier: isIdentifier,
	    inheritedDataKeys: inheritedDataKeys,
	    getDataPropertyOrDefault: getDataPropertyOrDefault,
	    thrower: thrower,
	    isArray: es5.isArray,
	    asArray: asArray,
	    notEnumerableProp: notEnumerableProp,
	    isPrimitive: isPrimitive,
	    isObject: isObject,
	    isError: isError,
	    canEvaluate: canEvaluate,
	    errorObj: errorObj,
	    tryCatch: tryCatch,
	    inherits: inherits,
	    withAppended: withAppended,
	    maybeWrapAsError: maybeWrapAsError,
	    toFastProperties: toFastProperties,
	    filledRange: filledRange,
	    toString: safeToString,
	    canAttachTrace: canAttachTrace,
	    ensureErrorObject: ensureErrorObject,
	    originatesFromRejection: originatesFromRejection,
	    markAsOriginatingFromRejection: markAsOriginatingFromRejection,
	    classString: classString,
	    copyDescriptors: copyDescriptors,
	    hasDevTools: typeof chrome !== "undefined" && chrome && typeof chrome.loadTimes === "function",
	    isNode: isNode,
	    hasEnvVariables: hasEnvVariables,
	    env: env,
	    global: globalObject,
	    getNativePromise: getNativePromise,
	    domainBind: domainBind
	};
	ret.isRecentNode = ret.isNode && function () {
	    var version = process.versions.node.split(".").map(Number);
	    return version[0] === 0 && version[1] > 10 || version[0] > 0;
	}();
	
	if (ret.isNode) ret.toFastProperties(process);
	
	try {
	    throw new Error();
	} catch (e) {
	    ret.lastLineError = e;
	}
	module.exports = ret;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(7)))

/***/ },
/* 9 */
/***/ function(module, exports) {

	"use strict";
	
	var isES5 = function () {
	    "use strict";
	
	    return this === undefined;
	}();
	
	if (isES5) {
	    module.exports = {
	        freeze: Object.freeze,
	        defineProperty: Object.defineProperty,
	        getDescriptor: Object.getOwnPropertyDescriptor,
	        keys: Object.keys,
	        names: Object.getOwnPropertyNames,
	        getPrototypeOf: Object.getPrototypeOf,
	        isArray: Array.isArray,
	        isES5: isES5,
	        propertyIsWritable: function propertyIsWritable(obj, prop) {
	            var descriptor = Object.getOwnPropertyDescriptor(obj, prop);
	            return !!(!descriptor || descriptor.writable || descriptor.set);
	        }
	    };
	} else {
	    var has = {}.hasOwnProperty;
	    var str = {}.toString;
	    var proto = {}.constructor.prototype;
	
	    var ObjectKeys = function ObjectKeys(o) {
	        var ret = [];
	        for (var key in o) {
	            if (has.call(o, key)) {
	                ret.push(key);
	            }
	        }
	        return ret;
	    };
	
	    var ObjectGetDescriptor = function ObjectGetDescriptor(o, key) {
	        return { value: o[key] };
	    };
	
	    var ObjectDefineProperty = function ObjectDefineProperty(o, key, desc) {
	        o[key] = desc.value;
	        return o;
	    };
	
	    var ObjectFreeze = function ObjectFreeze(obj) {
	        return obj;
	    };
	
	    var ObjectGetPrototypeOf = function ObjectGetPrototypeOf(obj) {
	        try {
	            return Object(obj).constructor.prototype;
	        } catch (e) {
	            return proto;
	        }
	    };
	
	    var ArrayIsArray = function ArrayIsArray(obj) {
	        try {
	            return str.call(obj) === "[object Array]";
	        } catch (e) {
	            return false;
	        }
	    };
	
	    module.exports = {
	        isArray: ArrayIsArray,
	        keys: ObjectKeys,
	        names: ObjectKeys,
	        defineProperty: ObjectDefineProperty,
	        getDescriptor: ObjectGetDescriptor,
	        freeze: ObjectFreeze,
	        getPrototypeOf: ObjectGetPrototypeOf,
	        isES5: isES5,
	        propertyIsWritable: function propertyIsWritable() {
	            return true;
	        }
	    };
	}

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {"use strict";
	
	var firstLineError;
	try {
	    throw new Error();
	} catch (e) {
	    firstLineError = e;
	}
	var schedule = __webpack_require__(11);
	var Queue = __webpack_require__(14);
	var util = __webpack_require__(8);
	
	function Async() {
	    this._customScheduler = false;
	    this._isTickUsed = false;
	    this._lateQueue = new Queue(16);
	    this._normalQueue = new Queue(16);
	    this._haveDrainedQueues = false;
	    this._trampolineEnabled = true;
	    var self = this;
	    this.drainQueues = function () {
	        self._drainQueues();
	    };
	    this._schedule = schedule;
	}
	
	Async.prototype.setScheduler = function (fn) {
	    var prev = this._schedule;
	    this._schedule = fn;
	    this._customScheduler = true;
	    return prev;
	};
	
	Async.prototype.hasCustomScheduler = function () {
	    return this._customScheduler;
	};
	
	Async.prototype.enableTrampoline = function () {
	    this._trampolineEnabled = true;
	};
	
	Async.prototype.disableTrampolineIfNecessary = function () {
	    if (util.hasDevTools) {
	        this._trampolineEnabled = false;
	    }
	};
	
	Async.prototype.haveItemsQueued = function () {
	    return this._isTickUsed || this._haveDrainedQueues;
	};
	
	Async.prototype.fatalError = function (e, isNode) {
	    if (isNode) {
	        process.stderr.write("Fatal " + (e instanceof Error ? e.stack : e) + "\n");
	        process.exit(2);
	    } else {
	        this.throwLater(e);
	    }
	};
	
	Async.prototype.throwLater = function (fn, arg) {
	    if (arguments.length === 1) {
	        arg = fn;
	        fn = function fn() {
	            throw arg;
	        };
	    }
	    if (typeof setTimeout !== "undefined") {
	        setTimeout(function () {
	            fn(arg);
	        }, 0);
	    } else try {
	        this._schedule(function () {
	            fn(arg);
	        });
	    } catch (e) {
	        throw new Error("No async scheduler available\n\n    See http://goo.gl/MqrFmX\n");
	    }
	};
	
	function AsyncInvokeLater(fn, receiver, arg) {
	    this._lateQueue.push(fn, receiver, arg);
	    this._queueTick();
	}
	
	function AsyncInvoke(fn, receiver, arg) {
	    this._normalQueue.push(fn, receiver, arg);
	    this._queueTick();
	}
	
	function AsyncSettlePromises(promise) {
	    this._normalQueue._pushOne(promise);
	    this._queueTick();
	}
	
	if (!util.hasDevTools) {
	    Async.prototype.invokeLater = AsyncInvokeLater;
	    Async.prototype.invoke = AsyncInvoke;
	    Async.prototype.settlePromises = AsyncSettlePromises;
	} else {
	    Async.prototype.invokeLater = function (fn, receiver, arg) {
	        if (this._trampolineEnabled) {
	            AsyncInvokeLater.call(this, fn, receiver, arg);
	        } else {
	            this._schedule(function () {
	                setTimeout(function () {
	                    fn.call(receiver, arg);
	                }, 100);
	            });
	        }
	    };
	
	    Async.prototype.invoke = function (fn, receiver, arg) {
	        if (this._trampolineEnabled) {
	            AsyncInvoke.call(this, fn, receiver, arg);
	        } else {
	            this._schedule(function () {
	                fn.call(receiver, arg);
	            });
	        }
	    };
	
	    Async.prototype.settlePromises = function (promise) {
	        if (this._trampolineEnabled) {
	            AsyncSettlePromises.call(this, promise);
	        } else {
	            this._schedule(function () {
	                promise._settlePromises();
	            });
	        }
	    };
	}
	
	Async.prototype._drainQueue = function (queue) {
	    while (queue.length() > 0) {
	        var fn = queue.shift();
	        if (typeof fn !== "function") {
	            fn._settlePromises();
	            continue;
	        }
	        var receiver = queue.shift();
	        var arg = queue.shift();
	        fn.call(receiver, arg);
	    }
	};
	
	Async.prototype._drainQueues = function () {
	    this._drainQueue(this._normalQueue);
	    this._reset();
	    this._haveDrainedQueues = true;
	    this._drainQueue(this._lateQueue);
	};
	
	Async.prototype._queueTick = function () {
	    if (!this._isTickUsed) {
	        this._isTickUsed = true;
	        this._schedule(this.drainQueues);
	    }
	};
	
	Async.prototype._reset = function () {
	    this._isTickUsed = false;
	};
	
	module.exports = Async;
	module.exports.firstLineError = firstLineError;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process, setImmediate) {"use strict";
	
	var util = __webpack_require__(8);
	var schedule;
	var noAsyncScheduler = function noAsyncScheduler() {
	    throw new Error("No async scheduler available\n\n    See http://goo.gl/MqrFmX\n");
	};
	var NativePromise = util.getNativePromise();
	if (util.isNode && typeof MutationObserver === "undefined") {
	    var GlobalSetImmediate = global.setImmediate;
	    var ProcessNextTick = process.nextTick;
	    schedule = util.isRecentNode ? function (fn) {
	        GlobalSetImmediate.call(global, fn);
	    } : function (fn) {
	        ProcessNextTick.call(process, fn);
	    };
	} else if (typeof NativePromise === "function" && typeof NativePromise.resolve === "function") {
	    var nativePromise = NativePromise.resolve();
	    schedule = function schedule(fn) {
	        nativePromise.then(fn);
	    };
	} else if (typeof MutationObserver !== "undefined" && !(typeof window !== "undefined" && window.navigator && (window.navigator.standalone || window.cordova))) {
	    schedule = function () {
	        var div = document.createElement("div");
	        var opts = { attributes: true };
	        var toggleScheduled = false;
	        var div2 = document.createElement("div");
	        var o2 = new MutationObserver(function () {
	            div.classList.toggle("foo");
	            toggleScheduled = false;
	        });
	        o2.observe(div2, opts);
	
	        var scheduleToggle = function scheduleToggle() {
	            if (toggleScheduled) return;
	            toggleScheduled = true;
	            div2.classList.toggle("foo");
	        };
	
	        return function schedule(fn) {
	            var o = new MutationObserver(function () {
	                o.disconnect();
	                fn();
	            });
	            o.observe(div, opts);
	            scheduleToggle();
	        };
	    }();
	} else if (typeof setImmediate !== "undefined") {
	    schedule = function schedule(fn) {
	        setImmediate(fn);
	    };
	} else if (typeof setTimeout !== "undefined") {
	    schedule = function schedule(fn) {
	        setTimeout(fn, 0);
	    };
	} else {
	    schedule = noAsyncScheduler;
	}
	module.exports = schedule;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(7), __webpack_require__(12).setImmediate))

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {"use strict";
	
	var scope = typeof global !== "undefined" && global || typeof self !== "undefined" && self || window;
	var apply = Function.prototype.apply;
	
	// DOM APIs, for completeness
	
	exports.setTimeout = function () {
	  return new Timeout(apply.call(setTimeout, scope, arguments), clearTimeout);
	};
	exports.setInterval = function () {
	  return new Timeout(apply.call(setInterval, scope, arguments), clearInterval);
	};
	exports.clearTimeout = exports.clearInterval = function (timeout) {
	  if (timeout) {
	    timeout.close();
	  }
	};
	
	function Timeout(id, clearFn) {
	  this._id = id;
	  this._clearFn = clearFn;
	}
	Timeout.prototype.unref = Timeout.prototype.ref = function () {};
	Timeout.prototype.close = function () {
	  this._clearFn.call(scope, this._id);
	};
	
	// Does not start the time, just sets up the members needed.
	exports.enroll = function (item, msecs) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = msecs;
	};
	
	exports.unenroll = function (item) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = -1;
	};
	
	exports._unrefActive = exports.active = function (item) {
	  clearTimeout(item._idleTimeoutId);
	
	  var msecs = item._idleTimeout;
	  if (msecs >= 0) {
	    item._idleTimeoutId = setTimeout(function onTimeout() {
	      if (item._onTimeout) item._onTimeout();
	    }, msecs);
	  }
	};
	
	// setimmediate attaches itself to the global object
	__webpack_require__(13);
	// On some exotic environments, it's not clear which object `setimmediate` was
	// able to install onto.  Search each possibility in the same order as the
	// `setimmediate` library.
	exports.setImmediate = typeof self !== "undefined" && self.setImmediate || typeof global !== "undefined" && global.setImmediate || undefined && undefined.setImmediate;
	exports.clearImmediate = typeof self !== "undefined" && self.clearImmediate || typeof global !== "undefined" && global.clearImmediate || undefined && undefined.clearImmediate;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {"use strict";
	
	(function (global, undefined) {
	    "use strict";
	
	    if (global.setImmediate) {
	        return;
	    }
	
	    var nextHandle = 1; // Spec says greater than zero
	    var tasksByHandle = {};
	    var currentlyRunningATask = false;
	    var doc = global.document;
	    var registerImmediate;
	
	    function setImmediate(callback) {
	        // Callback can either be a function or a string
	        if (typeof callback !== "function") {
	            callback = new Function("" + callback);
	        }
	        // Copy function arguments
	        var args = new Array(arguments.length - 1);
	        for (var i = 0; i < args.length; i++) {
	            args[i] = arguments[i + 1];
	        }
	        // Store and register the task
	        var task = { callback: callback, args: args };
	        tasksByHandle[nextHandle] = task;
	        registerImmediate(nextHandle);
	        return nextHandle++;
	    }
	
	    function clearImmediate(handle) {
	        delete tasksByHandle[handle];
	    }
	
	    function run(task) {
	        var callback = task.callback;
	        var args = task.args;
	        switch (args.length) {
	            case 0:
	                callback();
	                break;
	            case 1:
	                callback(args[0]);
	                break;
	            case 2:
	                callback(args[0], args[1]);
	                break;
	            case 3:
	                callback(args[0], args[1], args[2]);
	                break;
	            default:
	                callback.apply(undefined, args);
	                break;
	        }
	    }
	
	    function runIfPresent(handle) {
	        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
	        // So if we're currently running a task, we'll need to delay this invocation.
	        if (currentlyRunningATask) {
	            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
	            // "too much recursion" error.
	            setTimeout(runIfPresent, 0, handle);
	        } else {
	            var task = tasksByHandle[handle];
	            if (task) {
	                currentlyRunningATask = true;
	                try {
	                    run(task);
	                } finally {
	                    clearImmediate(handle);
	                    currentlyRunningATask = false;
	                }
	            }
	        }
	    }
	
	    function installNextTickImplementation() {
	        registerImmediate = function registerImmediate(handle) {
	            process.nextTick(function () {
	                runIfPresent(handle);
	            });
	        };
	    }
	
	    function canUsePostMessage() {
	        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
	        // where `global.postMessage` means something completely different and can't be used for this purpose.
	        if (global.postMessage && !global.importScripts) {
	            var postMessageIsAsynchronous = true;
	            var oldOnMessage = global.onmessage;
	            global.onmessage = function () {
	                postMessageIsAsynchronous = false;
	            };
	            global.postMessage("", "*");
	            global.onmessage = oldOnMessage;
	            return postMessageIsAsynchronous;
	        }
	    }
	
	    function installPostMessageImplementation() {
	        // Installs an event handler on `global` for the `message` event: see
	        // * https://developer.mozilla.org/en/DOM/window.postMessage
	        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages
	
	        var messagePrefix = "setImmediate$" + Math.random() + "$";
	        var onGlobalMessage = function onGlobalMessage(event) {
	            if (event.source === global && typeof event.data === "string" && event.data.indexOf(messagePrefix) === 0) {
	                runIfPresent(+event.data.slice(messagePrefix.length));
	            }
	        };
	
	        if (global.addEventListener) {
	            global.addEventListener("message", onGlobalMessage, false);
	        } else {
	            global.attachEvent("onmessage", onGlobalMessage);
	        }
	
	        registerImmediate = function registerImmediate(handle) {
	            global.postMessage(messagePrefix + handle, "*");
	        };
	    }
	
	    function installMessageChannelImplementation() {
	        var channel = new MessageChannel();
	        channel.port1.onmessage = function (event) {
	            var handle = event.data;
	            runIfPresent(handle);
	        };
	
	        registerImmediate = function registerImmediate(handle) {
	            channel.port2.postMessage(handle);
	        };
	    }
	
	    function installReadyStateChangeImplementation() {
	        var html = doc.documentElement;
	        registerImmediate = function registerImmediate(handle) {
	            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
	            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
	            var script = doc.createElement("script");
	            script.onreadystatechange = function () {
	                runIfPresent(handle);
	                script.onreadystatechange = null;
	                html.removeChild(script);
	                script = null;
	            };
	            html.appendChild(script);
	        };
	    }
	
	    function installSetTimeoutImplementation() {
	        registerImmediate = function registerImmediate(handle) {
	            setTimeout(runIfPresent, 0, handle);
	        };
	    }
	
	    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
	    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
	    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;
	
	    // Don't get fooled by e.g. browserify environments.
	    if ({}.toString.call(global.process) === "[object process]") {
	        // For Node.js before 0.9
	        installNextTickImplementation();
	    } else if (canUsePostMessage()) {
	        // For non-IE10 modern browsers
	        installPostMessageImplementation();
	    } else if (global.MessageChannel) {
	        // For web workers, where supported
	        installMessageChannelImplementation();
	    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
	        // For IE 6–8
	        installReadyStateChangeImplementation();
	    } else {
	        // For older browsers
	        installSetTimeoutImplementation();
	    }
	
	    attachTo.setImmediate = setImmediate;
	    attachTo.clearImmediate = clearImmediate;
	})(typeof self === "undefined" ? typeof global === "undefined" ? undefined : global : self);
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(7)))

/***/ },
/* 14 */
/***/ function(module, exports) {

	"use strict";
	
	function arrayMove(src, srcIndex, dst, dstIndex, len) {
	    for (var j = 0; j < len; ++j) {
	        dst[j + dstIndex] = src[j + srcIndex];
	        src[j + srcIndex] = void 0;
	    }
	}
	
	function Queue(capacity) {
	    this._capacity = capacity;
	    this._length = 0;
	    this._front = 0;
	}
	
	Queue.prototype._willBeOverCapacity = function (size) {
	    return this._capacity < size;
	};
	
	Queue.prototype._pushOne = function (arg) {
	    var length = this.length();
	    this._checkCapacity(length + 1);
	    var i = this._front + length & this._capacity - 1;
	    this[i] = arg;
	    this._length = length + 1;
	};
	
	Queue.prototype.push = function (fn, receiver, arg) {
	    var length = this.length() + 3;
	    if (this._willBeOverCapacity(length)) {
	        this._pushOne(fn);
	        this._pushOne(receiver);
	        this._pushOne(arg);
	        return;
	    }
	    var j = this._front + length - 3;
	    this._checkCapacity(length);
	    var wrapMask = this._capacity - 1;
	    this[j + 0 & wrapMask] = fn;
	    this[j + 1 & wrapMask] = receiver;
	    this[j + 2 & wrapMask] = arg;
	    this._length = length;
	};
	
	Queue.prototype.shift = function () {
	    var front = this._front,
	        ret = this[front];
	
	    this[front] = undefined;
	    this._front = front + 1 & this._capacity - 1;
	    this._length--;
	    return ret;
	};
	
	Queue.prototype.length = function () {
	    return this._length;
	};
	
	Queue.prototype._checkCapacity = function (size) {
	    if (this._capacity < size) {
	        this._resizeTo(this._capacity << 1);
	    }
	};
	
	Queue.prototype._resizeTo = function (capacity) {
	    var oldCapacity = this._capacity;
	    this._capacity = capacity;
	    var front = this._front;
	    var length = this._length;
	    var moveItemsCount = front + length & oldCapacity - 1;
	    arrayMove(this, 0, this, oldCapacity, moveItemsCount);
	};
	
	module.exports = Queue;

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var es5 = __webpack_require__(9);
	var Objectfreeze = es5.freeze;
	var util = __webpack_require__(8);
	var inherits = util.inherits;
	var notEnumerableProp = util.notEnumerableProp;
	
	function subError(nameProperty, defaultMessage) {
	    function SubError(message) {
	        if (!(this instanceof SubError)) return new SubError(message);
	        notEnumerableProp(this, "message", typeof message === "string" ? message : defaultMessage);
	        notEnumerableProp(this, "name", nameProperty);
	        if (Error.captureStackTrace) {
	            Error.captureStackTrace(this, this.constructor);
	        } else {
	            Error.call(this);
	        }
	    }
	    inherits(SubError, Error);
	    return SubError;
	}
	
	var _TypeError, _RangeError;
	var Warning = subError("Warning", "warning");
	var CancellationError = subError("CancellationError", "cancellation error");
	var TimeoutError = subError("TimeoutError", "timeout error");
	var AggregateError = subError("AggregateError", "aggregate error");
	try {
	    _TypeError = TypeError;
	    _RangeError = RangeError;
	} catch (e) {
	    _TypeError = subError("TypeError", "type error");
	    _RangeError = subError("RangeError", "range error");
	}
	
	var methods = ("join pop push shift unshift slice filter forEach some " + "every map indexOf lastIndexOf reduce reduceRight sort reverse").split(" ");
	
	for (var i = 0; i < methods.length; ++i) {
	    if (typeof Array.prototype[methods[i]] === "function") {
	        AggregateError.prototype[methods[i]] = Array.prototype[methods[i]];
	    }
	}
	
	es5.defineProperty(AggregateError.prototype, "length", {
	    value: 0,
	    configurable: false,
	    writable: true,
	    enumerable: true
	});
	AggregateError.prototype["isOperational"] = true;
	var level = 0;
	AggregateError.prototype.toString = function () {
	    var indent = Array(level * 4 + 1).join(" ");
	    var ret = "\n" + indent + "AggregateError of:" + "\n";
	    level++;
	    indent = Array(level * 4 + 1).join(" ");
	    for (var i = 0; i < this.length; ++i) {
	        var str = this[i] === this ? "[Circular AggregateError]" : this[i] + "";
	        var lines = str.split("\n");
	        for (var j = 0; j < lines.length; ++j) {
	            lines[j] = indent + lines[j];
	        }
	        str = lines.join("\n");
	        ret += str + "\n";
	    }
	    level--;
	    return ret;
	};
	
	function OperationalError(message) {
	    if (!(this instanceof OperationalError)) return new OperationalError(message);
	    notEnumerableProp(this, "name", "OperationalError");
	    notEnumerableProp(this, "message", message);
	    this.cause = message;
	    this["isOperational"] = true;
	
	    if (message instanceof Error) {
	        notEnumerableProp(this, "message", message.message);
	        notEnumerableProp(this, "stack", message.stack);
	    } else if (Error.captureStackTrace) {
	        Error.captureStackTrace(this, this.constructor);
	    }
	}
	inherits(OperationalError, Error);
	
	var errorTypes = Error["__BluebirdErrorTypes__"];
	if (!errorTypes) {
	    errorTypes = Objectfreeze({
	        CancellationError: CancellationError,
	        TimeoutError: TimeoutError,
	        OperationalError: OperationalError,
	        RejectionError: OperationalError,
	        AggregateError: AggregateError
	    });
	    es5.defineProperty(Error, "__BluebirdErrorTypes__", {
	        value: errorTypes,
	        writable: false,
	        enumerable: false,
	        configurable: false
	    });
	}
	
	module.exports = {
	    Error: Error,
	    TypeError: _TypeError,
	    RangeError: _RangeError,
	    CancellationError: errorTypes.CancellationError,
	    OperationalError: errorTypes.OperationalError,
	    TimeoutError: errorTypes.TimeoutError,
	    AggregateError: errorTypes.AggregateError,
	    Warning: Warning
	};

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	module.exports = function (Promise, INTERNAL) {
	    var util = __webpack_require__(8);
	    var errorObj = util.errorObj;
	    var isObject = util.isObject;
	
	    function tryConvertToPromise(obj, context) {
	        if (isObject(obj)) {
	            if (obj instanceof Promise) return obj;
	            var then = getThen(obj);
	            if (then === errorObj) {
	                if (context) context._pushContext();
	                var ret = Promise.reject(then.e);
	                if (context) context._popContext();
	                return ret;
	            } else if (typeof then === "function") {
	                if (isAnyBluebirdPromise(obj)) {
	                    var ret = new Promise(INTERNAL);
	                    obj._then(ret._fulfill, ret._reject, undefined, ret, null);
	                    return ret;
	                }
	                return doThenable(obj, then, context);
	            }
	        }
	        return obj;
	    }
	
	    function doGetThen(obj) {
	        return obj.then;
	    }
	
	    function getThen(obj) {
	        try {
	            return doGetThen(obj);
	        } catch (e) {
	            errorObj.e = e;
	            return errorObj;
	        }
	    }
	
	    var hasProp = {}.hasOwnProperty;
	    function isAnyBluebirdPromise(obj) {
	        try {
	            return hasProp.call(obj, "_promise0");
	        } catch (e) {
	            return false;
	        }
	    }
	
	    function doThenable(x, then, context) {
	        var promise = new Promise(INTERNAL);
	        var ret = promise;
	        if (context) context._pushContext();
	        promise._captureStackTrace();
	        if (context) context._popContext();
	        var synchronous = true;
	        var result = util.tryCatch(then).call(x, resolve, reject);
	        synchronous = false;
	
	        if (promise && result === errorObj) {
	            promise._rejectCallback(result.e, true, true);
	            promise = null;
	        }
	
	        function resolve(value) {
	            if (!promise) return;
	            promise._resolveCallback(value);
	            promise = null;
	        }
	
	        function reject(reason) {
	            if (!promise) return;
	            promise._rejectCallback(reason, synchronous, true);
	            promise = null;
	        }
	        return ret;
	    }
	
	    return tryConvertToPromise;
	};

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	module.exports = function (Promise, INTERNAL, tryConvertToPromise, apiRejection, Proxyable) {
	    var util = __webpack_require__(8);
	    var isArray = util.isArray;
	
	    function toResolutionValue(val) {
	        switch (val) {
	            case -2:
	                return [];
	            case -3:
	                return {};
	            case -6:
	                return new Map();
	        }
	    }
	
	    function PromiseArray(values) {
	        var promise = this._promise = new Promise(INTERNAL);
	        if (values instanceof Promise) {
	            promise._propagateFrom(values, 3);
	        }
	        promise._setOnCancel(this);
	        this._values = values;
	        this._length = 0;
	        this._totalResolved = 0;
	        this._init(undefined, -2);
	    }
	    util.inherits(PromiseArray, Proxyable);
	
	    PromiseArray.prototype.length = function () {
	        return this._length;
	    };
	
	    PromiseArray.prototype.promise = function () {
	        return this._promise;
	    };
	
	    PromiseArray.prototype._init = function init(_, resolveValueIfEmpty) {
	        var values = tryConvertToPromise(this._values, this._promise);
	        if (values instanceof Promise) {
	            values = values._target();
	            var bitField = values._bitField;
	            ;
	            this._values = values;
	
	            if ((bitField & 50397184) === 0) {
	                this._promise._setAsyncGuaranteed();
	                return values._then(init, this._reject, undefined, this, resolveValueIfEmpty);
	            } else if ((bitField & 33554432) !== 0) {
	                values = values._value();
	            } else if ((bitField & 16777216) !== 0) {
	                return this._reject(values._reason());
	            } else {
	                return this._cancel();
	            }
	        }
	        values = util.asArray(values);
	        if (values === null) {
	            var err = apiRejection("expecting an array or an iterable object but got " + util.classString(values)).reason();
	            this._promise._rejectCallback(err, false);
	            return;
	        }
	
	        if (values.length === 0) {
	            if (resolveValueIfEmpty === -5) {
	                this._resolveEmptyArray();
	            } else {
	                this._resolve(toResolutionValue(resolveValueIfEmpty));
	            }
	            return;
	        }
	        this._iterate(values);
	    };
	
	    PromiseArray.prototype._iterate = function (values) {
	        var len = this.getActualLength(values.length);
	        this._length = len;
	        this._values = this.shouldCopyValues() ? new Array(len) : this._values;
	        var result = this._promise;
	        var isResolved = false;
	        var bitField = null;
	        for (var i = 0; i < len; ++i) {
	            var maybePromise = tryConvertToPromise(values[i], result);
	
	            if (maybePromise instanceof Promise) {
	                maybePromise = maybePromise._target();
	                bitField = maybePromise._bitField;
	            } else {
	                bitField = null;
	            }
	
	            if (isResolved) {
	                if (bitField !== null) {
	                    maybePromise.suppressUnhandledRejections();
	                }
	            } else if (bitField !== null) {
	                if ((bitField & 50397184) === 0) {
	                    maybePromise._proxy(this, i);
	                    this._values[i] = maybePromise;
	                } else if ((bitField & 33554432) !== 0) {
	                    isResolved = this._promiseFulfilled(maybePromise._value(), i);
	                } else if ((bitField & 16777216) !== 0) {
	                    isResolved = this._promiseRejected(maybePromise._reason(), i);
	                } else {
	                    isResolved = this._promiseCancelled(i);
	                }
	            } else {
	                isResolved = this._promiseFulfilled(maybePromise, i);
	            }
	        }
	        if (!isResolved) result._setAsyncGuaranteed();
	    };
	
	    PromiseArray.prototype._isResolved = function () {
	        return this._values === null;
	    };
	
	    PromiseArray.prototype._resolve = function (value) {
	        this._values = null;
	        this._promise._fulfill(value);
	    };
	
	    PromiseArray.prototype._cancel = function () {
	        if (this._isResolved() || !this._promise._isCancellable()) return;
	        this._values = null;
	        this._promise._cancel();
	    };
	
	    PromiseArray.prototype._reject = function (reason) {
	        this._values = null;
	        this._promise._rejectCallback(reason, false);
	    };
	
	    PromiseArray.prototype._promiseFulfilled = function (value, index) {
	        this._values[index] = value;
	        var totalResolved = ++this._totalResolved;
	        if (totalResolved >= this._length) {
	            this._resolve(this._values);
	            return true;
	        }
	        return false;
	    };
	
	    PromiseArray.prototype._promiseCancelled = function () {
	        this._cancel();
	        return true;
	    };
	
	    PromiseArray.prototype._promiseRejected = function (reason) {
	        this._totalResolved++;
	        this._reject(reason);
	        return true;
	    };
	
	    PromiseArray.prototype._resultCancelled = function () {
	        if (this._isResolved()) return;
	        var values = this._values;
	        this._cancel();
	        if (values instanceof Promise) {
	            values.cancel();
	        } else {
	            for (var i = 0; i < values.length; ++i) {
	                if (values[i] instanceof Promise) {
	                    values[i].cancel();
	                }
	            }
	        }
	    };
	
	    PromiseArray.prototype.shouldCopyValues = function () {
	        return true;
	    };
	
	    PromiseArray.prototype.getActualLength = function (len) {
	        return len;
	    };
	
	    return PromiseArray;
	};

/***/ },
/* 18 */
/***/ function(module, exports) {

	"use strict";
	
	module.exports = function (Promise) {
	    var longStackTraces = false;
	    var contextStack = [];
	
	    Promise.prototype._promiseCreated = function () {};
	    Promise.prototype._pushContext = function () {};
	    Promise.prototype._popContext = function () {
	        return null;
	    };
	    Promise._peekContext = Promise.prototype._peekContext = function () {};
	
	    function Context() {
	        this._trace = new Context.CapturedTrace(peekContext());
	    }
	    Context.prototype._pushContext = function () {
	        if (this._trace !== undefined) {
	            this._trace._promiseCreated = null;
	            contextStack.push(this._trace);
	        }
	    };
	
	    Context.prototype._popContext = function () {
	        if (this._trace !== undefined) {
	            var trace = contextStack.pop();
	            var ret = trace._promiseCreated;
	            trace._promiseCreated = null;
	            return ret;
	        }
	        return null;
	    };
	
	    function createContext() {
	        if (longStackTraces) return new Context();
	    }
	
	    function peekContext() {
	        var lastIndex = contextStack.length - 1;
	        if (lastIndex >= 0) {
	            return contextStack[lastIndex];
	        }
	        return undefined;
	    }
	    Context.CapturedTrace = null;
	    Context.create = createContext;
	    Context.deactivateLongStackTraces = function () {};
	    Context.activateLongStackTraces = function () {
	        var Promise_pushContext = Promise.prototype._pushContext;
	        var Promise_popContext = Promise.prototype._popContext;
	        var Promise_PeekContext = Promise._peekContext;
	        var Promise_peekContext = Promise.prototype._peekContext;
	        var Promise_promiseCreated = Promise.prototype._promiseCreated;
	        Context.deactivateLongStackTraces = function () {
	            Promise.prototype._pushContext = Promise_pushContext;
	            Promise.prototype._popContext = Promise_popContext;
	            Promise._peekContext = Promise_PeekContext;
	            Promise.prototype._peekContext = Promise_peekContext;
	            Promise.prototype._promiseCreated = Promise_promiseCreated;
	            longStackTraces = false;
	        };
	        longStackTraces = true;
	        Promise.prototype._pushContext = Context.prototype._pushContext;
	        Promise.prototype._popContext = Context.prototype._popContext;
	        Promise._peekContext = Promise.prototype._peekContext = peekContext;
	        Promise.prototype._promiseCreated = function () {
	            var ctx = this._peekContext();
	            if (ctx && ctx._promiseCreated == null) ctx._promiseCreated = this;
	        };
	    };
	    return Context;
	};

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {"use strict";
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	module.exports = function (Promise, Context) {
	    var getDomain = Promise._getDomain;
	    var async = Promise._async;
	    var Warning = __webpack_require__(15).Warning;
	    var util = __webpack_require__(8);
	    var canAttachTrace = util.canAttachTrace;
	    var unhandledRejectionHandled;
	    var possiblyUnhandledRejection;
	    var bluebirdFramePattern = /[\\\/]bluebird[\\\/]js[\\\/](release|debug|instrumented)/;
	    var nodeFramePattern = /\((?:timers\.js):\d+:\d+\)/;
	    var parseLinePattern = /[\/<\(](.+?):(\d+):(\d+)\)?\s*$/;
	    var stackFramePattern = null;
	    var formatStack = null;
	    var indentStackFrames = false;
	    var printWarning;
	    var debugging = !!(util.env("BLUEBIRD_DEBUG") != 0 && (false || util.env("BLUEBIRD_DEBUG") || util.env("NODE_ENV") === "development"));
	
	    var warnings = !!(util.env("BLUEBIRD_WARNINGS") != 0 && (debugging || util.env("BLUEBIRD_WARNINGS")));
	
	    var longStackTraces = !!(util.env("BLUEBIRD_LONG_STACK_TRACES") != 0 && (debugging || util.env("BLUEBIRD_LONG_STACK_TRACES")));
	
	    var wForgottenReturn = util.env("BLUEBIRD_W_FORGOTTEN_RETURN") != 0 && (warnings || !!util.env("BLUEBIRD_W_FORGOTTEN_RETURN"));
	
	    Promise.prototype.suppressUnhandledRejections = function () {
	        var target = this._target();
	        target._bitField = target._bitField & ~1048576 | 524288;
	    };
	
	    Promise.prototype._ensurePossibleRejectionHandled = function () {
	        if ((this._bitField & 524288) !== 0) return;
	        this._setRejectionIsUnhandled();
	        async.invokeLater(this._notifyUnhandledRejection, this, undefined);
	    };
	
	    Promise.prototype._notifyUnhandledRejectionIsHandled = function () {
	        fireRejectionEvent("rejectionHandled", unhandledRejectionHandled, undefined, this);
	    };
	
	    Promise.prototype._setReturnedNonUndefined = function () {
	        this._bitField = this._bitField | 268435456;
	    };
	
	    Promise.prototype._returnedNonUndefined = function () {
	        return (this._bitField & 268435456) !== 0;
	    };
	
	    Promise.prototype._notifyUnhandledRejection = function () {
	        if (this._isRejectionUnhandled()) {
	            var reason = this._settledValue();
	            this._setUnhandledRejectionIsNotified();
	            fireRejectionEvent("unhandledRejection", possiblyUnhandledRejection, reason, this);
	        }
	    };
	
	    Promise.prototype._setUnhandledRejectionIsNotified = function () {
	        this._bitField = this._bitField | 262144;
	    };
	
	    Promise.prototype._unsetUnhandledRejectionIsNotified = function () {
	        this._bitField = this._bitField & ~262144;
	    };
	
	    Promise.prototype._isUnhandledRejectionNotified = function () {
	        return (this._bitField & 262144) > 0;
	    };
	
	    Promise.prototype._setRejectionIsUnhandled = function () {
	        this._bitField = this._bitField | 1048576;
	    };
	
	    Promise.prototype._unsetRejectionIsUnhandled = function () {
	        this._bitField = this._bitField & ~1048576;
	        if (this._isUnhandledRejectionNotified()) {
	            this._unsetUnhandledRejectionIsNotified();
	            this._notifyUnhandledRejectionIsHandled();
	        }
	    };
	
	    Promise.prototype._isRejectionUnhandled = function () {
	        return (this._bitField & 1048576) > 0;
	    };
	
	    Promise.prototype._warn = function (message, shouldUseOwnTrace, promise) {
	        return warn(message, shouldUseOwnTrace, promise || this);
	    };
	
	    Promise.onPossiblyUnhandledRejection = function (fn) {
	        var domain = getDomain();
	        possiblyUnhandledRejection = typeof fn === "function" ? domain === null ? fn : util.domainBind(domain, fn) : undefined;
	    };
	
	    Promise.onUnhandledRejectionHandled = function (fn) {
	        var domain = getDomain();
	        unhandledRejectionHandled = typeof fn === "function" ? domain === null ? fn : util.domainBind(domain, fn) : undefined;
	    };
	
	    var disableLongStackTraces = function disableLongStackTraces() {};
	    Promise.longStackTraces = function () {
	        if (async.haveItemsQueued() && !config.longStackTraces) {
	            throw new Error("cannot enable long stack traces after promises have been created\n\n    See http://goo.gl/MqrFmX\n");
	        }
	        if (!config.longStackTraces && longStackTracesIsSupported()) {
	            var Promise_captureStackTrace = Promise.prototype._captureStackTrace;
	            var Promise_attachExtraTrace = Promise.prototype._attachExtraTrace;
	            config.longStackTraces = true;
	            disableLongStackTraces = function disableLongStackTraces() {
	                if (async.haveItemsQueued() && !config.longStackTraces) {
	                    throw new Error("cannot enable long stack traces after promises have been created\n\n    See http://goo.gl/MqrFmX\n");
	                }
	                Promise.prototype._captureStackTrace = Promise_captureStackTrace;
	                Promise.prototype._attachExtraTrace = Promise_attachExtraTrace;
	                Context.deactivateLongStackTraces();
	                async.enableTrampoline();
	                config.longStackTraces = false;
	            };
	            Promise.prototype._captureStackTrace = longStackTracesCaptureStackTrace;
	            Promise.prototype._attachExtraTrace = longStackTracesAttachExtraTrace;
	            Context.activateLongStackTraces();
	            async.disableTrampolineIfNecessary();
	        }
	    };
	
	    Promise.hasLongStackTraces = function () {
	        return config.longStackTraces && longStackTracesIsSupported();
	    };
	
	    var fireDomEvent = function () {
	        try {
	            if (typeof CustomEvent === "function") {
	                var event = new CustomEvent("CustomEvent");
	                util.global.dispatchEvent(event);
	                return function (name, event) {
	                    var domEvent = new CustomEvent(name.toLowerCase(), {
	                        detail: event,
	                        cancelable: true
	                    });
	                    return !util.global.dispatchEvent(domEvent);
	                };
	            } else if (typeof Event === "function") {
	                var event = new Event("CustomEvent");
	                util.global.dispatchEvent(event);
	                return function (name, event) {
	                    var domEvent = new Event(name.toLowerCase(), {
	                        cancelable: true
	                    });
	                    domEvent.detail = event;
	                    return !util.global.dispatchEvent(domEvent);
	                };
	            } else {
	                var event = document.createEvent("CustomEvent");
	                event.initCustomEvent("testingtheevent", false, true, {});
	                util.global.dispatchEvent(event);
	                return function (name, event) {
	                    var domEvent = document.createEvent("CustomEvent");
	                    domEvent.initCustomEvent(name.toLowerCase(), false, true, event);
	                    return !util.global.dispatchEvent(domEvent);
	                };
	            }
	        } catch (e) {}
	        return function () {
	            return false;
	        };
	    }();
	
	    var fireGlobalEvent = function () {
	        if (util.isNode) {
	            return function () {
	                return process.emit.apply(process, arguments);
	            };
	        } else {
	            if (!util.global) {
	                return function () {
	                    return false;
	                };
	            }
	            return function (name) {
	                var methodName = "on" + name.toLowerCase();
	                var method = util.global[methodName];
	                if (!method) return false;
	                method.apply(util.global, [].slice.call(arguments, 1));
	                return true;
	            };
	        }
	    }();
	
	    function generatePromiseLifecycleEventObject(name, promise) {
	        return { promise: promise };
	    }
	
	    var eventToObjectGenerator = {
	        promiseCreated: generatePromiseLifecycleEventObject,
	        promiseFulfilled: generatePromiseLifecycleEventObject,
	        promiseRejected: generatePromiseLifecycleEventObject,
	        promiseResolved: generatePromiseLifecycleEventObject,
	        promiseCancelled: generatePromiseLifecycleEventObject,
	        promiseChained: function promiseChained(name, promise, child) {
	            return { promise: promise, child: child };
	        },
	        warning: function warning(name, _warning) {
	            return { warning: _warning };
	        },
	        unhandledRejection: function unhandledRejection(name, reason, promise) {
	            return { reason: reason, promise: promise };
	        },
	        rejectionHandled: generatePromiseLifecycleEventObject
	    };
	
	    var activeFireEvent = function activeFireEvent(name) {
	        var globalEventFired = false;
	        try {
	            globalEventFired = fireGlobalEvent.apply(null, arguments);
	        } catch (e) {
	            async.throwLater(e);
	            globalEventFired = true;
	        }
	
	        var domEventFired = false;
	        try {
	            domEventFired = fireDomEvent(name, eventToObjectGenerator[name].apply(null, arguments));
	        } catch (e) {
	            async.throwLater(e);
	            domEventFired = true;
	        }
	
	        return domEventFired || globalEventFired;
	    };
	
	    Promise.config = function (opts) {
	        opts = Object(opts);
	        if ("longStackTraces" in opts) {
	            if (opts.longStackTraces) {
	                Promise.longStackTraces();
	            } else if (!opts.longStackTraces && Promise.hasLongStackTraces()) {
	                disableLongStackTraces();
	            }
	        }
	        if ("warnings" in opts) {
	            var warningsOption = opts.warnings;
	            config.warnings = !!warningsOption;
	            wForgottenReturn = config.warnings;
	
	            if (util.isObject(warningsOption)) {
	                if ("wForgottenReturn" in warningsOption) {
	                    wForgottenReturn = !!warningsOption.wForgottenReturn;
	                }
	            }
	        }
	        if ("cancellation" in opts && opts.cancellation && !config.cancellation) {
	            if (async.haveItemsQueued()) {
	                throw new Error("cannot enable cancellation after promises are in use");
	            }
	            Promise.prototype._clearCancellationData = cancellationClearCancellationData;
	            Promise.prototype._propagateFrom = cancellationPropagateFrom;
	            Promise.prototype._onCancel = cancellationOnCancel;
	            Promise.prototype._setOnCancel = cancellationSetOnCancel;
	            Promise.prototype._attachCancellationCallback = cancellationAttachCancellationCallback;
	            Promise.prototype._execute = cancellationExecute;
	            _propagateFromFunction = cancellationPropagateFrom;
	            config.cancellation = true;
	        }
	        if ("monitoring" in opts) {
	            if (opts.monitoring && !config.monitoring) {
	                config.monitoring = true;
	                Promise.prototype._fireEvent = activeFireEvent;
	            } else if (!opts.monitoring && config.monitoring) {
	                config.monitoring = false;
	                Promise.prototype._fireEvent = defaultFireEvent;
	            }
	        }
	        return Promise;
	    };
	
	    function defaultFireEvent() {
	        return false;
	    }
	
	    Promise.prototype._fireEvent = defaultFireEvent;
	    Promise.prototype._execute = function (executor, resolve, reject) {
	        try {
	            executor(resolve, reject);
	        } catch (e) {
	            return e;
	        }
	    };
	    Promise.prototype._onCancel = function () {};
	    Promise.prototype._setOnCancel = function (handler) {
	        ;
	    };
	    Promise.prototype._attachCancellationCallback = function (onCancel) {
	        ;
	    };
	    Promise.prototype._captureStackTrace = function () {};
	    Promise.prototype._attachExtraTrace = function () {};
	    Promise.prototype._clearCancellationData = function () {};
	    Promise.prototype._propagateFrom = function (parent, flags) {
	        ;
	        ;
	    };
	
	    function cancellationExecute(executor, resolve, reject) {
	        var promise = this;
	        try {
	            executor(resolve, reject, function (onCancel) {
	                if (typeof onCancel !== "function") {
	                    throw new TypeError("onCancel must be a function, got: " + util.toString(onCancel));
	                }
	                promise._attachCancellationCallback(onCancel);
	            });
	        } catch (e) {
	            return e;
	        }
	    }
	
	    function cancellationAttachCancellationCallback(onCancel) {
	        if (!this._isCancellable()) return this;
	
	        var previousOnCancel = this._onCancel();
	        if (previousOnCancel !== undefined) {
	            if (util.isArray(previousOnCancel)) {
	                previousOnCancel.push(onCancel);
	            } else {
	                this._setOnCancel([previousOnCancel, onCancel]);
	            }
	        } else {
	            this._setOnCancel(onCancel);
	        }
	    }
	
	    function cancellationOnCancel() {
	        return this._onCancelField;
	    }
	
	    function cancellationSetOnCancel(onCancel) {
	        this._onCancelField = onCancel;
	    }
	
	    function cancellationClearCancellationData() {
	        this._cancellationParent = undefined;
	        this._onCancelField = undefined;
	    }
	
	    function cancellationPropagateFrom(parent, flags) {
	        if ((flags & 1) !== 0) {
	            this._cancellationParent = parent;
	            var branchesRemainingToCancel = parent._branchesRemainingToCancel;
	            if (branchesRemainingToCancel === undefined) {
	                branchesRemainingToCancel = 0;
	            }
	            parent._branchesRemainingToCancel = branchesRemainingToCancel + 1;
	        }
	        if ((flags & 2) !== 0 && parent._isBound()) {
	            this._setBoundTo(parent._boundTo);
	        }
	    }
	
	    function bindingPropagateFrom(parent, flags) {
	        if ((flags & 2) !== 0 && parent._isBound()) {
	            this._setBoundTo(parent._boundTo);
	        }
	    }
	    var _propagateFromFunction = bindingPropagateFrom;
	
	    function _boundValueFunction() {
	        var ret = this._boundTo;
	        if (ret !== undefined) {
	            if (ret instanceof Promise) {
	                if (ret.isFulfilled()) {
	                    return ret.value();
	                } else {
	                    return undefined;
	                }
	            }
	        }
	        return ret;
	    }
	
	    function longStackTracesCaptureStackTrace() {
	        this._trace = new CapturedTrace(this._peekContext());
	    }
	
	    function longStackTracesAttachExtraTrace(error, ignoreSelf) {
	        if (canAttachTrace(error)) {
	            var trace = this._trace;
	            if (trace !== undefined) {
	                if (ignoreSelf) trace = trace._parent;
	            }
	            if (trace !== undefined) {
	                trace.attachExtraTrace(error);
	            } else if (!error.__stackCleaned__) {
	                var parsed = parseStackAndMessage(error);
	                util.notEnumerableProp(error, "stack", parsed.message + "\n" + parsed.stack.join("\n"));
	                util.notEnumerableProp(error, "__stackCleaned__", true);
	            }
	        }
	    }
	
	    function checkForgottenReturns(returnValue, promiseCreated, name, promise, parent) {
	        if (returnValue === undefined && promiseCreated !== null && wForgottenReturn) {
	            if (parent !== undefined && parent._returnedNonUndefined()) return;
	            if ((promise._bitField & 65535) === 0) return;
	
	            if (name) name = name + " ";
	            var handlerLine = "";
	            var creatorLine = "";
	            if (promiseCreated._trace) {
	                var traceLines = promiseCreated._trace.stack.split("\n");
	                var stack = cleanStack(traceLines);
	                for (var i = stack.length - 1; i >= 0; --i) {
	                    var line = stack[i];
	                    if (!nodeFramePattern.test(line)) {
	                        var lineMatches = line.match(parseLinePattern);
	                        if (lineMatches) {
	                            handlerLine = "at " + lineMatches[1] + ":" + lineMatches[2] + ":" + lineMatches[3] + " ";
	                        }
	                        break;
	                    }
	                }
	
	                if (stack.length > 0) {
	                    var firstUserLine = stack[0];
	                    for (var i = 0; i < traceLines.length; ++i) {
	
	                        if (traceLines[i] === firstUserLine) {
	                            if (i > 0) {
	                                creatorLine = "\n" + traceLines[i - 1];
	                            }
	                            break;
	                        }
	                    }
	                }
	            }
	            var msg = "a promise was created in a " + name + "handler " + handlerLine + "but was not returned from it, " + "see http://goo.gl/rRqMUw" + creatorLine;
	            promise._warn(msg, true, promiseCreated);
	        }
	    }
	
	    function deprecated(name, replacement) {
	        var message = name + " is deprecated and will be removed in a future version.";
	        if (replacement) message += " Use " + replacement + " instead.";
	        return warn(message);
	    }
	
	    function warn(message, shouldUseOwnTrace, promise) {
	        if (!config.warnings) return;
	        var warning = new Warning(message);
	        var ctx;
	        if (shouldUseOwnTrace) {
	            promise._attachExtraTrace(warning);
	        } else if (config.longStackTraces && (ctx = Promise._peekContext())) {
	            ctx.attachExtraTrace(warning);
	        } else {
	            var parsed = parseStackAndMessage(warning);
	            warning.stack = parsed.message + "\n" + parsed.stack.join("\n");
	        }
	
	        if (!activeFireEvent("warning", warning)) {
	            formatAndLogError(warning, "", true);
	        }
	    }
	
	    function reconstructStack(message, stacks) {
	        for (var i = 0; i < stacks.length - 1; ++i) {
	            stacks[i].push("From previous event:");
	            stacks[i] = stacks[i].join("\n");
	        }
	        if (i < stacks.length) {
	            stacks[i] = stacks[i].join("\n");
	        }
	        return message + "\n" + stacks.join("\n");
	    }
	
	    function removeDuplicateOrEmptyJumps(stacks) {
	        for (var i = 0; i < stacks.length; ++i) {
	            if (stacks[i].length === 0 || i + 1 < stacks.length && stacks[i][0] === stacks[i + 1][0]) {
	                stacks.splice(i, 1);
	                i--;
	            }
	        }
	    }
	
	    function removeCommonRoots(stacks) {
	        var current = stacks[0];
	        for (var i = 1; i < stacks.length; ++i) {
	            var prev = stacks[i];
	            var currentLastIndex = current.length - 1;
	            var currentLastLine = current[currentLastIndex];
	            var commonRootMeetPoint = -1;
	
	            for (var j = prev.length - 1; j >= 0; --j) {
	                if (prev[j] === currentLastLine) {
	                    commonRootMeetPoint = j;
	                    break;
	                }
	            }
	
	            for (var j = commonRootMeetPoint; j >= 0; --j) {
	                var line = prev[j];
	                if (current[currentLastIndex] === line) {
	                    current.pop();
	                    currentLastIndex--;
	                } else {
	                    break;
	                }
	            }
	            current = prev;
	        }
	    }
	
	    function cleanStack(stack) {
	        var ret = [];
	        for (var i = 0; i < stack.length; ++i) {
	            var line = stack[i];
	            var isTraceLine = "    (No stack trace)" === line || stackFramePattern.test(line);
	            var isInternalFrame = isTraceLine && shouldIgnore(line);
	            if (isTraceLine && !isInternalFrame) {
	                if (indentStackFrames && line.charAt(0) !== " ") {
	                    line = "    " + line;
	                }
	                ret.push(line);
	            }
	        }
	        return ret;
	    }
	
	    function stackFramesAsArray(error) {
	        var stack = error.stack.replace(/\s+$/g, "").split("\n");
	        for (var i = 0; i < stack.length; ++i) {
	            var line = stack[i];
	            if ("    (No stack trace)" === line || stackFramePattern.test(line)) {
	                break;
	            }
	        }
	        if (i > 0 && error.name != "SyntaxError") {
	            stack = stack.slice(i);
	        }
	        return stack;
	    }
	
	    function parseStackAndMessage(error) {
	        var stack = error.stack;
	        var message = error.toString();
	        stack = typeof stack === "string" && stack.length > 0 ? stackFramesAsArray(error) : ["    (No stack trace)"];
	        return {
	            message: message,
	            stack: error.name == "SyntaxError" ? stack : cleanStack(stack)
	        };
	    }
	
	    function formatAndLogError(error, title, isSoft) {
	        if (typeof console !== "undefined") {
	            var message;
	            if (util.isObject(error)) {
	                var stack = error.stack;
	                message = title + formatStack(stack, error);
	            } else {
	                message = title + String(error);
	            }
	            if (typeof printWarning === "function") {
	                printWarning(message, isSoft);
	            } else if (typeof console.log === "function" || _typeof(console.log) === "object") {
	                console.log(message);
	            }
	        }
	    }
	
	    function fireRejectionEvent(name, localHandler, reason, promise) {
	        var localEventFired = false;
	        try {
	            if (typeof localHandler === "function") {
	                localEventFired = true;
	                if (name === "rejectionHandled") {
	                    localHandler(promise);
	                } else {
	                    localHandler(reason, promise);
	                }
	            }
	        } catch (e) {
	            async.throwLater(e);
	        }
	
	        if (name === "unhandledRejection") {
	            if (!activeFireEvent(name, reason, promise) && !localEventFired) {
	                formatAndLogError(reason, "Unhandled rejection ");
	            }
	        } else {
	            activeFireEvent(name, promise);
	        }
	    }
	
	    function formatNonError(obj) {
	        var str;
	        if (typeof obj === "function") {
	            str = "[function " + (obj.name || "anonymous") + "]";
	        } else {
	            str = obj && typeof obj.toString === "function" ? obj.toString() : util.toString(obj);
	            var ruselessToString = /\[object [a-zA-Z0-9$_]+\]/;
	            if (ruselessToString.test(str)) {
	                try {
	                    var newStr = JSON.stringify(obj);
	                    str = newStr;
	                } catch (e) {}
	            }
	            if (str.length === 0) {
	                str = "(empty array)";
	            }
	        }
	        return "(<" + snip(str) + ">, no stack trace)";
	    }
	
	    function snip(str) {
	        var maxChars = 41;
	        if (str.length < maxChars) {
	            return str;
	        }
	        return str.substr(0, maxChars - 3) + "...";
	    }
	
	    function longStackTracesIsSupported() {
	        return typeof captureStackTrace === "function";
	    }
	
	    var shouldIgnore = function shouldIgnore() {
	        return false;
	    };
	    var parseLineInfoRegex = /[\/<\(]([^:\/]+):(\d+):(?:\d+)\)?\s*$/;
	    function parseLineInfo(line) {
	        var matches = line.match(parseLineInfoRegex);
	        if (matches) {
	            return {
	                fileName: matches[1],
	                line: parseInt(matches[2], 10)
	            };
	        }
	    }
	
	    function setBounds(firstLineError, lastLineError) {
	        if (!longStackTracesIsSupported()) return;
	        var firstStackLines = firstLineError.stack.split("\n");
	        var lastStackLines = lastLineError.stack.split("\n");
	        var firstIndex = -1;
	        var lastIndex = -1;
	        var firstFileName;
	        var lastFileName;
	        for (var i = 0; i < firstStackLines.length; ++i) {
	            var result = parseLineInfo(firstStackLines[i]);
	            if (result) {
	                firstFileName = result.fileName;
	                firstIndex = result.line;
	                break;
	            }
	        }
	        for (var i = 0; i < lastStackLines.length; ++i) {
	            var result = parseLineInfo(lastStackLines[i]);
	            if (result) {
	                lastFileName = result.fileName;
	                lastIndex = result.line;
	                break;
	            }
	        }
	        if (firstIndex < 0 || lastIndex < 0 || !firstFileName || !lastFileName || firstFileName !== lastFileName || firstIndex >= lastIndex) {
	            return;
	        }
	
	        shouldIgnore = function shouldIgnore(line) {
	            if (bluebirdFramePattern.test(line)) return true;
	            var info = parseLineInfo(line);
	            if (info) {
	                if (info.fileName === firstFileName && firstIndex <= info.line && info.line <= lastIndex) {
	                    return true;
	                }
	            }
	            return false;
	        };
	    }
	
	    function CapturedTrace(parent) {
	        this._parent = parent;
	        this._promisesCreated = 0;
	        var length = this._length = 1 + (parent === undefined ? 0 : parent._length);
	        captureStackTrace(this, CapturedTrace);
	        if (length > 32) this.uncycle();
	    }
	    util.inherits(CapturedTrace, Error);
	    Context.CapturedTrace = CapturedTrace;
	
	    CapturedTrace.prototype.uncycle = function () {
	        var length = this._length;
	        if (length < 2) return;
	        var nodes = [];
	        var stackToIndex = {};
	
	        for (var i = 0, node = this; node !== undefined; ++i) {
	            nodes.push(node);
	            node = node._parent;
	        }
	        length = this._length = i;
	        for (var i = length - 1; i >= 0; --i) {
	            var stack = nodes[i].stack;
	            if (stackToIndex[stack] === undefined) {
	                stackToIndex[stack] = i;
	            }
	        }
	        for (var i = 0; i < length; ++i) {
	            var currentStack = nodes[i].stack;
	            var index = stackToIndex[currentStack];
	            if (index !== undefined && index !== i) {
	                if (index > 0) {
	                    nodes[index - 1]._parent = undefined;
	                    nodes[index - 1]._length = 1;
	                }
	                nodes[i]._parent = undefined;
	                nodes[i]._length = 1;
	                var cycleEdgeNode = i > 0 ? nodes[i - 1] : this;
	
	                if (index < length - 1) {
	                    cycleEdgeNode._parent = nodes[index + 1];
	                    cycleEdgeNode._parent.uncycle();
	                    cycleEdgeNode._length = cycleEdgeNode._parent._length + 1;
	                } else {
	                    cycleEdgeNode._parent = undefined;
	                    cycleEdgeNode._length = 1;
	                }
	                var currentChildLength = cycleEdgeNode._length + 1;
	                for (var j = i - 2; j >= 0; --j) {
	                    nodes[j]._length = currentChildLength;
	                    currentChildLength++;
	                }
	                return;
	            }
	        }
	    };
	
	    CapturedTrace.prototype.attachExtraTrace = function (error) {
	        if (error.__stackCleaned__) return;
	        this.uncycle();
	        var parsed = parseStackAndMessage(error);
	        var message = parsed.message;
	        var stacks = [parsed.stack];
	
	        var trace = this;
	        while (trace !== undefined) {
	            stacks.push(cleanStack(trace.stack.split("\n")));
	            trace = trace._parent;
	        }
	        removeCommonRoots(stacks);
	        removeDuplicateOrEmptyJumps(stacks);
	        util.notEnumerableProp(error, "stack", reconstructStack(message, stacks));
	        util.notEnumerableProp(error, "__stackCleaned__", true);
	    };
	
	    var captureStackTrace = function stackDetection() {
	        var v8stackFramePattern = /^\s*at\s*/;
	        var v8stackFormatter = function v8stackFormatter(stack, error) {
	            if (typeof stack === "string") return stack;
	
	            if (error.name !== undefined && error.message !== undefined) {
	                return error.toString();
	            }
	            return formatNonError(error);
	        };
	
	        if (typeof Error.stackTraceLimit === "number" && typeof Error.captureStackTrace === "function") {
	            Error.stackTraceLimit += 6;
	            stackFramePattern = v8stackFramePattern;
	            formatStack = v8stackFormatter;
	            var captureStackTrace = Error.captureStackTrace;
	
	            shouldIgnore = function shouldIgnore(line) {
	                return bluebirdFramePattern.test(line);
	            };
	            return function (receiver, ignoreUntil) {
	                Error.stackTraceLimit += 6;
	                captureStackTrace(receiver, ignoreUntil);
	                Error.stackTraceLimit -= 6;
	            };
	        }
	        var err = new Error();
	
	        if (typeof err.stack === "string" && err.stack.split("\n")[0].indexOf("stackDetection@") >= 0) {
	            stackFramePattern = /@/;
	            formatStack = v8stackFormatter;
	            indentStackFrames = true;
	            return function captureStackTrace(o) {
	                o.stack = new Error().stack;
	            };
	        }
	
	        var hasStackAfterThrow;
	        try {
	            throw new Error();
	        } catch (e) {
	            hasStackAfterThrow = "stack" in e;
	        }
	        if (!("stack" in err) && hasStackAfterThrow && typeof Error.stackTraceLimit === "number") {
	            stackFramePattern = v8stackFramePattern;
	            formatStack = v8stackFormatter;
	            return function captureStackTrace(o) {
	                Error.stackTraceLimit += 6;
	                try {
	                    throw new Error();
	                } catch (e) {
	                    o.stack = e.stack;
	                }
	                Error.stackTraceLimit -= 6;
	            };
	        }
	
	        formatStack = function formatStack(stack, error) {
	            if (typeof stack === "string") return stack;
	
	            if (((typeof error === "undefined" ? "undefined" : _typeof(error)) === "object" || typeof error === "function") && error.name !== undefined && error.message !== undefined) {
	                return error.toString();
	            }
	            return formatNonError(error);
	        };
	
	        return null;
	    }([]);
	
	    if (typeof console !== "undefined" && typeof console.warn !== "undefined") {
	        printWarning = function printWarning(message) {
	            console.warn(message);
	        };
	        if (util.isNode && process.stderr.isTTY) {
	            printWarning = function printWarning(message, isSoft) {
	                var color = isSoft ? "\x1B[33m" : "\x1B[31m";
	                console.warn(color + message + "\x1B[0m\n");
	            };
	        } else if (!util.isNode && typeof new Error().stack === "string") {
	            printWarning = function printWarning(message, isSoft) {
	                console.warn("%c" + message, isSoft ? "color: darkorange" : "color: red");
	            };
	        }
	    }
	
	    var config = {
	        warnings: warnings,
	        longStackTraces: false,
	        cancellation: false,
	        monitoring: false
	    };
	
	    if (longStackTraces) Promise.longStackTraces();
	
	    return {
	        longStackTraces: function longStackTraces() {
	            return config.longStackTraces;
	        },
	        warnings: function warnings() {
	            return config.warnings;
	        },
	        cancellation: function cancellation() {
	            return config.cancellation;
	        },
	        monitoring: function monitoring() {
	            return config.monitoring;
	        },
	        propagateFromFunction: function propagateFromFunction() {
	            return _propagateFromFunction;
	        },
	        boundValueFunction: function boundValueFunction() {
	            return _boundValueFunction;
	        },
	        checkForgottenReturns: checkForgottenReturns,
	        setBounds: setBounds,
	        warn: warn,
	        deprecated: deprecated,
	        CapturedTrace: CapturedTrace,
	        fireDomEvent: fireDomEvent,
	        fireGlobalEvent: fireGlobalEvent
	    };
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	module.exports = function (Promise, tryConvertToPromise, NEXT_FILTER) {
	    var util = __webpack_require__(8);
	    var CancellationError = Promise.CancellationError;
	    var errorObj = util.errorObj;
	    var catchFilter = __webpack_require__(21)(NEXT_FILTER);
	
	    function PassThroughHandlerContext(promise, type, handler) {
	        this.promise = promise;
	        this.type = type;
	        this.handler = handler;
	        this.called = false;
	        this.cancelPromise = null;
	    }
	
	    PassThroughHandlerContext.prototype.isFinallyHandler = function () {
	        return this.type === 0;
	    };
	
	    function FinallyHandlerCancelReaction(finallyHandler) {
	        this.finallyHandler = finallyHandler;
	    }
	
	    FinallyHandlerCancelReaction.prototype._resultCancelled = function () {
	        checkCancel(this.finallyHandler);
	    };
	
	    function checkCancel(ctx, reason) {
	        if (ctx.cancelPromise != null) {
	            if (arguments.length > 1) {
	                ctx.cancelPromise._reject(reason);
	            } else {
	                ctx.cancelPromise._cancel();
	            }
	            ctx.cancelPromise = null;
	            return true;
	        }
	        return false;
	    }
	
	    function succeed() {
	        return finallyHandler.call(this, this.promise._target()._settledValue());
	    }
	    function fail(reason) {
	        if (checkCancel(this, reason)) return;
	        errorObj.e = reason;
	        return errorObj;
	    }
	    function finallyHandler(reasonOrValue) {
	        var promise = this.promise;
	        var handler = this.handler;
	
	        if (!this.called) {
	            this.called = true;
	            var ret = this.isFinallyHandler() ? handler.call(promise._boundValue()) : handler.call(promise._boundValue(), reasonOrValue);
	            if (ret === NEXT_FILTER) {
	                return ret;
	            } else if (ret !== undefined) {
	                promise._setReturnedNonUndefined();
	                var maybePromise = tryConvertToPromise(ret, promise);
	                if (maybePromise instanceof Promise) {
	                    if (this.cancelPromise != null) {
	                        if (maybePromise._isCancelled()) {
	                            var reason = new CancellationError("late cancellation observer");
	                            promise._attachExtraTrace(reason);
	                            errorObj.e = reason;
	                            return errorObj;
	                        } else if (maybePromise.isPending()) {
	                            maybePromise._attachCancellationCallback(new FinallyHandlerCancelReaction(this));
	                        }
	                    }
	                    return maybePromise._then(succeed, fail, undefined, this, undefined);
	                }
	            }
	        }
	
	        if (promise.isRejected()) {
	            checkCancel(this);
	            errorObj.e = reasonOrValue;
	            return errorObj;
	        } else {
	            checkCancel(this);
	            return reasonOrValue;
	        }
	    }
	
	    Promise.prototype._passThrough = function (handler, type, success, fail) {
	        if (typeof handler !== "function") return this.then();
	        return this._then(success, fail, undefined, new PassThroughHandlerContext(this, type, handler), undefined);
	    };
	
	    Promise.prototype.lastly = Promise.prototype["finally"] = function (handler) {
	        return this._passThrough(handler, 0, finallyHandler, finallyHandler);
	    };
	
	    Promise.prototype.tap = function (handler) {
	        return this._passThrough(handler, 1, finallyHandler);
	    };
	
	    Promise.prototype.tapCatch = function (handlerOrPredicate) {
	        var len = arguments.length;
	        if (len === 1) {
	            return this._passThrough(handlerOrPredicate, 1, undefined, finallyHandler);
	        } else {
	            var catchInstances = new Array(len - 1),
	                j = 0,
	                i;
	            for (i = 0; i < len - 1; ++i) {
	                var item = arguments[i];
	                if (util.isObject(item)) {
	                    catchInstances[j++] = item;
	                } else {
	                    return Promise.reject(new TypeError("tapCatch statement predicate: " + "expecting an object but got " + util.classString(item)));
	                }
	            }
	            catchInstances.length = j;
	            var handler = arguments[i];
	            return this._passThrough(catchFilter(catchInstances, handler, this), 1, undefined, finallyHandler);
	        }
	    };
	
	    return PassThroughHandlerContext;
	};

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	module.exports = function (NEXT_FILTER) {
	    var util = __webpack_require__(8);
	    var getKeys = __webpack_require__(9).keys;
	    var tryCatch = util.tryCatch;
	    var errorObj = util.errorObj;
	
	    function catchFilter(instances, cb, promise) {
	        return function (e) {
	            var boundTo = promise._boundValue();
	            predicateLoop: for (var i = 0; i < instances.length; ++i) {
	                var item = instances[i];
	
	                if (item === Error || item != null && item.prototype instanceof Error) {
	                    if (e instanceof item) {
	                        return tryCatch(cb).call(boundTo, e);
	                    }
	                } else if (typeof item === "function") {
	                    var matchesPredicate = tryCatch(item).call(boundTo, e);
	                    if (matchesPredicate === errorObj) {
	                        return matchesPredicate;
	                    } else if (matchesPredicate) {
	                        return tryCatch(cb).call(boundTo, e);
	                    }
	                } else if (util.isObject(e)) {
	                    var keys = getKeys(item);
	                    for (var j = 0; j < keys.length; ++j) {
	                        var key = keys[j];
	                        if (item[key] != e[key]) {
	                            continue predicateLoop;
	                        }
	                    }
	                    return tryCatch(cb).call(boundTo, e);
	                }
	            }
	            return NEXT_FILTER;
	        };
	    }
	
	    return catchFilter;
	};

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var util = __webpack_require__(8);
	var maybeWrapAsError = util.maybeWrapAsError;
	var errors = __webpack_require__(15);
	var OperationalError = errors.OperationalError;
	var es5 = __webpack_require__(9);
	
	function isUntypedError(obj) {
	    return obj instanceof Error && es5.getPrototypeOf(obj) === Error.prototype;
	}
	
	var rErrorKey = /^(?:name|message|stack|cause)$/;
	function wrapAsOperationalError(obj) {
	    var ret;
	    if (isUntypedError(obj)) {
	        ret = new OperationalError(obj);
	        ret.name = obj.name;
	        ret.message = obj.message;
	        ret.stack = obj.stack;
	        var keys = es5.keys(obj);
	        for (var i = 0; i < keys.length; ++i) {
	            var key = keys[i];
	            if (!rErrorKey.test(key)) {
	                ret[key] = obj[key];
	            }
	        }
	        return ret;
	    }
	    util.markAsOriginatingFromRejection(obj);
	    return obj;
	}
	
	function nodebackForPromise(promise, multiArgs) {
	    return function (err, value) {
	        if (promise === null) return;
	        if (err) {
	            var wrapped = wrapAsOperationalError(maybeWrapAsError(err));
	            promise._attachExtraTrace(wrapped);
	            promise._reject(wrapped);
	        } else if (!multiArgs) {
	            promise._fulfill(value);
	        } else {
	            var $_len = arguments.length;var args = new Array(Math.max($_len - 1, 0));for (var $_i = 1; $_i < $_len; ++$_i) {
	                args[$_i - 1] = arguments[$_i];
	            };
	            promise._fulfill(args);
	        }
	        promise = null;
	    };
	}
	
	module.exports = nodebackForPromise;

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	module.exports = function (Promise, INTERNAL, tryConvertToPromise, apiRejection, debug) {
	    var util = __webpack_require__(8);
	    var tryCatch = util.tryCatch;
	
	    Promise.method = function (fn) {
	        if (typeof fn !== "function") {
	            throw new Promise.TypeError("expecting a function but got " + util.classString(fn));
	        }
	        return function () {
	            var ret = new Promise(INTERNAL);
	            ret._captureStackTrace();
	            ret._pushContext();
	            var value = tryCatch(fn).apply(this, arguments);
	            var promiseCreated = ret._popContext();
	            debug.checkForgottenReturns(value, promiseCreated, "Promise.method", ret);
	            ret._resolveFromSyncValue(value);
	            return ret;
	        };
	    };
	
	    Promise.attempt = Promise["try"] = function (fn) {
	        if (typeof fn !== "function") {
	            return apiRejection("expecting a function but got " + util.classString(fn));
	        }
	        var ret = new Promise(INTERNAL);
	        ret._captureStackTrace();
	        ret._pushContext();
	        var value;
	        if (arguments.length > 1) {
	            debug.deprecated("calling Promise.try with more than 1 argument");
	            var arg = arguments[1];
	            var ctx = arguments[2];
	            value = util.isArray(arg) ? tryCatch(fn).apply(ctx, arg) : tryCatch(fn).call(ctx, arg);
	        } else {
	            value = tryCatch(fn)();
	        }
	        var promiseCreated = ret._popContext();
	        debug.checkForgottenReturns(value, promiseCreated, "Promise.try", ret);
	        ret._resolveFromSyncValue(value);
	        return ret;
	    };
	
	    Promise.prototype._resolveFromSyncValue = function (value) {
	        if (value === util.errorObj) {
	            this._rejectCallback(value.e, false);
	        } else {
	            this._resolveCallback(value, true);
	        }
	    };
	};

/***/ },
/* 24 */
/***/ function(module, exports) {

	"use strict";
	
	module.exports = function (Promise, INTERNAL, tryConvertToPromise, debug) {
	    var calledBind = false;
	    var rejectThis = function rejectThis(_, e) {
	        this._reject(e);
	    };
	
	    var targetRejected = function targetRejected(e, context) {
	        context.promiseRejectionQueued = true;
	        context.bindingPromise._then(rejectThis, rejectThis, null, this, e);
	    };
	
	    var bindingResolved = function bindingResolved(thisArg, context) {
	        if ((this._bitField & 50397184) === 0) {
	            this._resolveCallback(context.target);
	        }
	    };
	
	    var bindingRejected = function bindingRejected(e, context) {
	        if (!context.promiseRejectionQueued) this._reject(e);
	    };
	
	    Promise.prototype.bind = function (thisArg) {
	        if (!calledBind) {
	            calledBind = true;
	            Promise.prototype._propagateFrom = debug.propagateFromFunction();
	            Promise.prototype._boundValue = debug.boundValueFunction();
	        }
	        var maybePromise = tryConvertToPromise(thisArg);
	        var ret = new Promise(INTERNAL);
	        ret._propagateFrom(this, 1);
	        var target = this._target();
	        ret._setBoundTo(maybePromise);
	        if (maybePromise instanceof Promise) {
	            var context = {
	                promiseRejectionQueued: false,
	                promise: ret,
	                target: target,
	                bindingPromise: maybePromise
	            };
	            target._then(INTERNAL, targetRejected, undefined, ret, context);
	            maybePromise._then(bindingResolved, bindingRejected, undefined, ret, context);
	            ret._setOnCancel(maybePromise);
	        } else {
	            ret._resolveCallback(target);
	        }
	        return ret;
	    };
	
	    Promise.prototype._setBoundTo = function (obj) {
	        if (obj !== undefined) {
	            this._bitField = this._bitField | 2097152;
	            this._boundTo = obj;
	        } else {
	            this._bitField = this._bitField & ~2097152;
	        }
	    };
	
	    Promise.prototype._isBound = function () {
	        return (this._bitField & 2097152) === 2097152;
	    };
	
	    Promise.bind = function (thisArg, value) {
	        return Promise.resolve(value).bind(thisArg);
	    };
	};

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	module.exports = function (Promise, PromiseArray, apiRejection, debug) {
	    var util = __webpack_require__(8);
	    var tryCatch = util.tryCatch;
	    var errorObj = util.errorObj;
	    var async = Promise._async;
	
	    Promise.prototype["break"] = Promise.prototype.cancel = function () {
	        if (!debug.cancellation()) return this._warn("cancellation is disabled");
	
	        var promise = this;
	        var child = promise;
	        while (promise._isCancellable()) {
	            if (!promise._cancelBy(child)) {
	                if (child._isFollowing()) {
	                    child._followee().cancel();
	                } else {
	                    child._cancelBranched();
	                }
	                break;
	            }
	
	            var parent = promise._cancellationParent;
	            if (parent == null || !parent._isCancellable()) {
	                if (promise._isFollowing()) {
	                    promise._followee().cancel();
	                } else {
	                    promise._cancelBranched();
	                }
	                break;
	            } else {
	                if (promise._isFollowing()) promise._followee().cancel();
	                promise._setWillBeCancelled();
	                child = promise;
	                promise = parent;
	            }
	        }
	    };
	
	    Promise.prototype._branchHasCancelled = function () {
	        this._branchesRemainingToCancel--;
	    };
	
	    Promise.prototype._enoughBranchesHaveCancelled = function () {
	        return this._branchesRemainingToCancel === undefined || this._branchesRemainingToCancel <= 0;
	    };
	
	    Promise.prototype._cancelBy = function (canceller) {
	        if (canceller === this) {
	            this._branchesRemainingToCancel = 0;
	            this._invokeOnCancel();
	            return true;
	        } else {
	            this._branchHasCancelled();
	            if (this._enoughBranchesHaveCancelled()) {
	                this._invokeOnCancel();
	                return true;
	            }
	        }
	        return false;
	    };
	
	    Promise.prototype._cancelBranched = function () {
	        if (this._enoughBranchesHaveCancelled()) {
	            this._cancel();
	        }
	    };
	
	    Promise.prototype._cancel = function () {
	        if (!this._isCancellable()) return;
	        this._setCancelled();
	        async.invoke(this._cancelPromises, this, undefined);
	    };
	
	    Promise.prototype._cancelPromises = function () {
	        if (this._length() > 0) this._settlePromises();
	    };
	
	    Promise.prototype._unsetOnCancel = function () {
	        this._onCancelField = undefined;
	    };
	
	    Promise.prototype._isCancellable = function () {
	        return this.isPending() && !this._isCancelled();
	    };
	
	    Promise.prototype.isCancellable = function () {
	        return this.isPending() && !this.isCancelled();
	    };
	
	    Promise.prototype._doInvokeOnCancel = function (onCancelCallback, internalOnly) {
	        if (util.isArray(onCancelCallback)) {
	            for (var i = 0; i < onCancelCallback.length; ++i) {
	                this._doInvokeOnCancel(onCancelCallback[i], internalOnly);
	            }
	        } else if (onCancelCallback !== undefined) {
	            if (typeof onCancelCallback === "function") {
	                if (!internalOnly) {
	                    var e = tryCatch(onCancelCallback).call(this._boundValue());
	                    if (e === errorObj) {
	                        this._attachExtraTrace(e.e);
	                        async.throwLater(e.e);
	                    }
	                }
	            } else {
	                onCancelCallback._resultCancelled(this);
	            }
	        }
	    };
	
	    Promise.prototype._invokeOnCancel = function () {
	        var onCancelCallback = this._onCancel();
	        this._unsetOnCancel();
	        async.invoke(this._doInvokeOnCancel, this, onCancelCallback);
	    };
	
	    Promise.prototype._invokeInternalOnCancel = function () {
	        if (this._isCancellable()) {
	            this._doInvokeOnCancel(this._onCancel(), true);
	            this._unsetOnCancel();
	        }
	    };
	
	    Promise.prototype._resultCancelled = function () {
	        this.cancel();
	    };
	};

/***/ },
/* 26 */
/***/ function(module, exports) {

	"use strict";
	
	module.exports = function (Promise) {
	    function returner() {
	        return this.value;
	    }
	    function thrower() {
	        throw this.reason;
	    }
	
	    Promise.prototype["return"] = Promise.prototype.thenReturn = function (value) {
	        if (value instanceof Promise) value.suppressUnhandledRejections();
	        return this._then(returner, undefined, undefined, { value: value }, undefined);
	    };
	
	    Promise.prototype["throw"] = Promise.prototype.thenThrow = function (reason) {
	        return this._then(thrower, undefined, undefined, { reason: reason }, undefined);
	    };
	
	    Promise.prototype.catchThrow = function (reason) {
	        if (arguments.length <= 1) {
	            return this._then(undefined, thrower, undefined, { reason: reason }, undefined);
	        } else {
	            var _reason = arguments[1];
	            var handler = function handler() {
	                throw _reason;
	            };
	            return this.caught(reason, handler);
	        }
	    };
	
	    Promise.prototype.catchReturn = function (value) {
	        if (arguments.length <= 1) {
	            if (value instanceof Promise) value.suppressUnhandledRejections();
	            return this._then(undefined, returner, undefined, { value: value }, undefined);
	        } else {
	            var _value = arguments[1];
	            if (_value instanceof Promise) _value.suppressUnhandledRejections();
	            var handler = function handler() {
	                return _value;
	            };
	            return this.caught(value, handler);
	        }
	    };
	};

/***/ },
/* 27 */
/***/ function(module, exports) {

	"use strict";
	
	module.exports = function (Promise) {
	    function PromiseInspection(promise) {
	        if (promise !== undefined) {
	            promise = promise._target();
	            this._bitField = promise._bitField;
	            this._settledValueField = promise._isFateSealed() ? promise._settledValue() : undefined;
	        } else {
	            this._bitField = 0;
	            this._settledValueField = undefined;
	        }
	    }
	
	    PromiseInspection.prototype._settledValue = function () {
	        return this._settledValueField;
	    };
	
	    var value = PromiseInspection.prototype.value = function () {
	        if (!this.isFulfilled()) {
	            throw new TypeError("cannot get fulfillment value of a non-fulfilled promise\n\n    See http://goo.gl/MqrFmX\n");
	        }
	        return this._settledValue();
	    };
	
	    var reason = PromiseInspection.prototype.error = PromiseInspection.prototype.reason = function () {
	        if (!this.isRejected()) {
	            throw new TypeError("cannot get rejection reason of a non-rejected promise\n\n    See http://goo.gl/MqrFmX\n");
	        }
	        return this._settledValue();
	    };
	
	    var isFulfilled = PromiseInspection.prototype.isFulfilled = function () {
	        return (this._bitField & 33554432) !== 0;
	    };
	
	    var isRejected = PromiseInspection.prototype.isRejected = function () {
	        return (this._bitField & 16777216) !== 0;
	    };
	
	    var isPending = PromiseInspection.prototype.isPending = function () {
	        return (this._bitField & 50397184) === 0;
	    };
	
	    var isResolved = PromiseInspection.prototype.isResolved = function () {
	        return (this._bitField & 50331648) !== 0;
	    };
	
	    PromiseInspection.prototype.isCancelled = function () {
	        return (this._bitField & 8454144) !== 0;
	    };
	
	    Promise.prototype.__isCancelled = function () {
	        return (this._bitField & 65536) === 65536;
	    };
	
	    Promise.prototype._isCancelled = function () {
	        return this._target().__isCancelled();
	    };
	
	    Promise.prototype.isCancelled = function () {
	        return (this._target()._bitField & 8454144) !== 0;
	    };
	
	    Promise.prototype.isPending = function () {
	        return isPending.call(this._target());
	    };
	
	    Promise.prototype.isRejected = function () {
	        return isRejected.call(this._target());
	    };
	
	    Promise.prototype.isFulfilled = function () {
	        return isFulfilled.call(this._target());
	    };
	
	    Promise.prototype.isResolved = function () {
	        return isResolved.call(this._target());
	    };
	
	    Promise.prototype.value = function () {
	        return value.call(this._target());
	    };
	
	    Promise.prototype.reason = function () {
	        var target = this._target();
	        target._unsetRejectionIsUnhandled();
	        return reason.call(target);
	    };
	
	    Promise.prototype._value = function () {
	        return this._settledValue();
	    };
	
	    Promise.prototype._reason = function () {
	        this._unsetRejectionIsUnhandled();
	        return this._settledValue();
	    };
	
	    Promise.PromiseInspection = PromiseInspection;
	};

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	module.exports = function (Promise, PromiseArray, tryConvertToPromise, INTERNAL, async, getDomain) {
	    var util = __webpack_require__(8);
	    var canEvaluate = util.canEvaluate;
	    var tryCatch = util.tryCatch;
	    var errorObj = util.errorObj;
	    var reject;
	
	    if (true) {
	        if (canEvaluate) {
	            var thenCallback = function thenCallback(i) {
	                return new Function("value", "holder", "                             \n\
	            'use strict';                                                    \n\
	            holder.pIndex = value;                                           \n\
	            holder.checkFulfillment(this);                                   \n\
	            ".replace(/Index/g, i));
	            };
	
	            var promiseSetter = function promiseSetter(i) {
	                return new Function("promise", "holder", "                           \n\
	            'use strict';                                                    \n\
	            holder.pIndex = promise;                                         \n\
	            ".replace(/Index/g, i));
	            };
	
	            var generateHolderClass = function generateHolderClass(total) {
	                var props = new Array(total);
	                for (var i = 0; i < props.length; ++i) {
	                    props[i] = "this.p" + (i + 1);
	                }
	                var assignment = props.join(" = ") + " = null;";
	                var cancellationCode = "var promise;\n" + props.map(function (prop) {
	                    return "                                                         \n\
	                promise = " + prop + ";                                      \n\
	                if (promise instanceof Promise) {                            \n\
	                    promise.cancel();                                        \n\
	                }                                                            \n\
	            ";
	                }).join("\n");
	                var passedArguments = props.join(", ");
	                var name = "Holder$" + total;
	
	                var code = "return function(tryCatch, errorObj, Promise, async) {    \n\
	            'use strict';                                                    \n\
	            function [TheName](fn) {                                         \n\
	                [TheProperties]                                              \n\
	                this.fn = fn;                                                \n\
	                this.asyncNeeded = true;                                     \n\
	                this.now = 0;                                                \n\
	            }                                                                \n\
	                                                                             \n\
	            [TheName].prototype._callFunction = function(promise) {          \n\
	                promise._pushContext();                                      \n\
	                var ret = tryCatch(this.fn)([ThePassedArguments]);           \n\
	                promise._popContext();                                       \n\
	                if (ret === errorObj) {                                      \n\
	                    promise._rejectCallback(ret.e, false);                   \n\
	                } else {                                                     \n\
	                    promise._resolveCallback(ret);                           \n\
	                }                                                            \n\
	            };                                                               \n\
	                                                                             \n\
	            [TheName].prototype.checkFulfillment = function(promise) {       \n\
	                var now = ++this.now;                                        \n\
	                if (now === [TheTotal]) {                                    \n\
	                    if (this.asyncNeeded) {                                  \n\
	                        async.invoke(this._callFunction, this, promise);     \n\
	                    } else {                                                 \n\
	                        this._callFunction(promise);                         \n\
	                    }                                                        \n\
	                                                                             \n\
	                }                                                            \n\
	            };                                                               \n\
	                                                                             \n\
	            [TheName].prototype._resultCancelled = function() {              \n\
	                [CancellationCode]                                           \n\
	            };                                                               \n\
	                                                                             \n\
	            return [TheName];                                                \n\
	        }(tryCatch, errorObj, Promise, async);                               \n\
	        ";
	
	                code = code.replace(/\[TheName\]/g, name).replace(/\[TheTotal\]/g, total).replace(/\[ThePassedArguments\]/g, passedArguments).replace(/\[TheProperties\]/g, assignment).replace(/\[CancellationCode\]/g, cancellationCode);
	
	                return new Function("tryCatch", "errorObj", "Promise", "async", code)(tryCatch, errorObj, Promise, async);
	            };
	
	            var holderClasses = [];
	            var thenCallbacks = [];
	            var promiseSetters = [];
	
	            for (var i = 0; i < 8; ++i) {
	                holderClasses.push(generateHolderClass(i + 1));
	                thenCallbacks.push(thenCallback(i + 1));
	                promiseSetters.push(promiseSetter(i + 1));
	            }
	
	            reject = function reject(reason) {
	                this._reject(reason);
	            };
	        }
	    }
	
	    Promise.join = function () {
	        var last = arguments.length - 1;
	        var fn;
	        if (last > 0 && typeof arguments[last] === "function") {
	            fn = arguments[last];
	            if (true) {
	                if (last <= 8 && canEvaluate) {
	                    var ret = new Promise(INTERNAL);
	                    ret._captureStackTrace();
	                    var HolderClass = holderClasses[last - 1];
	                    var holder = new HolderClass(fn);
	                    var callbacks = thenCallbacks;
	
	                    for (var i = 0; i < last; ++i) {
	                        var maybePromise = tryConvertToPromise(arguments[i], ret);
	                        if (maybePromise instanceof Promise) {
	                            maybePromise = maybePromise._target();
	                            var bitField = maybePromise._bitField;
	                            ;
	                            if ((bitField & 50397184) === 0) {
	                                maybePromise._then(callbacks[i], reject, undefined, ret, holder);
	                                promiseSetters[i](maybePromise, holder);
	                                holder.asyncNeeded = false;
	                            } else if ((bitField & 33554432) !== 0) {
	                                callbacks[i].call(ret, maybePromise._value(), holder);
	                            } else if ((bitField & 16777216) !== 0) {
	                                ret._reject(maybePromise._reason());
	                            } else {
	                                ret._cancel();
	                            }
	                        } else {
	                            callbacks[i].call(ret, maybePromise, holder);
	                        }
	                    }
	
	                    if (!ret._isFateSealed()) {
	                        if (holder.asyncNeeded) {
	                            var domain = getDomain();
	                            if (domain !== null) {
	                                holder.fn = util.domainBind(domain, holder.fn);
	                            }
	                        }
	                        ret._setAsyncGuaranteed();
	                        ret._setOnCancel(holder);
	                    }
	                    return ret;
	                }
	            }
	        }
	        var $_len = arguments.length;var args = new Array($_len);for (var $_i = 0; $_i < $_len; ++$_i) {
	            args[$_i] = arguments[$_i];
	        };
	        if (fn) args.pop();
	        var ret = new PromiseArray(args).promise();
	        return fn !== undefined ? ret.spread(fn) : ret;
	    };
	};

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	module.exports = function (Promise, PromiseArray, apiRejection, tryConvertToPromise, INTERNAL, debug) {
	    var getDomain = Promise._getDomain;
	    var util = __webpack_require__(8);
	    var tryCatch = util.tryCatch;
	    var errorObj = util.errorObj;
	    var async = Promise._async;
	
	    function MappingPromiseArray(promises, fn, limit, _filter) {
	        this.constructor$(promises);
	        this._promise._captureStackTrace();
	        var domain = getDomain();
	        this._callback = domain === null ? fn : util.domainBind(domain, fn);
	        this._preservedValues = _filter === INTERNAL ? new Array(this.length()) : null;
	        this._limit = limit;
	        this._inFlight = 0;
	        this._queue = [];
	        async.invoke(this._asyncInit, this, undefined);
	    }
	    util.inherits(MappingPromiseArray, PromiseArray);
	
	    MappingPromiseArray.prototype._asyncInit = function () {
	        this._init$(undefined, -2);
	    };
	
	    MappingPromiseArray.prototype._init = function () {};
	
	    MappingPromiseArray.prototype._promiseFulfilled = function (value, index) {
	        var values = this._values;
	        var length = this.length();
	        var preservedValues = this._preservedValues;
	        var limit = this._limit;
	
	        if (index < 0) {
	            index = index * -1 - 1;
	            values[index] = value;
	            if (limit >= 1) {
	                this._inFlight--;
	                this._drainQueue();
	                if (this._isResolved()) return true;
	            }
	        } else {
	            if (limit >= 1 && this._inFlight >= limit) {
	                values[index] = value;
	                this._queue.push(index);
	                return false;
	            }
	            if (preservedValues !== null) preservedValues[index] = value;
	
	            var promise = this._promise;
	            var callback = this._callback;
	            var receiver = promise._boundValue();
	            promise._pushContext();
	            var ret = tryCatch(callback).call(receiver, value, index, length);
	            var promiseCreated = promise._popContext();
	            debug.checkForgottenReturns(ret, promiseCreated, preservedValues !== null ? "Promise.filter" : "Promise.map", promise);
	            if (ret === errorObj) {
	                this._reject(ret.e);
	                return true;
	            }
	
	            var maybePromise = tryConvertToPromise(ret, this._promise);
	            if (maybePromise instanceof Promise) {
	                maybePromise = maybePromise._target();
	                var bitField = maybePromise._bitField;
	                ;
	                if ((bitField & 50397184) === 0) {
	                    if (limit >= 1) this._inFlight++;
	                    values[index] = maybePromise;
	                    maybePromise._proxy(this, (index + 1) * -1);
	                    return false;
	                } else if ((bitField & 33554432) !== 0) {
	                    ret = maybePromise._value();
	                } else if ((bitField & 16777216) !== 0) {
	                    this._reject(maybePromise._reason());
	                    return true;
	                } else {
	                    this._cancel();
	                    return true;
	                }
	            }
	            values[index] = ret;
	        }
	        var totalResolved = ++this._totalResolved;
	        if (totalResolved >= length) {
	            if (preservedValues !== null) {
	                this._filter(values, preservedValues);
	            } else {
	                this._resolve(values);
	            }
	            return true;
	        }
	        return false;
	    };
	
	    MappingPromiseArray.prototype._drainQueue = function () {
	        var queue = this._queue;
	        var limit = this._limit;
	        var values = this._values;
	        while (queue.length > 0 && this._inFlight < limit) {
	            if (this._isResolved()) return;
	            var index = queue.pop();
	            this._promiseFulfilled(values[index], index);
	        }
	    };
	
	    MappingPromiseArray.prototype._filter = function (booleans, values) {
	        var len = values.length;
	        var ret = new Array(len);
	        var j = 0;
	        for (var i = 0; i < len; ++i) {
	            if (booleans[i]) ret[j++] = values[i];
	        }
	        ret.length = j;
	        this._resolve(ret);
	    };
	
	    MappingPromiseArray.prototype.preservedValues = function () {
	        return this._preservedValues;
	    };
	
	    function map(promises, fn, options, _filter) {
	        if (typeof fn !== "function") {
	            return apiRejection("expecting a function but got " + util.classString(fn));
	        }
	
	        var limit = 0;
	        if (options !== undefined) {
	            if ((typeof options === "undefined" ? "undefined" : _typeof(options)) === "object" && options !== null) {
	                if (typeof options.concurrency !== "number") {
	                    return Promise.reject(new TypeError("'concurrency' must be a number but it is " + util.classString(options.concurrency)));
	                }
	                limit = options.concurrency;
	            } else {
	                return Promise.reject(new TypeError("options argument must be an object but it is " + util.classString(options)));
	            }
	        }
	        limit = typeof limit === "number" && isFinite(limit) && limit >= 1 ? limit : 0;
	        return new MappingPromiseArray(promises, fn, limit, _filter).promise();
	    }
	
	    Promise.prototype.map = function (fn, options) {
	        return map(this, fn, options, null);
	    };
	
	    Promise.map = function (promises, fn, options, _filter) {
	        return map(promises, fn, options, _filter);
	    };
	};

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var cr = Object.create;
	if (cr) {
	    var callerCache = cr(null);
	    var getterCache = cr(null);
	    callerCache[" size"] = getterCache[" size"] = 0;
	}
	
	module.exports = function (Promise) {
	    var util = __webpack_require__(8);
	    var canEvaluate = util.canEvaluate;
	    var isIdentifier = util.isIdentifier;
	
	    var getMethodCaller;
	    var getGetter;
	    if (true) {
	        var makeMethodCaller = function makeMethodCaller(methodName) {
	            return new Function("ensureMethod", "                                    \n\
	        return function(obj) {                                               \n\
	            'use strict'                                                     \n\
	            var len = this.length;                                           \n\
	            ensureMethod(obj, 'methodName');                                 \n\
	            switch(len) {                                                    \n\
	                case 1: return obj.methodName(this[0]);                      \n\
	                case 2: return obj.methodName(this[0], this[1]);             \n\
	                case 3: return obj.methodName(this[0], this[1], this[2]);    \n\
	                case 0: return obj.methodName();                             \n\
	                default:                                                     \n\
	                    return obj.methodName.apply(obj, this);                  \n\
	            }                                                                \n\
	        };                                                                   \n\
	        ".replace(/methodName/g, methodName))(ensureMethod);
	        };
	
	        var makeGetter = function makeGetter(propertyName) {
	            return new Function("obj", "                                             \n\
	        'use strict';                                                        \n\
	        return obj.propertyName;                                             \n\
	        ".replace("propertyName", propertyName));
	        };
	
	        var getCompiled = function getCompiled(name, compiler, cache) {
	            var ret = cache[name];
	            if (typeof ret !== "function") {
	                if (!isIdentifier(name)) {
	                    return null;
	                }
	                ret = compiler(name);
	                cache[name] = ret;
	                cache[" size"]++;
	                if (cache[" size"] > 512) {
	                    var keys = Object.keys(cache);
	                    for (var i = 0; i < 256; ++i) {
	                        delete cache[keys[i]];
	                    }cache[" size"] = keys.length - 256;
	                }
	            }
	            return ret;
	        };
	
	        getMethodCaller = function getMethodCaller(name) {
	            return getCompiled(name, makeMethodCaller, callerCache);
	        };
	
	        getGetter = function getGetter(name) {
	            return getCompiled(name, makeGetter, getterCache);
	        };
	    }
	
	    function ensureMethod(obj, methodName) {
	        var fn;
	        if (obj != null) fn = obj[methodName];
	        if (typeof fn !== "function") {
	            var message = "Object " + util.classString(obj) + " has no method '" + util.toString(methodName) + "'";
	            throw new Promise.TypeError(message);
	        }
	        return fn;
	    }
	
	    function caller(obj) {
	        var methodName = this.pop();
	        var fn = ensureMethod(obj, methodName);
	        return fn.apply(obj, this);
	    }
	    Promise.prototype.call = function (methodName) {
	        var $_len = arguments.length;var args = new Array(Math.max($_len - 1, 0));for (var $_i = 1; $_i < $_len; ++$_i) {
	            args[$_i - 1] = arguments[$_i];
	        };
	        if (true) {
	            if (canEvaluate) {
	                var maybeCaller = getMethodCaller(methodName);
	                if (maybeCaller !== null) {
	                    return this._then(maybeCaller, undefined, undefined, args, undefined);
	                }
	            }
	        }
	        args.push(methodName);
	        return this._then(caller, undefined, undefined, args, undefined);
	    };
	
	    function namedGetter(obj) {
	        return obj[this];
	    }
	    function indexedGetter(obj) {
	        var index = +this;
	        if (index < 0) index = Math.max(0, index + obj.length);
	        return obj[index];
	    }
	    Promise.prototype.get = function (propertyName) {
	        var isIndex = typeof propertyName === "number";
	        var getter;
	        if (!isIndex) {
	            if (canEvaluate) {
	                var maybeGetter = getGetter(propertyName);
	                getter = maybeGetter !== null ? maybeGetter : namedGetter;
	            } else {
	                getter = namedGetter;
	            }
	        } else {
	            getter = indexedGetter;
	        }
	        return this._then(getter, undefined, undefined, propertyName, undefined);
	    };
	};

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	module.exports = function (Promise, apiRejection, tryConvertToPromise, createContext, INTERNAL, debug) {
	    var util = __webpack_require__(8);
	    var TypeError = __webpack_require__(15).TypeError;
	    var inherits = __webpack_require__(8).inherits;
	    var errorObj = util.errorObj;
	    var tryCatch = util.tryCatch;
	    var NULL = {};
	
	    function thrower(e) {
	        setTimeout(function () {
	            throw e;
	        }, 0);
	    }
	
	    function castPreservingDisposable(thenable) {
	        var maybePromise = tryConvertToPromise(thenable);
	        if (maybePromise !== thenable && typeof thenable._isDisposable === "function" && typeof thenable._getDisposer === "function" && thenable._isDisposable()) {
	            maybePromise._setDisposable(thenable._getDisposer());
	        }
	        return maybePromise;
	    }
	    function dispose(resources, inspection) {
	        var i = 0;
	        var len = resources.length;
	        var ret = new Promise(INTERNAL);
	        function iterator() {
	            if (i >= len) return ret._fulfill();
	            var maybePromise = castPreservingDisposable(resources[i++]);
	            if (maybePromise instanceof Promise && maybePromise._isDisposable()) {
	                try {
	                    maybePromise = tryConvertToPromise(maybePromise._getDisposer().tryDispose(inspection), resources.promise);
	                } catch (e) {
	                    return thrower(e);
	                }
	                if (maybePromise instanceof Promise) {
	                    return maybePromise._then(iterator, thrower, null, null, null);
	                }
	            }
	            iterator();
	        }
	        iterator();
	        return ret;
	    }
	
	    function Disposer(data, promise, context) {
	        this._data = data;
	        this._promise = promise;
	        this._context = context;
	    }
	
	    Disposer.prototype.data = function () {
	        return this._data;
	    };
	
	    Disposer.prototype.promise = function () {
	        return this._promise;
	    };
	
	    Disposer.prototype.resource = function () {
	        if (this.promise().isFulfilled()) {
	            return this.promise().value();
	        }
	        return NULL;
	    };
	
	    Disposer.prototype.tryDispose = function (inspection) {
	        var resource = this.resource();
	        var context = this._context;
	        if (context !== undefined) context._pushContext();
	        var ret = resource !== NULL ? this.doDispose(resource, inspection) : null;
	        if (context !== undefined) context._popContext();
	        this._promise._unsetDisposable();
	        this._data = null;
	        return ret;
	    };
	
	    Disposer.isDisposer = function (d) {
	        return d != null && typeof d.resource === "function" && typeof d.tryDispose === "function";
	    };
	
	    function FunctionDisposer(fn, promise, context) {
	        this.constructor$(fn, promise, context);
	    }
	    inherits(FunctionDisposer, Disposer);
	
	    FunctionDisposer.prototype.doDispose = function (resource, inspection) {
	        var fn = this.data();
	        return fn.call(resource, resource, inspection);
	    };
	
	    function maybeUnwrapDisposer(value) {
	        if (Disposer.isDisposer(value)) {
	            this.resources[this.index]._setDisposable(value);
	            return value.promise();
	        }
	        return value;
	    }
	
	    function ResourceList(length) {
	        this.length = length;
	        this.promise = null;
	        this[length - 1] = null;
	    }
	
	    ResourceList.prototype._resultCancelled = function () {
	        var len = this.length;
	        for (var i = 0; i < len; ++i) {
	            var item = this[i];
	            if (item instanceof Promise) {
	                item.cancel();
	            }
	        }
	    };
	
	    Promise.using = function () {
	        var len = arguments.length;
	        if (len < 2) return apiRejection("you must pass at least 2 arguments to Promise.using");
	        var fn = arguments[len - 1];
	        if (typeof fn !== "function") {
	            return apiRejection("expecting a function but got " + util.classString(fn));
	        }
	        var input;
	        var spreadArgs = true;
	        if (len === 2 && Array.isArray(arguments[0])) {
	            input = arguments[0];
	            len = input.length;
	            spreadArgs = false;
	        } else {
	            input = arguments;
	            len--;
	        }
	        var resources = new ResourceList(len);
	        for (var i = 0; i < len; ++i) {
	            var resource = input[i];
	            if (Disposer.isDisposer(resource)) {
	                var disposer = resource;
	                resource = resource.promise();
	                resource._setDisposable(disposer);
	            } else {
	                var maybePromise = tryConvertToPromise(resource);
	                if (maybePromise instanceof Promise) {
	                    resource = maybePromise._then(maybeUnwrapDisposer, null, null, {
	                        resources: resources,
	                        index: i
	                    }, undefined);
	                }
	            }
	            resources[i] = resource;
	        }
	
	        var reflectedResources = new Array(resources.length);
	        for (var i = 0; i < reflectedResources.length; ++i) {
	            reflectedResources[i] = Promise.resolve(resources[i]).reflect();
	        }
	
	        var resultPromise = Promise.all(reflectedResources).then(function (inspections) {
	            for (var i = 0; i < inspections.length; ++i) {
	                var inspection = inspections[i];
	                if (inspection.isRejected()) {
	                    errorObj.e = inspection.error();
	                    return errorObj;
	                } else if (!inspection.isFulfilled()) {
	                    resultPromise.cancel();
	                    return;
	                }
	                inspections[i] = inspection.value();
	            }
	            promise._pushContext();
	
	            fn = tryCatch(fn);
	            var ret = spreadArgs ? fn.apply(undefined, inspections) : fn(inspections);
	            var promiseCreated = promise._popContext();
	            debug.checkForgottenReturns(ret, promiseCreated, "Promise.using", promise);
	            return ret;
	        });
	
	        var promise = resultPromise.lastly(function () {
	            var inspection = new Promise.PromiseInspection(resultPromise);
	            return dispose(resources, inspection);
	        });
	        resources.promise = promise;
	        promise._setOnCancel(resources);
	        return promise;
	    };
	
	    Promise.prototype._setDisposable = function (disposer) {
	        this._bitField = this._bitField | 131072;
	        this._disposer = disposer;
	    };
	
	    Promise.prototype._isDisposable = function () {
	        return (this._bitField & 131072) > 0;
	    };
	
	    Promise.prototype._getDisposer = function () {
	        return this._disposer;
	    };
	
	    Promise.prototype._unsetDisposable = function () {
	        this._bitField = this._bitField & ~131072;
	        this._disposer = undefined;
	    };
	
	    Promise.prototype.disposer = function (fn) {
	        if (typeof fn === "function") {
	            return new FunctionDisposer(fn, this, createContext());
	        }
	        throw new TypeError();
	    };
	};

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	module.exports = function (Promise, INTERNAL, debug) {
	    var util = __webpack_require__(8);
	    var TimeoutError = Promise.TimeoutError;
	
	    function HandleWrapper(handle) {
	        this.handle = handle;
	    }
	
	    HandleWrapper.prototype._resultCancelled = function () {
	        clearTimeout(this.handle);
	    };
	
	    var afterValue = function afterValue(value) {
	        return delay(+this).thenReturn(value);
	    };
	    var delay = Promise.delay = function (ms, value) {
	        var ret;
	        var handle;
	        if (value !== undefined) {
	            ret = Promise.resolve(value)._then(afterValue, null, null, ms, undefined);
	            if (debug.cancellation() && value instanceof Promise) {
	                ret._setOnCancel(value);
	            }
	        } else {
	            ret = new Promise(INTERNAL);
	            handle = setTimeout(function () {
	                ret._fulfill();
	            }, +ms);
	            if (debug.cancellation()) {
	                ret._setOnCancel(new HandleWrapper(handle));
	            }
	            ret._captureStackTrace();
	        }
	        ret._setAsyncGuaranteed();
	        return ret;
	    };
	
	    Promise.prototype.delay = function (ms) {
	        return delay(ms, this);
	    };
	
	    var afterTimeout = function afterTimeout(promise, message, parent) {
	        var err;
	        if (typeof message !== "string") {
	            if (message instanceof Error) {
	                err = message;
	            } else {
	                err = new TimeoutError("operation timed out");
	            }
	        } else {
	            err = new TimeoutError(message);
	        }
	        util.markAsOriginatingFromRejection(err);
	        promise._attachExtraTrace(err);
	        promise._reject(err);
	
	        if (parent != null) {
	            parent.cancel();
	        }
	    };
	
	    function successClear(value) {
	        clearTimeout(this.handle);
	        return value;
	    }
	
	    function failureClear(reason) {
	        clearTimeout(this.handle);
	        throw reason;
	    }
	
	    Promise.prototype.timeout = function (ms, message) {
	        ms = +ms;
	        var ret, parent;
	
	        var handleWrapper = new HandleWrapper(setTimeout(function timeoutTimeout() {
	            if (ret.isPending()) {
	                afterTimeout(ret, message, parent);
	            }
	        }, ms));
	
	        if (debug.cancellation()) {
	            parent = this.then();
	            ret = parent._then(successClear, failureClear, undefined, handleWrapper, undefined);
	            ret._setOnCancel(handleWrapper);
	        } else {
	            ret = this._then(successClear, failureClear, undefined, handleWrapper, undefined);
	        }
	
	        return ret;
	    };
	};

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	module.exports = function (Promise, apiRejection, INTERNAL, tryConvertToPromise, Proxyable, debug) {
	    var errors = __webpack_require__(15);
	    var TypeError = errors.TypeError;
	    var util = __webpack_require__(8);
	    var errorObj = util.errorObj;
	    var tryCatch = util.tryCatch;
	    var yieldHandlers = [];
	
	    function promiseFromYieldHandler(value, yieldHandlers, traceParent) {
	        for (var i = 0; i < yieldHandlers.length; ++i) {
	            traceParent._pushContext();
	            var result = tryCatch(yieldHandlers[i])(value);
	            traceParent._popContext();
	            if (result === errorObj) {
	                traceParent._pushContext();
	                var ret = Promise.reject(errorObj.e);
	                traceParent._popContext();
	                return ret;
	            }
	            var maybePromise = tryConvertToPromise(result, traceParent);
	            if (maybePromise instanceof Promise) return maybePromise;
	        }
	        return null;
	    }
	
	    function PromiseSpawn(generatorFunction, receiver, yieldHandler, stack) {
	        if (debug.cancellation()) {
	            var internal = new Promise(INTERNAL);
	            var _finallyPromise = this._finallyPromise = new Promise(INTERNAL);
	            this._promise = internal.lastly(function () {
	                return _finallyPromise;
	            });
	            internal._captureStackTrace();
	            internal._setOnCancel(this);
	        } else {
	            var promise = this._promise = new Promise(INTERNAL);
	            promise._captureStackTrace();
	        }
	        this._stack = stack;
	        this._generatorFunction = generatorFunction;
	        this._receiver = receiver;
	        this._generator = undefined;
	        this._yieldHandlers = typeof yieldHandler === "function" ? [yieldHandler].concat(yieldHandlers) : yieldHandlers;
	        this._yieldedPromise = null;
	        this._cancellationPhase = false;
	    }
	    util.inherits(PromiseSpawn, Proxyable);
	
	    PromiseSpawn.prototype._isResolved = function () {
	        return this._promise === null;
	    };
	
	    PromiseSpawn.prototype._cleanup = function () {
	        this._promise = this._generator = null;
	        if (debug.cancellation() && this._finallyPromise !== null) {
	            this._finallyPromise._fulfill();
	            this._finallyPromise = null;
	        }
	    };
	
	    PromiseSpawn.prototype._promiseCancelled = function () {
	        if (this._isResolved()) return;
	        var implementsReturn = typeof this._generator["return"] !== "undefined";
	
	        var result;
	        if (!implementsReturn) {
	            var reason = new Promise.CancellationError("generator .return() sentinel");
	            Promise.coroutine.returnSentinel = reason;
	            this._promise._attachExtraTrace(reason);
	            this._promise._pushContext();
	            result = tryCatch(this._generator["throw"]).call(this._generator, reason);
	            this._promise._popContext();
	        } else {
	            this._promise._pushContext();
	            result = tryCatch(this._generator["return"]).call(this._generator, undefined);
	            this._promise._popContext();
	        }
	        this._cancellationPhase = true;
	        this._yieldedPromise = null;
	        this._continue(result);
	    };
	
	    PromiseSpawn.prototype._promiseFulfilled = function (value) {
	        this._yieldedPromise = null;
	        this._promise._pushContext();
	        var result = tryCatch(this._generator.next).call(this._generator, value);
	        this._promise._popContext();
	        this._continue(result);
	    };
	
	    PromiseSpawn.prototype._promiseRejected = function (reason) {
	        this._yieldedPromise = null;
	        this._promise._attachExtraTrace(reason);
	        this._promise._pushContext();
	        var result = tryCatch(this._generator["throw"]).call(this._generator, reason);
	        this._promise._popContext();
	        this._continue(result);
	    };
	
	    PromiseSpawn.prototype._resultCancelled = function () {
	        if (this._yieldedPromise instanceof Promise) {
	            var promise = this._yieldedPromise;
	            this._yieldedPromise = null;
	            promise.cancel();
	        }
	    };
	
	    PromiseSpawn.prototype.promise = function () {
	        return this._promise;
	    };
	
	    PromiseSpawn.prototype._run = function () {
	        this._generator = this._generatorFunction.call(this._receiver);
	        this._receiver = this._generatorFunction = undefined;
	        this._promiseFulfilled(undefined);
	    };
	
	    PromiseSpawn.prototype._continue = function (result) {
	        var promise = this._promise;
	        if (result === errorObj) {
	            this._cleanup();
	            if (this._cancellationPhase) {
	                return promise.cancel();
	            } else {
	                return promise._rejectCallback(result.e, false);
	            }
	        }
	
	        var value = result.value;
	        if (result.done === true) {
	            this._cleanup();
	            if (this._cancellationPhase) {
	                return promise.cancel();
	            } else {
	                return promise._resolveCallback(value);
	            }
	        } else {
	            var maybePromise = tryConvertToPromise(value, this._promise);
	            if (!(maybePromise instanceof Promise)) {
	                maybePromise = promiseFromYieldHandler(maybePromise, this._yieldHandlers, this._promise);
	                if (maybePromise === null) {
	                    this._promiseRejected(new TypeError("A value %s was yielded that could not be treated as a promise\n\n    See http://goo.gl/MqrFmX\n\n".replace("%s", String(value)) + "From coroutine:\n" + this._stack.split("\n").slice(1, -7).join("\n")));
	                    return;
	                }
	            }
	            maybePromise = maybePromise._target();
	            var bitField = maybePromise._bitField;
	            ;
	            if ((bitField & 50397184) === 0) {
	                this._yieldedPromise = maybePromise;
	                maybePromise._proxy(this, null);
	            } else if ((bitField & 33554432) !== 0) {
	                Promise._async.invoke(this._promiseFulfilled, this, maybePromise._value());
	            } else if ((bitField & 16777216) !== 0) {
	                Promise._async.invoke(this._promiseRejected, this, maybePromise._reason());
	            } else {
	                this._promiseCancelled();
	            }
	        }
	    };
	
	    Promise.coroutine = function (generatorFunction, options) {
	        if (typeof generatorFunction !== "function") {
	            throw new TypeError("generatorFunction must be a function\n\n    See http://goo.gl/MqrFmX\n");
	        }
	        var yieldHandler = Object(options).yieldHandler;
	        var PromiseSpawn$ = PromiseSpawn;
	        var stack = new Error().stack;
	        return function () {
	            var generator = generatorFunction.apply(this, arguments);
	            var spawn = new PromiseSpawn$(undefined, undefined, yieldHandler, stack);
	            var ret = spawn.promise();
	            spawn._generator = generator;
	            spawn._promiseFulfilled(undefined);
	            return ret;
	        };
	    };
	
	    Promise.coroutine.addYieldHandler = function (fn) {
	        if (typeof fn !== "function") {
	            throw new TypeError("expecting a function but got " + util.classString(fn));
	        }
	        yieldHandlers.push(fn);
	    };
	
	    Promise.spawn = function (generatorFunction) {
	        debug.deprecated("Promise.spawn()", "Promise.coroutine()");
	        if (typeof generatorFunction !== "function") {
	            return apiRejection("generatorFunction must be a function\n\n    See http://goo.gl/MqrFmX\n");
	        }
	        var spawn = new PromiseSpawn(generatorFunction, this);
	        var ret = spawn.promise();
	        spawn._run(Promise.spawn);
	        return ret;
	    };
	};

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	module.exports = function (Promise) {
	    var util = __webpack_require__(8);
	    var async = Promise._async;
	    var tryCatch = util.tryCatch;
	    var errorObj = util.errorObj;
	
	    function spreadAdapter(val, nodeback) {
	        var promise = this;
	        if (!util.isArray(val)) return successAdapter.call(promise, val, nodeback);
	        var ret = tryCatch(nodeback).apply(promise._boundValue(), [null].concat(val));
	        if (ret === errorObj) {
	            async.throwLater(ret.e);
	        }
	    }
	
	    function successAdapter(val, nodeback) {
	        var promise = this;
	        var receiver = promise._boundValue();
	        var ret = val === undefined ? tryCatch(nodeback).call(receiver, null) : tryCatch(nodeback).call(receiver, null, val);
	        if (ret === errorObj) {
	            async.throwLater(ret.e);
	        }
	    }
	    function errorAdapter(reason, nodeback) {
	        var promise = this;
	        if (!reason) {
	            var newReason = new Error(reason + "");
	            newReason.cause = reason;
	            reason = newReason;
	        }
	        var ret = tryCatch(nodeback).call(promise._boundValue(), reason);
	        if (ret === errorObj) {
	            async.throwLater(ret.e);
	        }
	    }
	
	    Promise.prototype.asCallback = Promise.prototype.nodeify = function (nodeback, options) {
	        if (typeof nodeback == "function") {
	            var adapter = successAdapter;
	            if (options !== undefined && Object(options).spread) {
	                adapter = spreadAdapter;
	            }
	            this._then(adapter, errorAdapter, undefined, this, nodeback);
	        }
	        return this;
	    };
	};

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	module.exports = function (Promise, INTERNAL) {
	    var THIS = {};
	    var util = __webpack_require__(8);
	    var nodebackForPromise = __webpack_require__(22);
	    var withAppended = util.withAppended;
	    var maybeWrapAsError = util.maybeWrapAsError;
	    var canEvaluate = util.canEvaluate;
	    var TypeError = __webpack_require__(15).TypeError;
	    var defaultSuffix = "Async";
	    var defaultPromisified = { __isPromisified__: true };
	    var noCopyProps = ["arity", "length", "name", "arguments", "caller", "callee", "prototype", "__isPromisified__"];
	    var noCopyPropsPattern = new RegExp("^(?:" + noCopyProps.join("|") + ")$");
	
	    var defaultFilter = function defaultFilter(name) {
	        return util.isIdentifier(name) && name.charAt(0) !== "_" && name !== "constructor";
	    };
	
	    function propsFilter(key) {
	        return !noCopyPropsPattern.test(key);
	    }
	
	    function isPromisified(fn) {
	        try {
	            return fn.__isPromisified__ === true;
	        } catch (e) {
	            return false;
	        }
	    }
	
	    function hasPromisified(obj, key, suffix) {
	        var val = util.getDataPropertyOrDefault(obj, key + suffix, defaultPromisified);
	        return val ? isPromisified(val) : false;
	    }
	    function checkValid(ret, suffix, suffixRegexp) {
	        for (var i = 0; i < ret.length; i += 2) {
	            var key = ret[i];
	            if (suffixRegexp.test(key)) {
	                var keyWithoutAsyncSuffix = key.replace(suffixRegexp, "");
	                for (var j = 0; j < ret.length; j += 2) {
	                    if (ret[j] === keyWithoutAsyncSuffix) {
	                        throw new TypeError("Cannot promisify an API that has normal methods with '%s'-suffix\n\n    See http://goo.gl/MqrFmX\n".replace("%s", suffix));
	                    }
	                }
	            }
	        }
	    }
	
	    function promisifiableMethods(obj, suffix, suffixRegexp, filter) {
	        var keys = util.inheritedDataKeys(obj);
	        var ret = [];
	        for (var i = 0; i < keys.length; ++i) {
	            var key = keys[i];
	            var value = obj[key];
	            var passesDefaultFilter = filter === defaultFilter ? true : defaultFilter(key, value, obj);
	            if (typeof value === "function" && !isPromisified(value) && !hasPromisified(obj, key, suffix) && filter(key, value, obj, passesDefaultFilter)) {
	                ret.push(key, value);
	            }
	        }
	        checkValid(ret, suffix, suffixRegexp);
	        return ret;
	    }
	
	    var escapeIdentRegex = function escapeIdentRegex(str) {
	        return str.replace(/([$])/, "\\$");
	    };
	
	    var makeNodePromisifiedEval;
	    if (true) {
	        var switchCaseArgumentOrder = function switchCaseArgumentOrder(likelyArgumentCount) {
	            var ret = [likelyArgumentCount];
	            var min = Math.max(0, likelyArgumentCount - 1 - 3);
	            for (var i = likelyArgumentCount - 1; i >= min; --i) {
	                ret.push(i);
	            }
	            for (var i = likelyArgumentCount + 1; i <= 3; ++i) {
	                ret.push(i);
	            }
	            return ret;
	        };
	
	        var argumentSequence = function argumentSequence(argumentCount) {
	            return util.filledRange(argumentCount, "_arg", "");
	        };
	
	        var parameterDeclaration = function parameterDeclaration(parameterCount) {
	            return util.filledRange(Math.max(parameterCount, 3), "_arg", "");
	        };
	
	        var parameterCount = function parameterCount(fn) {
	            if (typeof fn.length === "number") {
	                return Math.max(Math.min(fn.length, 1023 + 1), 0);
	            }
	            return 0;
	        };
	
	        makeNodePromisifiedEval = function makeNodePromisifiedEval(callback, receiver, originalName, fn, _, multiArgs) {
	            var newParameterCount = Math.max(0, parameterCount(fn) - 1);
	            var argumentOrder = switchCaseArgumentOrder(newParameterCount);
	            var shouldProxyThis = typeof callback === "string" || receiver === THIS;
	
	            function generateCallForArgumentCount(count) {
	                var args = argumentSequence(count).join(", ");
	                var comma = count > 0 ? ", " : "";
	                var ret;
	                if (shouldProxyThis) {
	                    ret = "ret = callback.call(this, {{args}}, nodeback); break;\n";
	                } else {
	                    ret = receiver === undefined ? "ret = callback({{args}}, nodeback); break;\n" : "ret = callback.call(receiver, {{args}}, nodeback); break;\n";
	                }
	                return ret.replace("{{args}}", args).replace(", ", comma);
	            }
	
	            function generateArgumentSwitchCase() {
	                var ret = "";
	                for (var i = 0; i < argumentOrder.length; ++i) {
	                    ret += "case " + argumentOrder[i] + ":" + generateCallForArgumentCount(argumentOrder[i]);
	                }
	
	                ret += "                                                             \n\
	        default:                                                             \n\
	            var args = new Array(len + 1);                                   \n\
	            var i = 0;                                                       \n\
	            for (var i = 0; i < len; ++i) {                                  \n\
	               args[i] = arguments[i];                                       \n\
	            }                                                                \n\
	            args[i] = nodeback;                                              \n\
	            [CodeForCall]                                                    \n\
	            break;                                                           \n\
	        ".replace("[CodeForCall]", shouldProxyThis ? "ret = callback.apply(this, args);\n" : "ret = callback.apply(receiver, args);\n");
	                return ret;
	            }
	
	            var getFunctionCode = typeof callback === "string" ? "this != null ? this['" + callback + "'] : fn" : "fn";
	            var body = "'use strict';                                                \n\
	        var ret = function (Parameters) {                                    \n\
	            'use strict';                                                    \n\
	            var len = arguments.length;                                      \n\
	            var promise = new Promise(INTERNAL);                             \n\
	            promise._captureStackTrace();                                    \n\
	            var nodeback = nodebackForPromise(promise, " + multiArgs + ");   \n\
	            var ret;                                                         \n\
	            var callback = tryCatch([GetFunctionCode]);                      \n\
	            switch(len) {                                                    \n\
	                [CodeForSwitchCase]                                          \n\
	            }                                                                \n\
	            if (ret === errorObj) {                                          \n\
	                promise._rejectCallback(maybeWrapAsError(ret.e), true, true);\n\
	            }                                                                \n\
	            if (!promise._isFateSealed()) promise._setAsyncGuaranteed();     \n\
	            return promise;                                                  \n\
	        };                                                                   \n\
	        notEnumerableProp(ret, '__isPromisified__', true);                   \n\
	        return ret;                                                          \n\
	    ".replace("[CodeForSwitchCase]", generateArgumentSwitchCase()).replace("[GetFunctionCode]", getFunctionCode);
	            body = body.replace("Parameters", parameterDeclaration(newParameterCount));
	            return new Function("Promise", "fn", "receiver", "withAppended", "maybeWrapAsError", "nodebackForPromise", "tryCatch", "errorObj", "notEnumerableProp", "INTERNAL", body)(Promise, fn, receiver, withAppended, maybeWrapAsError, nodebackForPromise, util.tryCatch, util.errorObj, util.notEnumerableProp, INTERNAL);
	        };
	    }
	
	    function makeNodePromisifiedClosure(callback, receiver, _, fn, __, multiArgs) {
	        var defaultThis = function () {
	            return this;
	        }();
	        var method = callback;
	        if (typeof method === "string") {
	            callback = fn;
	        }
	        function promisified() {
	            var _receiver = receiver;
	            if (receiver === THIS) _receiver = this;
	            var promise = new Promise(INTERNAL);
	            promise._captureStackTrace();
	            var cb = typeof method === "string" && this !== defaultThis ? this[method] : callback;
	            var fn = nodebackForPromise(promise, multiArgs);
	            try {
	                cb.apply(_receiver, withAppended(arguments, fn));
	            } catch (e) {
	                promise._rejectCallback(maybeWrapAsError(e), true, true);
	            }
	            if (!promise._isFateSealed()) promise._setAsyncGuaranteed();
	            return promise;
	        }
	        util.notEnumerableProp(promisified, "__isPromisified__", true);
	        return promisified;
	    }
	
	    var makeNodePromisified = canEvaluate ? makeNodePromisifiedEval : makeNodePromisifiedClosure;
	
	    function promisifyAll(obj, suffix, filter, promisifier, multiArgs) {
	        var suffixRegexp = new RegExp(escapeIdentRegex(suffix) + "$");
	        var methods = promisifiableMethods(obj, suffix, suffixRegexp, filter);
	
	        for (var i = 0, len = methods.length; i < len; i += 2) {
	            var key = methods[i];
	            var fn = methods[i + 1];
	            var promisifiedKey = key + suffix;
	            if (promisifier === makeNodePromisified) {
	                obj[promisifiedKey] = makeNodePromisified(key, THIS, key, fn, suffix, multiArgs);
	            } else {
	                var promisified = promisifier(fn, function () {
	                    return makeNodePromisified(key, THIS, key, fn, suffix, multiArgs);
	                });
	                util.notEnumerableProp(promisified, "__isPromisified__", true);
	                obj[promisifiedKey] = promisified;
	            }
	        }
	        util.toFastProperties(obj);
	        return obj;
	    }
	
	    function promisify(callback, receiver, multiArgs) {
	        return makeNodePromisified(callback, receiver, undefined, callback, null, multiArgs);
	    }
	
	    Promise.promisify = function (fn, options) {
	        if (typeof fn !== "function") {
	            throw new TypeError("expecting a function but got " + util.classString(fn));
	        }
	        if (isPromisified(fn)) {
	            return fn;
	        }
	        options = Object(options);
	        var receiver = options.context === undefined ? THIS : options.context;
	        var multiArgs = !!options.multiArgs;
	        var ret = promisify(fn, receiver, multiArgs);
	        util.copyDescriptors(fn, ret, propsFilter);
	        return ret;
	    };
	
	    Promise.promisifyAll = function (target, options) {
	        if (typeof target !== "function" && (typeof target === "undefined" ? "undefined" : _typeof(target)) !== "object") {
	            throw new TypeError("the target of promisifyAll must be an object or a function\n\n    See http://goo.gl/MqrFmX\n");
	        }
	        options = Object(options);
	        var multiArgs = !!options.multiArgs;
	        var suffix = options.suffix;
	        if (typeof suffix !== "string") suffix = defaultSuffix;
	        var filter = options.filter;
	        if (typeof filter !== "function") filter = defaultFilter;
	        var promisifier = options.promisifier;
	        if (typeof promisifier !== "function") promisifier = makeNodePromisified;
	
	        if (!util.isIdentifier(suffix)) {
	            throw new RangeError("suffix must be a valid identifier\n\n    See http://goo.gl/MqrFmX\n");
	        }
	
	        var keys = util.inheritedDataKeys(target);
	        for (var i = 0; i < keys.length; ++i) {
	            var value = target[keys[i]];
	            if (keys[i] !== "constructor" && util.isClass(value)) {
	                promisifyAll(value.prototype, suffix, filter, promisifier, multiArgs);
	                promisifyAll(value, suffix, filter, promisifier, multiArgs);
	            }
	        }
	
	        return promisifyAll(target, suffix, filter, promisifier, multiArgs);
	    };
	};

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	module.exports = function (Promise, PromiseArray, tryConvertToPromise, apiRejection) {
	    var util = __webpack_require__(8);
	    var isObject = util.isObject;
	    var es5 = __webpack_require__(9);
	    var Es6Map;
	    if (typeof Map === "function") Es6Map = Map;
	
	    var mapToEntries = function () {
	        var index = 0;
	        var size = 0;
	
	        function extractEntry(value, key) {
	            this[index] = value;
	            this[index + size] = key;
	            index++;
	        }
	
	        return function mapToEntries(map) {
	            size = map.size;
	            index = 0;
	            var ret = new Array(map.size * 2);
	            map.forEach(extractEntry, ret);
	            return ret;
	        };
	    }();
	
	    var entriesToMap = function entriesToMap(entries) {
	        var ret = new Es6Map();
	        var length = entries.length / 2 | 0;
	        for (var i = 0; i < length; ++i) {
	            var key = entries[length + i];
	            var value = entries[i];
	            ret.set(key, value);
	        }
	        return ret;
	    };
	
	    function PropertiesPromiseArray(obj) {
	        var isMap = false;
	        var entries;
	        if (Es6Map !== undefined && obj instanceof Es6Map) {
	            entries = mapToEntries(obj);
	            isMap = true;
	        } else {
	            var keys = es5.keys(obj);
	            var len = keys.length;
	            entries = new Array(len * 2);
	            for (var i = 0; i < len; ++i) {
	                var key = keys[i];
	                entries[i] = obj[key];
	                entries[i + len] = key;
	            }
	        }
	        this.constructor$(entries);
	        this._isMap = isMap;
	        this._init$(undefined, isMap ? -6 : -3);
	    }
	    util.inherits(PropertiesPromiseArray, PromiseArray);
	
	    PropertiesPromiseArray.prototype._init = function () {};
	
	    PropertiesPromiseArray.prototype._promiseFulfilled = function (value, index) {
	        this._values[index] = value;
	        var totalResolved = ++this._totalResolved;
	        if (totalResolved >= this._length) {
	            var val;
	            if (this._isMap) {
	                val = entriesToMap(this._values);
	            } else {
	                val = {};
	                var keyOffset = this.length();
	                for (var i = 0, len = this.length(); i < len; ++i) {
	                    val[this._values[i + keyOffset]] = this._values[i];
	                }
	            }
	            this._resolve(val);
	            return true;
	        }
	        return false;
	    };
	
	    PropertiesPromiseArray.prototype.shouldCopyValues = function () {
	        return false;
	    };
	
	    PropertiesPromiseArray.prototype.getActualLength = function (len) {
	        return len >> 1;
	    };
	
	    function props(promises) {
	        var ret;
	        var castValue = tryConvertToPromise(promises);
	
	        if (!isObject(castValue)) {
	            return apiRejection("cannot await properties of a non-object\n\n    See http://goo.gl/MqrFmX\n");
	        } else if (castValue instanceof Promise) {
	            ret = castValue._then(Promise.props, undefined, undefined, undefined, undefined);
	        } else {
	            ret = new PropertiesPromiseArray(castValue).promise();
	        }
	
	        if (castValue instanceof Promise) {
	            ret._propagateFrom(castValue, 2);
	        }
	        return ret;
	    }
	
	    Promise.prototype.props = function () {
	        return props(this);
	    };
	
	    Promise.props = function (promises) {
	        return props(promises);
	    };
	};

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	module.exports = function (Promise, INTERNAL, tryConvertToPromise, apiRejection) {
	    var util = __webpack_require__(8);
	
	    var raceLater = function raceLater(promise) {
	        return promise.then(function (array) {
	            return race(array, promise);
	        });
	    };
	
	    function race(promises, parent) {
	        var maybePromise = tryConvertToPromise(promises);
	
	        if (maybePromise instanceof Promise) {
	            return raceLater(maybePromise);
	        } else {
	            promises = util.asArray(promises);
	            if (promises === null) return apiRejection("expecting an array or an iterable object but got " + util.classString(promises));
	        }
	
	        var ret = new Promise(INTERNAL);
	        if (parent !== undefined) {
	            ret._propagateFrom(parent, 3);
	        }
	        var fulfill = ret._fulfill;
	        var reject = ret._reject;
	        for (var i = 0, len = promises.length; i < len; ++i) {
	            var val = promises[i];
	
	            if (val === undefined && !(i in promises)) {
	                continue;
	            }
	
	            Promise.cast(val)._then(fulfill, reject, undefined, ret, null);
	        }
	        return ret;
	    }
	
	    Promise.race = function (promises) {
	        return race(promises, undefined);
	    };
	
	    Promise.prototype.race = function () {
	        return race(this, undefined);
	    };
	};

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	module.exports = function (Promise, PromiseArray, apiRejection, tryConvertToPromise, INTERNAL, debug) {
	    var getDomain = Promise._getDomain;
	    var util = __webpack_require__(8);
	    var tryCatch = util.tryCatch;
	
	    function ReductionPromiseArray(promises, fn, initialValue, _each) {
	        this.constructor$(promises);
	        var domain = getDomain();
	        this._fn = domain === null ? fn : util.domainBind(domain, fn);
	        if (initialValue !== undefined) {
	            initialValue = Promise.resolve(initialValue);
	            initialValue._attachCancellationCallback(this);
	        }
	        this._initialValue = initialValue;
	        this._currentCancellable = null;
	        if (_each === INTERNAL) {
	            this._eachValues = Array(this._length);
	        } else if (_each === 0) {
	            this._eachValues = null;
	        } else {
	            this._eachValues = undefined;
	        }
	        this._promise._captureStackTrace();
	        this._init$(undefined, -5);
	    }
	    util.inherits(ReductionPromiseArray, PromiseArray);
	
	    ReductionPromiseArray.prototype._gotAccum = function (accum) {
	        if (this._eachValues !== undefined && this._eachValues !== null && accum !== INTERNAL) {
	            this._eachValues.push(accum);
	        }
	    };
	
	    ReductionPromiseArray.prototype._eachComplete = function (value) {
	        if (this._eachValues !== null) {
	            this._eachValues.push(value);
	        }
	        return this._eachValues;
	    };
	
	    ReductionPromiseArray.prototype._init = function () {};
	
	    ReductionPromiseArray.prototype._resolveEmptyArray = function () {
	        this._resolve(this._eachValues !== undefined ? this._eachValues : this._initialValue);
	    };
	
	    ReductionPromiseArray.prototype.shouldCopyValues = function () {
	        return false;
	    };
	
	    ReductionPromiseArray.prototype._resolve = function (value) {
	        this._promise._resolveCallback(value);
	        this._values = null;
	    };
	
	    ReductionPromiseArray.prototype._resultCancelled = function (sender) {
	        if (sender === this._initialValue) return this._cancel();
	        if (this._isResolved()) return;
	        this._resultCancelled$();
	        if (this._currentCancellable instanceof Promise) {
	            this._currentCancellable.cancel();
	        }
	        if (this._initialValue instanceof Promise) {
	            this._initialValue.cancel();
	        }
	    };
	
	    ReductionPromiseArray.prototype._iterate = function (values) {
	        this._values = values;
	        var value;
	        var i;
	        var length = values.length;
	        if (this._initialValue !== undefined) {
	            value = this._initialValue;
	            i = 0;
	        } else {
	            value = Promise.resolve(values[0]);
	            i = 1;
	        }
	
	        this._currentCancellable = value;
	
	        if (!value.isRejected()) {
	            for (; i < length; ++i) {
	                var ctx = {
	                    accum: null,
	                    value: values[i],
	                    index: i,
	                    length: length,
	                    array: this
	                };
	                value = value._then(gotAccum, undefined, undefined, ctx, undefined);
	            }
	        }
	
	        if (this._eachValues !== undefined) {
	            value = value._then(this._eachComplete, undefined, undefined, this, undefined);
	        }
	        value._then(completed, completed, undefined, value, this);
	    };
	
	    Promise.prototype.reduce = function (fn, initialValue) {
	        return reduce(this, fn, initialValue, null);
	    };
	
	    Promise.reduce = function (promises, fn, initialValue, _each) {
	        return reduce(promises, fn, initialValue, _each);
	    };
	
	    function completed(valueOrReason, array) {
	        if (this.isFulfilled()) {
	            array._resolve(valueOrReason);
	        } else {
	            array._reject(valueOrReason);
	        }
	    }
	
	    function reduce(promises, fn, initialValue, _each) {
	        if (typeof fn !== "function") {
	            return apiRejection("expecting a function but got " + util.classString(fn));
	        }
	        var array = new ReductionPromiseArray(promises, fn, initialValue, _each);
	        return array.promise();
	    }
	
	    function gotAccum(accum) {
	        this.accum = accum;
	        this.array._gotAccum(accum);
	        var value = tryConvertToPromise(this.value, this.array._promise);
	        if (value instanceof Promise) {
	            this.array._currentCancellable = value;
	            return value._then(gotValue, undefined, undefined, this, undefined);
	        } else {
	            return gotValue.call(this, value);
	        }
	    }
	
	    function gotValue(value) {
	        var array = this.array;
	        var promise = array._promise;
	        var fn = tryCatch(array._fn);
	        promise._pushContext();
	        var ret;
	        if (array._eachValues !== undefined) {
	            ret = fn.call(promise._boundValue(), value, this.index, this.length);
	        } else {
	            ret = fn.call(promise._boundValue(), this.accum, value, this.index, this.length);
	        }
	        if (ret instanceof Promise) {
	            array._currentCancellable = ret;
	        }
	        var promiseCreated = promise._popContext();
	        debug.checkForgottenReturns(ret, promiseCreated, array._eachValues !== undefined ? "Promise.each" : "Promise.reduce", promise);
	        return ret;
	    }
	};

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	module.exports = function (Promise, PromiseArray, debug) {
	    var PromiseInspection = Promise.PromiseInspection;
	    var util = __webpack_require__(8);
	
	    function SettledPromiseArray(values) {
	        this.constructor$(values);
	    }
	    util.inherits(SettledPromiseArray, PromiseArray);
	
	    SettledPromiseArray.prototype._promiseResolved = function (index, inspection) {
	        this._values[index] = inspection;
	        var totalResolved = ++this._totalResolved;
	        if (totalResolved >= this._length) {
	            this._resolve(this._values);
	            return true;
	        }
	        return false;
	    };
	
	    SettledPromiseArray.prototype._promiseFulfilled = function (value, index) {
	        var ret = new PromiseInspection();
	        ret._bitField = 33554432;
	        ret._settledValueField = value;
	        return this._promiseResolved(index, ret);
	    };
	    SettledPromiseArray.prototype._promiseRejected = function (reason, index) {
	        var ret = new PromiseInspection();
	        ret._bitField = 16777216;
	        ret._settledValueField = reason;
	        return this._promiseResolved(index, ret);
	    };
	
	    Promise.settle = function (promises) {
	        debug.deprecated(".settle()", ".reflect()");
	        return new SettledPromiseArray(promises).promise();
	    };
	
	    Promise.prototype.settle = function () {
	        return Promise.settle(this);
	    };
	};

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	module.exports = function (Promise, PromiseArray, apiRejection) {
	    var util = __webpack_require__(8);
	    var RangeError = __webpack_require__(15).RangeError;
	    var AggregateError = __webpack_require__(15).AggregateError;
	    var isArray = util.isArray;
	    var CANCELLATION = {};
	
	    function SomePromiseArray(values) {
	        this.constructor$(values);
	        this._howMany = 0;
	        this._unwrap = false;
	        this._initialized = false;
	    }
	    util.inherits(SomePromiseArray, PromiseArray);
	
	    SomePromiseArray.prototype._init = function () {
	        if (!this._initialized) {
	            return;
	        }
	        if (this._howMany === 0) {
	            this._resolve([]);
	            return;
	        }
	        this._init$(undefined, -5);
	        var isArrayResolved = isArray(this._values);
	        if (!this._isResolved() && isArrayResolved && this._howMany > this._canPossiblyFulfill()) {
	            this._reject(this._getRangeError(this.length()));
	        }
	    };
	
	    SomePromiseArray.prototype.init = function () {
	        this._initialized = true;
	        this._init();
	    };
	
	    SomePromiseArray.prototype.setUnwrap = function () {
	        this._unwrap = true;
	    };
	
	    SomePromiseArray.prototype.howMany = function () {
	        return this._howMany;
	    };
	
	    SomePromiseArray.prototype.setHowMany = function (count) {
	        this._howMany = count;
	    };
	
	    SomePromiseArray.prototype._promiseFulfilled = function (value) {
	        this._addFulfilled(value);
	        if (this._fulfilled() === this.howMany()) {
	            this._values.length = this.howMany();
	            if (this.howMany() === 1 && this._unwrap) {
	                this._resolve(this._values[0]);
	            } else {
	                this._resolve(this._values);
	            }
	            return true;
	        }
	        return false;
	    };
	    SomePromiseArray.prototype._promiseRejected = function (reason) {
	        this._addRejected(reason);
	        return this._checkOutcome();
	    };
	
	    SomePromiseArray.prototype._promiseCancelled = function () {
	        if (this._values instanceof Promise || this._values == null) {
	            return this._cancel();
	        }
	        this._addRejected(CANCELLATION);
	        return this._checkOutcome();
	    };
	
	    SomePromiseArray.prototype._checkOutcome = function () {
	        if (this.howMany() > this._canPossiblyFulfill()) {
	            var e = new AggregateError();
	            for (var i = this.length(); i < this._values.length; ++i) {
	                if (this._values[i] !== CANCELLATION) {
	                    e.push(this._values[i]);
	                }
	            }
	            if (e.length > 0) {
	                this._reject(e);
	            } else {
	                this._cancel();
	            }
	            return true;
	        }
	        return false;
	    };
	
	    SomePromiseArray.prototype._fulfilled = function () {
	        return this._totalResolved;
	    };
	
	    SomePromiseArray.prototype._rejected = function () {
	        return this._values.length - this.length();
	    };
	
	    SomePromiseArray.prototype._addRejected = function (reason) {
	        this._values.push(reason);
	    };
	
	    SomePromiseArray.prototype._addFulfilled = function (value) {
	        this._values[this._totalResolved++] = value;
	    };
	
	    SomePromiseArray.prototype._canPossiblyFulfill = function () {
	        return this.length() - this._rejected();
	    };
	
	    SomePromiseArray.prototype._getRangeError = function (count) {
	        var message = "Input array must contain at least " + this._howMany + " items but contains only " + count + " items";
	        return new RangeError(message);
	    };
	
	    SomePromiseArray.prototype._resolveEmptyArray = function () {
	        this._reject(this._getRangeError(0));
	    };
	
	    function some(promises, howMany) {
	        if ((howMany | 0) !== howMany || howMany < 0) {
	            return apiRejection("expecting a positive integer\n\n    See http://goo.gl/MqrFmX\n");
	        }
	        var ret = new SomePromiseArray(promises);
	        var promise = ret.promise();
	        ret.setHowMany(howMany);
	        ret.init();
	        return promise;
	    }
	
	    Promise.some = function (promises, howMany) {
	        return some(promises, howMany);
	    };
	
	    Promise.prototype.some = function (howMany) {
	        return some(this, howMany);
	    };
	
	    Promise._SomePromiseArray = SomePromiseArray;
	};

/***/ },
/* 41 */
/***/ function(module, exports) {

	"use strict";
	
	module.exports = function (Promise, INTERNAL) {
	    var PromiseMap = Promise.map;
	
	    Promise.prototype.filter = function (fn, options) {
	        return PromiseMap(this, fn, options, INTERNAL);
	    };
	
	    Promise.filter = function (promises, fn, options) {
	        return PromiseMap(promises, fn, options, INTERNAL);
	    };
	};

/***/ },
/* 42 */
/***/ function(module, exports) {

	"use strict";
	
	module.exports = function (Promise, INTERNAL) {
	    var PromiseReduce = Promise.reduce;
	    var PromiseAll = Promise.all;
	
	    function promiseAllThis() {
	        return PromiseAll(this);
	    }
	
	    function PromiseMapSeries(promises, fn) {
	        return PromiseReduce(promises, fn, INTERNAL, INTERNAL);
	    }
	
	    Promise.prototype.each = function (fn) {
	        return PromiseReduce(this, fn, INTERNAL, 0)._then(promiseAllThis, undefined, undefined, this, undefined);
	    };
	
	    Promise.prototype.mapSeries = function (fn) {
	        return PromiseReduce(this, fn, INTERNAL, INTERNAL);
	    };
	
	    Promise.each = function (promises, fn) {
	        return PromiseReduce(promises, fn, INTERNAL, 0)._then(promiseAllThis, undefined, undefined, promises, undefined);
	    };
	
	    Promise.mapSeries = PromiseMapSeries;
	};

/***/ },
/* 43 */
/***/ function(module, exports) {

	"use strict";
	
	module.exports = function (Promise) {
	    var SomePromiseArray = Promise._SomePromiseArray;
	    function any(promises) {
	        var ret = new SomePromiseArray(promises);
	        var promise = ret.promise();
	        ret.setHowMany(1);
	        ret.setUnwrap();
	        ret.init();
	        return promise;
	    }
	
	    Promise.any = function (promises) {
	        return any(promises);
	    };
	
	    Promise.prototype.any = function () {
	        return any(this);
	    };
	};

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	Object.defineProperty(exports, "__esModule", { value: true });
	var includes = __webpack_require__(45);
	var isEmpty = __webpack_require__(87);
	var query_optimization_plugins_1 = __webpack_require__(100);
	var ddfcsv_error_1 = __webpack_require__(3);
	var Promise = __webpack_require__(5);
	var Papa = __webpack_require__(144);
	var isValidNumeric = function isValidNumeric(val) {
	    return typeof val !== 'number' && !val ? false : true;
	};
	function ddfCsvReader(path, fileReader, logger) {
	    var internalConcepts = [{ concept: 'concept', concept_type: 'string', domain: null }, { concept: 'concept_type', concept_type: 'string', domain: null }];
	    var operators = new Map([['$and', function (row, predicates) {
	        return predicates.every(function (p) {
	            return applyFilterRow(row, p);
	        });
	    }], ['$or', function (row, predicates) {
	        return predicates.some(function (p) {
	            return applyFilterRow(row, p);
	        });
	    }], ['$not', function (row, predicate) {
	        return !applyFilterRow(row, predicate);
	    }], ['$nor', function (row, predicates) {
	        return !predicates.some(function (p) {
	            return applyFilterRow(row, p);
	        });
	    }], ['$eq', function (rowValue, filterValue) {
	        return rowValue == filterValue;
	    }], ['$ne', function (rowValue, filterValue) {
	        return rowValue != filterValue;
	    }], ['$gt', function (rowValue, filterValue) {
	        return isValidNumeric(rowValue) && rowValue > filterValue;
	    }], ['$gte', function (rowValue, filterValue) {
	        return isValidNumeric(rowValue) && rowValue >= filterValue;
	    }], ['$lt', function (rowValue, filterValue) {
	        return isValidNumeric(rowValue) && rowValue < filterValue;
	    }], ['$lte', function (rowValue, filterValue) {
	        return isValidNumeric(rowValue) && rowValue <= filterValue;
	    }], ['$in', function (rowValue, filterValue) {
	        return filterValue.has(rowValue);
	    }], ['$nin', function (rowValue, filterValue) {
	        return !filterValue.has(rowValue);
	    }]]);
	    var datapackagePath = getDatapackagePath(path);
	    var basePath = getBasePath(datapackagePath);
	    var datapackagePromise = loadDataPackage(datapackagePath);
	    var conceptsPromise = datapackagePromise.then(loadConcepts);
	    var keyValueLookup = new Map();
	    var resourcesLookup = new Map();
	    var conceptsLookup = new Map();
	    var datapackage = void 0;
	    var optimalFilesSet = [];
	    function getDatapackagePath(pathParam) {
	        if (!pathParam.endsWith('datapackage.json')) {
	            if (!pathParam.endsWith('/')) {
	                pathParam = pathParam + '/';
	            }
	            pathParam = pathParam + 'datapackage.json';
	        }
	        return pathParam;
	    }
	    function getBasePath(datapackagePathParam) {
	        var dpPathSplit = datapackagePathParam.split('/');
	        dpPathSplit.pop();
	        return dpPathSplit.join('/') + '/';
	    }
	    function loadDataPackage(pathParam) {
	        return new Promise(function (resolve, reject) {
	            fileReader.readText(pathParam, function (err, data) {
	                if (err) {
	                    return reject(new ddfcsv_error_1.DdfCsvError(ddfcsv_error_1.FILE_READING_ERROR, err, pathParam));
	                }
	                try {
	                    datapackage = JSON.parse(data);
	                    optimalFilesSet = [];
	                } catch (parseErr) {
	                    return reject(new ddfcsv_error_1.DdfCsvError(ddfcsv_error_1.JSON_PARSING_ERROR, parseErr, pathParam));
	                }
	                buildResourcesLookup(datapackage);
	                buildKeyValueLookup(datapackage);
	                resolve(datapackage);
	            });
	        });
	    }
	    function loadConcepts() {
	        setConceptsLookup(internalConcepts);
	        var conceptQuery = {
	            select: { key: ['concept'], value: ['concept_type', 'domain'] },
	            from: 'concepts'
	        };
	        return queryData(conceptQuery).then(buildConceptsLookup).then(reparseConcepts);
	    }
	    function buildConceptsLookup(concepts) {
	        var entitySetMembershipConcepts = concepts.filter(function (concept) {
	            return concept.concept_type === 'entity_set';
	        }).map(function (concept) {
	            return {
	                concept: 'is--' + concept.concept,
	                concept_type: 'boolean',
	                domain: null
	            };
	        });
	        concepts = concepts.concat(entitySetMembershipConcepts).concat(internalConcepts);
	        setConceptsLookup(concepts);
	        return conceptsLookup;
	    }
	    function reparseConcepts() {
	        var parsingFunctions = new Map([['boolean', function (str) {
	            return str === 'true' || str === 'TRUE';
	        }], ['measure', function (str) {
	            return parseFloat(str);
	        }]]);
	        var resources = getResources(['concept']);
	        var resourceUpdates = [].concat(_toConsumableArray(resources)).map(function (resource) {
	            return resource.data.then(function (response) {
	                var resourceConcepts = Object.keys(response.data[0]);
	                var parsingConcepts = new Map();
	                resourceConcepts.forEach(function (concept) {
	                    var type = conceptsLookup.get(concept).concept_type;
	                    var fn = parsingFunctions.get(type);
	                    if (fn) {
	                        parsingConcepts.set(concept, fn);
	                    }
	                });
	                return response.data.forEach(function (row) {
	                    var _iteratorNormalCompletion = true;
	                    var _didIteratorError = false;
	                    var _iteratorError = undefined;
	
	                    try {
	                        for (var _iterator = parsingConcepts[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	                            var _step$value = _slicedToArray(_step.value, 2),
	                                concept = _step$value[0],
	                                parseFn = _step$value[1];
	
	                            row[concept] = parseFn(row[concept]);
	                        }
	                    } catch (err) {
	                        _didIteratorError = true;
	                        _iteratorError = err;
	                    } finally {
	                        try {
	                            if (!_iteratorNormalCompletion && _iterator.return) {
	                                _iterator.return();
	                            }
	                        } finally {
	                            if (_didIteratorError) {
	                                throw _iteratorError;
	                            }
	                        }
	                    }
	                });
	            });
	        });
	        return Promise.all(resourceUpdates);
	    }
	    function setConceptsLookup(concepts) {
	        conceptsLookup.clear();
	        concepts.forEach(function (row) {
	            return conceptsLookup.set(row.concept, row);
	        });
	    }
	    function query(queryParam) {
	        if (isSchemaQuery(queryParam)) {
	            return datapackagePromise.then(function () {
	                return querySchema(queryParam);
	            });
	        } else {
	            return conceptsPromise.then(function () {
	                var appropriatePlugin = query_optimization_plugins_1.getAppropriatePlugin(fileReader, basePath, queryParam, datapackage);
	                return new Promise(function (resolve) {
	                    if (!appropriatePlugin) {
	                        return resolve();
	                    }
	                    appropriatePlugin.getOptimalFilesSet().then(function (files) {
	                        optimalFilesSet = files;
	                        resolve();
	                    }).catch(function () {
	                        optimalFilesSet = [];
	                        resolve();
	                    });
	                });
	            }).then(function () {
	                return queryData(queryParam);
	            });
	        }
	    }
	    function isSchemaQuery(queryParam) {
	        var fromClause = queryParam.from || '';
	        return fromClause.split('.')[1] === 'schema';
	    }
	    function queryData(queryParam) {
	        var _queryParam$select = queryParam.select,
	            _queryParam$select$ke = _queryParam$select.key,
	            key = _queryParam$select$ke === undefined ? [] : _queryParam$select$ke,
	            _queryParam$select$va = _queryParam$select.value,
	            value = _queryParam$select$va === undefined ? [] : _queryParam$select$va,
	            _queryParam$from = queryParam.from,
	            from = _queryParam$from === undefined ? '' : _queryParam$from,
	            _queryParam$where = queryParam.where,
	            where = _queryParam$where === undefined ? {} : _queryParam$where,
	            _queryParam$join = queryParam.join,
	            join = _queryParam$join === undefined ? {} : _queryParam$join,
	            _queryParam$order_by = queryParam.order_by,
	            order_by = _queryParam$order_by === undefined ? [] : _queryParam$order_by,
	            language = queryParam.language;
	
	        var select = { key: key, value: value };
	        var projection = new Set(select.key.concat(select.value));
	        var filterFields = getFilterFields(where).filter(function (field) {
	            return !projection.has(field);
	        });
	        var resourcesPromise = loadResources(select.key, [].concat(_toConsumableArray(select.value), _toConsumableArray(filterFields)), language);
	        var joinsPromise = getJoinFilters(join);
	        var entitySetFilterPromise = getEntitySetFilter(select.key);
	        return Promise.all([resourcesPromise, entitySetFilterPromise, joinsPromise]).then(function (_ref) {
	            var _ref2 = _slicedToArray(_ref, 3),
	                resourceResponses = _ref2[0],
	                entitySetFilter = _ref2[1],
	                joinFilters = _ref2[2];
	
	            var whereResolved = processWhere(where, joinFilters);
	            var filter = mergeFilters(entitySetFilter, whereResolved);
	            var dataTables = resourceResponses.map(function (response) {
	                return processResourceResponse(response, select, filterFields);
	            });
	            var queryResult = joinData.apply(undefined, [select.key, 'overwrite'].concat(_toConsumableArray(dataTables))).filter(function (row) {
	                return applyFilterRow(row, filter);
	            }).map(function (row) {
	                return fillMissingValues(row, projection);
	            }).map(function (row) {
	                return projectRow(row, projection);
	            });
	            orderData(queryResult, order_by);
	            return queryResult;
	        });
	    }
	    function orderData(data) {
	        var orderBy = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
	
	        if (orderBy.length === 0) {
	            return;
	        }
	        var orderNormalized = orderBy.map(function (orderPart) {
	            if (typeof orderPart === 'string') {
	                return { concept: orderPart, direction: 1 };
	            } else {
	                var concept = Object.keys(orderPart)[0];
	                var direction = orderPart[concept] === 'asc' ? 1 : -1;
	                return { concept: concept, direction: direction };
	            }
	        });
	        var n = orderNormalized.length;
	        data.sort(function (a, b) {
	            for (var i = 0; i < n; i++) {
	                var order = orderNormalized[i];
	                if (a[order.concept] < b[order.concept]) {
	                    return -1 * order.direction;
	                } else if (a[order.concept] > b[order.concept]) {
	                    return 1 * order.direction;
	                }
	            }
	            return 0;
	        });
	    }
	    function processWhere(where, joinFilters) {
	        var result = {};
	        for (var field in where) {
	            var fieldValue = where[field];
	            if (['$and', '$or', '$nor'].includes(field)) {
	                result[field] = fieldValue.map(function (subFilter) {
	                    return processWhere(subFilter, joinFilters);
	                });
	            } else if (field === '$in' || field === '$nin') {
	                result[field] = new Set(fieldValue);
	            } else if (typeof joinFilters[fieldValue] !== 'undefined') {
	                Object.assign(result, joinFilters[fieldValue]);
	            } else if ((typeof fieldValue === "undefined" ? "undefined" : _typeof(fieldValue)) === 'object') {
	                result[field] = processWhere(fieldValue, joinFilters);
	            } else {
	                result[field] = fieldValue;
	            }
	        }
	        return result;
	    }
	    function mergeFilters() {
	        for (var _len = arguments.length, filters = Array(_len), _key = 0; _key < _len; _key++) {
	            filters[_key] = arguments[_key];
	        }
	
	        return filters.reduce(function (a, b) {
	            a.$and.push(b);
	            return a;
	        }, { $and: [] });
	    }
	    function querySchema(queryPar) {
	        var getSchemaFromCollection = function getSchemaFromCollection(collectionPar) {
	            return datapackage.ddfSchema[collectionPar].map(function (_ref3) {
	                var primaryKey = _ref3.primaryKey,
	                    value = _ref3.value;
	                return { key: primaryKey, value: value };
	            });
	        };
	        var collection = queryPar.from.split('.')[0];
	        if (datapackage.ddfSchema[collection]) {
	            return getSchemaFromCollection(collection);
	        } else if (collection === '*') {
	            return Object.keys(datapackage.ddfSchema).map(getSchemaFromCollection).reduce(function (a, b) {
	                return a.concat(b);
	            });
	        } else {
	            throwError(new ddfcsv_error_1.DdfCsvError(ddfcsv_error_1.DDF_ERROR, "No valid collection (" + collection + ") for schema query"));
	        }
	    }
	    function fillMissingValues(row, projection) {
	        var _iteratorNormalCompletion2 = true;
	        var _didIteratorError2 = false;
	        var _iteratorError2 = undefined;
	
	        try {
	            for (var _iterator2 = projection[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	                var field = _step2.value;
	
	                if (typeof row[field] === 'undefined') {
	                    row[field] = null;
	                }
	            }
	        } catch (err) {
	            _didIteratorError2 = true;
	            _iteratorError2 = err;
	        } finally {
	            try {
	                if (!_iteratorNormalCompletion2 && _iterator2.return) {
	                    _iterator2.return();
	                }
	            } finally {
	                if (_didIteratorError2) {
	                    throw _iteratorError2;
	                }
	            }
	        }
	
	        return row;
	    }
	    function applyFilterRow(row, filter) {
	        return Object.keys(filter).every(function (filterKey) {
	            var operator = operators.get(filterKey);
	            if (operator) {
	                return operator(row, filter[filterKey]);
	            } else if (_typeof(filter[filterKey]) !== 'object') {
	                return operators.get('$eq')(row[filterKey], filter[filterKey]);
	            } else {
	                return applyFilterRow(row[filterKey], filter[filterKey]);
	            }
	        });
	    }
	    function getJoinFilters(join) {
	        return Promise.all(Object.keys(join).map(function (joinID) {
	            return getJoinFilter(joinID, join[joinID]);
	        })).then(function (results) {
	            return results.reduce(mergeObjects, {});
	        });
	    }
	    function mergeObjects(a, b) {
	        return Object.assign(a, b);
	    }
	    function getJoinFilter(joinID, join) {
	        if (conceptsLookup.get(join.key).concept_type === 'time') {
	            return Promise.resolve(_defineProperty({}, joinID, join.where));
	        } else {
	            return query({ select: { key: [join.key] }, where: join.where }).then(function (result) {
	                return _defineProperty({}, joinID, _defineProperty({}, join.key, {
	                    $in: new Set(result.map(function (row) {
	                        return row[join.key];
	                    }))
	                }));
	            });
	        }
	    }
	    function getFilterFields(filter) {
	        var fields = [];
	        for (var field in filter) {
	            if (['$and', '$or', '$not', '$nor'].includes(field)) {
	                filter[field].map(getFilterFields).forEach(function (subFields) {
	                    return fields.push.apply(fields, _toConsumableArray(subFields));
	                });
	            } else {
	                fields.push(field);
	            }
	        }
	        return fields;
	    }
	    function filterConceptsByType(conceptTypes) {
	        var conceptStrings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Array.from(conceptsLookup.keys());
	
	        var concepts = [];
	        var _iteratorNormalCompletion3 = true;
	        var _didIteratorError3 = false;
	        var _iteratorError3 = undefined;
	
	        try {
	            for (var _iterator3 = conceptStrings[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
	                var conceptString = _step3.value;
	
	                var concept = conceptsLookup.get(conceptString);
	                if (conceptTypes.includes(concept.concept_type)) {
	                    concepts.push(concept);
	                }
	            }
	        } catch (err) {
	            _didIteratorError3 = true;
	            _iteratorError3 = err;
	        } finally {
	            try {
	                if (!_iteratorNormalCompletion3 && _iterator3.return) {
	                    _iterator3.return();
	                }
	            } finally {
	                if (_didIteratorError3) {
	                    throw _iteratorError3;
	                }
	            }
	        }
	
	        return concepts;
	    }
	    function getEntityConceptRenameMap(queryKey, resourceKey) {
	        var resourceKeySet = new Set(resourceKey);
	        var entityConceptTypes = ['entity_set', 'entity_domain'];
	        var queryEntityConcepts = filterConceptsByType(entityConceptTypes, queryKey);
	        if (queryEntityConcepts.length === 0) {
	            return new Map();
	        }
	        var allEntityConcepts = filterConceptsByType(entityConceptTypes);
	        return queryEntityConcepts.map(function (concept) {
	            return allEntityConcepts.filter(function (lookupConcept) {
	                if (concept.concept_type === 'entity_set') {
	                    return resourceKeySet.has(lookupConcept.concept) && lookupConcept.concept !== concept.concept && (lookupConcept.domain === concept.domain || lookupConcept.concept === concept.domain);
	                } else {
	                    return resourceKeySet.has(lookupConcept.concept) && lookupConcept.concept !== concept.concept && lookupConcept.domain === concept.concept;
	                }
	            }).reduce(function (map, aliasConcept) {
	                return map.set(aliasConcept.concept, concept.concept);
	            }, new Map());
	        }).reduce(function (mapA, mapB) {
	            return new Map([].concat(_toConsumableArray(mapA), _toConsumableArray(mapB)));
	        }, new Map());
	    }
	    function getEntitySetFilter(conceptStrings) {
	        var promises = filterConceptsByType(['entity_set'], conceptStrings).map(function (concept) {
	            return query({ select: { key: [concept.domain], value: ['is--' + concept.concept] } }).then(function (result) {
	                return _defineProperty({}, concept.concept, {
	                    $in: new Set(result.filter(function (row) {
	                        return row['is--' + concept.concept];
	                    }).map(function (row) {
	                        return row[concept.domain];
	                    }))
	                });
	            });
	        });
	        return Promise.all(promises).then(function (results) {
	            return results.reduce(function (a, b) {
	                return Object.assign(a, b);
	            }, {});
	        });
	    }
	    function getResources(key, value) {
	        if (!value || value.length === 0) {
	            return new Set([].concat(_toConsumableArray(keyValueLookup.get(createKeyString(key)).values())).reduce(function (a, b) {
	                return a.concat(b);
	            }));
	        }
	        if (Array.isArray(value)) {
	            return value.map(function (singleValue) {
	                return getResources(key, singleValue);
	            }).reduce(function (resultSet, resources) {
	                return new Set([].concat(_toConsumableArray(resultSet), _toConsumableArray(resources)));
	            }, new Set());
	        }
	        var oneKeyOneValueResourcesArray = keyValueLookup.get(createKeyString(key)).get(value);
	        if (oneKeyOneValueResourcesArray) {
	            oneKeyOneValueResourcesArray = oneKeyOneValueResourcesArray.filter(function (v) {
	                return isEmpty(optimalFilesSet) || includes(optimalFilesSet, v.path);
	            });
	        }
	        return new Set(oneKeyOneValueResourcesArray);
	    }
	    function processResourceResponse(response, select, filterFields) {
	        var resourcePK = response.resource.schema.primaryKey;
	        var resourceProjection = new Set([].concat(_toConsumableArray(resourcePK), _toConsumableArray(select.value), _toConsumableArray(filterFields)));
	        var renameMap = getEntityConceptRenameMap(select.key, resourcePK);
	        return response.data.map(function (row) {
	            return projectRow(row, resourceProjection);
	        }).map(function (row) {
	            return renameHeaderRow(row, renameMap);
	        });
	    }
	    function loadResources(key, value, language) {
	        var resources = getResources(key, value);
	        return Promise.all([].concat(_toConsumableArray(resources)).map(function (resource) {
	            return loadResource(resource, language);
	        }));
	    }
	    function projectRow(row, projectionSet) {
	        var result = {};
	        for (var concept in row) {
	            if (projectionSet.has(concept)) {
	                result[concept] = row[concept];
	            }
	        }
	        return result;
	    }
	    function renameHeaderRow(row, renameMap) {
	        var result = {};
	        for (var concept in row) {
	            result[renameMap.get(concept) || concept] = row[concept];
	        }
	        return result;
	    }
	    function joinData(key, joinMode) {
	        for (var _len2 = arguments.length, data = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
	            data[_key2 - 2] = arguments[_key2];
	        }
	
	        if (data.length === 1) {
	            return data[0];
	        }
	        var canonicalKey = key.slice(0).sort();
	        var dataMap = data.reduce(function (result, dataPar) {
	            dataPar.forEach(function (row) {
	                var keyString = canonicalKey.map(function (concept) {
	                    return row[concept];
	                }).join(',');
	                if (result.has(keyString)) {
	                    var resultRow = result.get(keyString);
	                    joinRow(resultRow, row, joinMode);
	                } else {
	                    result.set(keyString, row);
	                }
	            });
	            return result;
	        }, new Map());
	        return [].concat(_toConsumableArray(dataMap.values()));
	    }
	    function joinRow(resultRow, sourceRow, mode) {
	        switch (mode) {
	            case 'overwrite':
	                Object.assign(resultRow, sourceRow);
	                break;
	            case 'translation':
	                for (var concept in sourceRow) {
	                    if (sourceRow[concept] !== '') {
	                        resultRow[concept] = sourceRow[concept];
	                    }
	                }
	                break;
	            case 'overwriteWithError':
	                for (var _concept in sourceRow) {
	                    if (resultRow[_concept] !== undefined && resultRow[_concept] !== sourceRow[_concept]) {
	                        var sourceRowStr = JSON.stringify(sourceRow);
	                        var resultRowStr = JSON.stringify(resultRow);
	                        var errStr = "JOIN Error: two resources have different data for \"" + _concept + "\": " + sourceRowStr + "," + resultRowStr;
	                        throwError(new ddfcsv_error_1.DdfCsvError(ddfcsv_error_1.DDF_ERROR, errStr));
	                    } else {
	                        resultRow[_concept] = sourceRow[_concept];
	                    }
	                }
	                break;
	        }
	    }
	    function throwError(error) {
	        var currentLogger = logger || console;
	        currentLogger.error(error.message);
	        throw error;
	    }
	    function createKeyString(key) {
	        var row = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
	
	        var canonicalKey = key.slice(0).sort();
	        if (!row) {
	            return canonicalKey.join(',');
	        } else {
	            return canonicalKey.map(function (concept) {
	                return row[concept];
	            }).join(',');
	        }
	    }
	    function loadResource(resource, language) {
	        var filePromises = [];
	        if (typeof resource.data === 'undefined') {
	            resource.data = loadFile(basePath + resource.path);
	        }
	        filePromises.push(resource.data);
	        var languageValid = typeof language !== 'undefined' && getLanguages().includes(language);
	        var languageLoaded = typeof resource.translations[language] !== 'undefined';
	        if (languageValid) {
	            if (!languageLoaded) {
	                var translationPath = basePath + "lang/" + language + "/" + resource.path;
	                resource.translations[language] = loadFile(translationPath).catch(function (err) {
	                    return Promise.resolve({});
	                });
	            }
	            filePromises.push(resource.translations[language]);
	        }
	        return Promise.all(filePromises).then(function (fileResponses) {
	            var filesData = fileResponses.map(function (resp) {
	                return resp.data || [];
	            });
	            var primaryKey = resource.schema.primaryKey;
	            var data = joinData.apply(undefined, [primaryKey, 'translation'].concat(_toConsumableArray(filesData)));
	            return { data: data, resource: resource };
	        });
	    }
	    function getLanguages() {
	        if (!datapackage.translations) {
	            return [];
	        }
	        return datapackage.translations.map(function (lang) {
	            return lang.id;
	        });
	    }
	    function loadFile(filePath) {
	        return new Promise(function (resolve, reject) {
	            fileReader.readText(filePath, function (err, data) {
	                if (err) {
	                    return reject(new ddfcsv_error_1.DdfCsvError(ddfcsv_error_1.FILE_READING_ERROR, err, filePath));
	                }
	                Papa.parse(data, {
	                    header: true,
	                    skipEmptyLines: true,
	                    dynamicTyping: function dynamicTyping(headerName) {
	                        if (!conceptsLookup) {
	                            return true;
	                        }
	                        var concept = conceptsLookup.get(headerName) || {};
	                        return ['boolean', 'measure'].includes(concept.concept_type);
	                    },
	                    complete: function complete(result) {
	                        return resolve(result);
	                    },
	                    error: function error(_error) {
	                        return reject(new ddfcsv_error_1.DdfCsvError(ddfcsv_error_1.CSV_PARSING_ERROR, _error, filePath));
	                    }
	                });
	            });
	        });
	    }
	    function buildResourcesLookup(datapackagePar) {
	        if (resourcesLookup.size > 0) {
	            return resourcesLookup;
	        }
	        datapackagePar.resources.forEach(function (resource) {
	            if (!Array.isArray(resource.schema.primaryKey)) {
	                resource.schema.primaryKey = [resource.schema.primaryKey];
	            }
	            resource.translations = {};
	            resourcesLookup.set(resource.name, resource);
	        });
	        return resourcesLookup;
	    }
	    function buildKeyValueLookup(datapackagePar) {
	        if (keyValueLookup.size > 0) {
	            return keyValueLookup;
	        }
	        for (var collection in datapackagePar.ddfSchema) {
	            datapackagePar.ddfSchema[collection].map(function (kvPair) {
	                var key = createKeyString(kvPair.primaryKey);
	                var resources = kvPair.resources.map(function (resourceName) {
	                    return resourcesLookup.get(resourceName);
	                });
	                if (keyValueLookup.has(key)) {
	                    keyValueLookup.get(key).set(kvPair.value, resources);
	                } else {
	                    keyValueLookup.set(key, new Map([[kvPair.value, resources]]));
	                }
	            });
	        }
	        return keyValueLookup;
	    }
	    return {
	        query: query
	    };
	}
	exports.ddfCsvReader = ddfCsvReader;
	//# sourceMappingURL=ddf-csv.js.map

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseIndexOf = __webpack_require__(46),
	    isArrayLike = __webpack_require__(50),
	    isString = __webpack_require__(60),
	    toInteger = __webpack_require__(63),
	    values = __webpack_require__(67);
	
	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max;
	
	/**
	 * Checks if `value` is in `collection`. If `collection` is a string, it's
	 * checked for a substring of `value`, otherwise
	 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * is used for equality comparisons. If `fromIndex` is negative, it's used as
	 * the offset from the end of `collection`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Collection
	 * @param {Array|Object|string} collection The collection to inspect.
	 * @param {*} value The value to search for.
	 * @param {number} [fromIndex=0] The index to search from.
	 * @param- {Object} [guard] Enables use as an iteratee for methods like `_.reduce`.
	 * @returns {boolean} Returns `true` if `value` is found, else `false`.
	 * @example
	 *
	 * _.includes([1, 2, 3], 1);
	 * // => true
	 *
	 * _.includes([1, 2, 3], 1, 2);
	 * // => false
	 *
	 * _.includes({ 'a': 1, 'b': 2 }, 1);
	 * // => true
	 *
	 * _.includes('abcd', 'bc');
	 * // => true
	 */
	function includes(collection, value, fromIndex, guard) {
	  collection = isArrayLike(collection) ? collection : values(collection);
	  fromIndex = fromIndex && !guard ? toInteger(fromIndex) : 0;
	
	  var length = collection.length;
	  if (fromIndex < 0) {
	    fromIndex = nativeMax(length + fromIndex, 0);
	  }
	  return isString(collection) ? fromIndex <= length && collection.indexOf(value, fromIndex) > -1 : !!length && baseIndexOf(collection, value, fromIndex) > -1;
	}
	
	module.exports = includes;

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseFindIndex = __webpack_require__(47),
	    baseIsNaN = __webpack_require__(48),
	    strictIndexOf = __webpack_require__(49);
	
	/**
	 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {*} value The value to search for.
	 * @param {number} fromIndex The index to search from.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function baseIndexOf(array, value, fromIndex) {
	    return value === value ? strictIndexOf(array, value, fromIndex) : baseFindIndex(array, baseIsNaN, fromIndex);
	}
	
	module.exports = baseIndexOf;

/***/ },
/* 47 */
/***/ function(module, exports) {

	"use strict";
	
	/**
	 * The base implementation of `_.findIndex` and `_.findLastIndex` without
	 * support for iteratee shorthands.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {Function} predicate The function invoked per iteration.
	 * @param {number} fromIndex The index to search from.
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function baseFindIndex(array, predicate, fromIndex, fromRight) {
	  var length = array.length,
	      index = fromIndex + (fromRight ? 1 : -1);
	
	  while (fromRight ? index-- : ++index < length) {
	    if (predicate(array[index], index, array)) {
	      return index;
	    }
	  }
	  return -1;
	}
	
	module.exports = baseFindIndex;

/***/ },
/* 48 */
/***/ function(module, exports) {

	"use strict";
	
	/**
	 * The base implementation of `_.isNaN` without support for number objects.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
	 */
	function baseIsNaN(value) {
	  return value !== value;
	}
	
	module.exports = baseIsNaN;

/***/ },
/* 49 */
/***/ function(module, exports) {

	"use strict";
	
	/**
	 * A specialized version of `_.indexOf` which performs strict equality
	 * comparisons of values, i.e. `===`.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {*} value The value to search for.
	 * @param {number} fromIndex The index to search from.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function strictIndexOf(array, value, fromIndex) {
	  var index = fromIndex - 1,
	      length = array.length;
	
	  while (++index < length) {
	    if (array[index] === value) {
	      return index;
	    }
	  }
	  return -1;
	}
	
	module.exports = strictIndexOf;

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var isFunction = __webpack_require__(51),
	    isLength = __webpack_require__(59);
	
	/**
	 * Checks if `value` is array-like. A value is considered array-like if it's
	 * not a function and has a `value.length` that's an integer greater than or
	 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	 * @example
	 *
	 * _.isArrayLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLike(document.body.children);
	 * // => true
	 *
	 * _.isArrayLike('abc');
	 * // => true
	 *
	 * _.isArrayLike(_.noop);
	 * // => false
	 */
	function isArrayLike(value) {
	  return value != null && isLength(value.length) && !isFunction(value);
	}
	
	module.exports = isArrayLike;

/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseGetTag = __webpack_require__(52),
	    isObject = __webpack_require__(58);
	
	/** `Object#toString` result references. */
	var asyncTag = '[object AsyncFunction]',
	    funcTag = '[object Function]',
	    genTag = '[object GeneratorFunction]',
	    proxyTag = '[object Proxy]';
	
	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction(value) {
	    if (!isObject(value)) {
	        return false;
	    }
	    // The use of `Object#toString` avoids issues with the `typeof` operator
	    // in Safari 9 which returns 'object' for typed arrays and other constructors.
	    var tag = baseGetTag(value);
	    return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
	}
	
	module.exports = isFunction;

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _Symbol = __webpack_require__(53),
	    getRawTag = __webpack_require__(56),
	    objectToString = __webpack_require__(57);
	
	/** `Object#toString` result references. */
	var nullTag = '[object Null]',
	    undefinedTag = '[object Undefined]';
	
	/** Built-in value references. */
	var symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;
	
	/**
	 * The base implementation of `getTag` without fallbacks for buggy environments.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the `toStringTag`.
	 */
	function baseGetTag(value) {
	    if (value == null) {
	        return value === undefined ? undefinedTag : nullTag;
	    }
	    return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
	}
	
	module.exports = baseGetTag;

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var root = __webpack_require__(54);
	
	/** Built-in value references. */
	var _Symbol = root.Symbol;
	
	module.exports = _Symbol;

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var freeGlobal = __webpack_require__(55);
	
	/** Detect free variable `self`. */
	var freeSelf = (typeof self === 'undefined' ? 'undefined' : _typeof(self)) == 'object' && self && self.Object === Object && self;
	
	/** Used as a reference to the global object. */
	var root = freeGlobal || freeSelf || Function('return this')();
	
	module.exports = root;

/***/ },
/* 55 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	/** Detect free variable `global` from Node.js. */
	var freeGlobal = (typeof global === 'undefined' ? 'undefined' : _typeof(global)) == 'object' && global && global.Object === Object && global;
	
	module.exports = freeGlobal;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _Symbol = __webpack_require__(53);
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var nativeObjectToString = objectProto.toString;
	
	/** Built-in value references. */
	var symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;
	
	/**
	 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the raw `toStringTag`.
	 */
	function getRawTag(value) {
	  var isOwn = hasOwnProperty.call(value, symToStringTag),
	      tag = value[symToStringTag];
	
	  try {
	    value[symToStringTag] = undefined;
	    var unmasked = true;
	  } catch (e) {}
	
	  var result = nativeObjectToString.call(value);
	  if (unmasked) {
	    if (isOwn) {
	      value[symToStringTag] = tag;
	    } else {
	      delete value[symToStringTag];
	    }
	  }
	  return result;
	}
	
	module.exports = getRawTag;

/***/ },
/* 57 */
/***/ function(module, exports) {

	"use strict";
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var nativeObjectToString = objectProto.toString;
	
	/**
	 * Converts `value` to a string using `Object.prototype.toString`.
	 *
	 * @private
	 * @param {*} value The value to convert.
	 * @returns {string} Returns the converted string.
	 */
	function objectToString(value) {
	  return nativeObjectToString.call(value);
	}
	
	module.exports = objectToString;

/***/ },
/* 58 */
/***/ function(module, exports) {

	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	/**
	 * Checks if `value` is the
	 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
	 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(_.noop);
	 * // => true
	 *
	 * _.isObject(null);
	 * // => false
	 */
	function isObject(value) {
	  var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);
	  return value != null && (type == 'object' || type == 'function');
	}
	
	module.exports = isObject;

/***/ },
/* 59 */
/***/ function(module, exports) {

	'use strict';
	
	/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER = 9007199254740991;
	
	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This method is loosely based on
	 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 * @example
	 *
	 * _.isLength(3);
	 * // => true
	 *
	 * _.isLength(Number.MIN_VALUE);
	 * // => false
	 *
	 * _.isLength(Infinity);
	 * // => false
	 *
	 * _.isLength('3');
	 * // => false
	 */
	function isLength(value) {
	  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}
	
	module.exports = isLength;

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseGetTag = __webpack_require__(52),
	    isArray = __webpack_require__(61),
	    isObjectLike = __webpack_require__(62);
	
	/** `Object#toString` result references. */
	var stringTag = '[object String]';
	
	/**
	 * Checks if `value` is classified as a `String` primitive or object.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a string, else `false`.
	 * @example
	 *
	 * _.isString('abc');
	 * // => true
	 *
	 * _.isString(1);
	 * // => false
	 */
	function isString(value) {
	    return typeof value == 'string' || !isArray(value) && isObjectLike(value) && baseGetTag(value) == stringTag;
	}
	
	module.exports = isString;

/***/ },
/* 61 */
/***/ function(module, exports) {

	"use strict";
	
	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(document.body.children);
	 * // => false
	 *
	 * _.isArray('abc');
	 * // => false
	 *
	 * _.isArray(_.noop);
	 * // => false
	 */
	var isArray = Array.isArray;
	
	module.exports = isArray;

/***/ },
/* 62 */
/***/ function(module, exports) {

	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return value != null && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) == 'object';
	}
	
	module.exports = isObjectLike;

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var toFinite = __webpack_require__(64);
	
	/**
	 * Converts `value` to an integer.
	 *
	 * **Note:** This method is loosely based on
	 * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {number} Returns the converted integer.
	 * @example
	 *
	 * _.toInteger(3.2);
	 * // => 3
	 *
	 * _.toInteger(Number.MIN_VALUE);
	 * // => 0
	 *
	 * _.toInteger(Infinity);
	 * // => 1.7976931348623157e+308
	 *
	 * _.toInteger('3.2');
	 * // => 3
	 */
	function toInteger(value) {
	  var result = toFinite(value),
	      remainder = result % 1;
	
	  return result === result ? remainder ? result - remainder : result : 0;
	}
	
	module.exports = toInteger;

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var toNumber = __webpack_require__(65);
	
	/** Used as references for various `Number` constants. */
	var INFINITY = 1 / 0,
	    MAX_INTEGER = 1.7976931348623157e+308;
	
	/**
	 * Converts `value` to a finite number.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.12.0
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {number} Returns the converted number.
	 * @example
	 *
	 * _.toFinite(3.2);
	 * // => 3.2
	 *
	 * _.toFinite(Number.MIN_VALUE);
	 * // => 5e-324
	 *
	 * _.toFinite(Infinity);
	 * // => 1.7976931348623157e+308
	 *
	 * _.toFinite('3.2');
	 * // => 3.2
	 */
	function toFinite(value) {
	  if (!value) {
	    return value === 0 ? value : 0;
	  }
	  value = toNumber(value);
	  if (value === INFINITY || value === -INFINITY) {
	    var sign = value < 0 ? -1 : 1;
	    return sign * MAX_INTEGER;
	  }
	  return value === value ? value : 0;
	}
	
	module.exports = toFinite;

/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var isObject = __webpack_require__(58),
	    isSymbol = __webpack_require__(66);
	
	/** Used as references for various `Number` constants. */
	var NAN = 0 / 0;
	
	/** Used to match leading and trailing whitespace. */
	var reTrim = /^\s+|\s+$/g;
	
	/** Used to detect bad signed hexadecimal string values. */
	var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
	
	/** Used to detect binary string values. */
	var reIsBinary = /^0b[01]+$/i;
	
	/** Used to detect octal string values. */
	var reIsOctal = /^0o[0-7]+$/i;
	
	/** Built-in method references without a dependency on `root`. */
	var freeParseInt = parseInt;
	
	/**
	 * Converts `value` to a number.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to process.
	 * @returns {number} Returns the number.
	 * @example
	 *
	 * _.toNumber(3.2);
	 * // => 3.2
	 *
	 * _.toNumber(Number.MIN_VALUE);
	 * // => 5e-324
	 *
	 * _.toNumber(Infinity);
	 * // => Infinity
	 *
	 * _.toNumber('3.2');
	 * // => 3.2
	 */
	function toNumber(value) {
	  if (typeof value == 'number') {
	    return value;
	  }
	  if (isSymbol(value)) {
	    return NAN;
	  }
	  if (isObject(value)) {
	    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
	    value = isObject(other) ? other + '' : other;
	  }
	  if (typeof value != 'string') {
	    return value === 0 ? value : +value;
	  }
	  value = value.replace(reTrim, '');
	  var isBinary = reIsBinary.test(value);
	  return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
	}
	
	module.exports = toNumber;

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var baseGetTag = __webpack_require__(52),
	    isObjectLike = __webpack_require__(62);
	
	/** `Object#toString` result references. */
	var symbolTag = '[object Symbol]';
	
	/**
	 * Checks if `value` is classified as a `Symbol` primitive or object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
	 * @example
	 *
	 * _.isSymbol(Symbol.iterator);
	 * // => true
	 *
	 * _.isSymbol('abc');
	 * // => false
	 */
	function isSymbol(value) {
	    return (typeof value === 'undefined' ? 'undefined' : _typeof(value)) == 'symbol' || isObjectLike(value) && baseGetTag(value) == symbolTag;
	}
	
	module.exports = isSymbol;

/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseValues = __webpack_require__(68),
	    keys = __webpack_require__(70);
	
	/**
	 * Creates an array of the own enumerable string keyed property values of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property values.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.values(new Foo);
	 * // => [1, 2] (iteration order is not guaranteed)
	 *
	 * _.values('hi');
	 * // => ['h', 'i']
	 */
	function values(object) {
	  return object == null ? [] : baseValues(object, keys(object));
	}
	
	module.exports = values;

/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var arrayMap = __webpack_require__(69);
	
	/**
	 * The base implementation of `_.values` and `_.valuesIn` which creates an
	 * array of `object` property values corresponding to the property names
	 * of `props`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array} props The property names to get values for.
	 * @returns {Object} Returns the array of property values.
	 */
	function baseValues(object, props) {
	  return arrayMap(props, function (key) {
	    return object[key];
	  });
	}
	
	module.exports = baseValues;

/***/ },
/* 69 */
/***/ function(module, exports) {

	"use strict";
	
	/**
	 * A specialized version of `_.map` for arrays without support for iteratee
	 * shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the new mapped array.
	 */
	function arrayMap(array, iteratee) {
	  var index = -1,
	      length = array == null ? 0 : array.length,
	      result = Array(length);
	
	  while (++index < length) {
	    result[index] = iteratee(array[index], index, array);
	  }
	  return result;
	}
	
	module.exports = arrayMap;

/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var arrayLikeKeys = __webpack_require__(71),
	    baseKeys = __webpack_require__(83),
	    isArrayLike = __webpack_require__(50);
	
	/**
	 * Creates an array of the own enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects. See the
	 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
	 * for more details.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keys(new Foo);
	 * // => ['a', 'b'] (iteration order is not guaranteed)
	 *
	 * _.keys('hi');
	 * // => ['0', '1']
	 */
	function keys(object) {
	  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
	}
	
	module.exports = keys;

/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseTimes = __webpack_require__(72),
	    isArguments = __webpack_require__(73),
	    isArray = __webpack_require__(61),
	    isBuffer = __webpack_require__(75),
	    isIndex = __webpack_require__(78),
	    isTypedArray = __webpack_require__(79);
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * Creates an array of the enumerable property names of the array-like `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @param {boolean} inherited Specify returning inherited property names.
	 * @returns {Array} Returns the array of property names.
	 */
	function arrayLikeKeys(value, inherited) {
	  var isArr = isArray(value),
	      isArg = !isArr && isArguments(value),
	      isBuff = !isArr && !isArg && isBuffer(value),
	      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
	      skipIndexes = isArr || isArg || isBuff || isType,
	      result = skipIndexes ? baseTimes(value.length, String) : [],
	      length = result.length;
	
	  for (var key in value) {
	    if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && (
	    // Safari 9 has enumerable `arguments.length` in strict mode.
	    key == 'length' ||
	    // Node.js 0.10 has enumerable non-index properties on buffers.
	    isBuff && (key == 'offset' || key == 'parent') ||
	    // PhantomJS 2 has enumerable non-index properties on typed arrays.
	    isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset') ||
	    // Skip index properties.
	    isIndex(key, length)))) {
	      result.push(key);
	    }
	  }
	  return result;
	}
	
	module.exports = arrayLikeKeys;

/***/ },
/* 72 */
/***/ function(module, exports) {

	"use strict";
	
	/**
	 * The base implementation of `_.times` without support for iteratee shorthands
	 * or max array length checks.
	 *
	 * @private
	 * @param {number} n The number of times to invoke `iteratee`.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the array of results.
	 */
	function baseTimes(n, iteratee) {
	  var index = -1,
	      result = Array(n);
	
	  while (++index < n) {
	    result[index] = iteratee(index);
	  }
	  return result;
	}
	
	module.exports = baseTimes;

/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseIsArguments = __webpack_require__(74),
	    isObjectLike = __webpack_require__(62);
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/** Built-in value references. */
	var propertyIsEnumerable = objectProto.propertyIsEnumerable;
	
	/**
	 * Checks if `value` is likely an `arguments` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
	 *  else `false`.
	 * @example
	 *
	 * _.isArguments(function() { return arguments; }());
	 * // => true
	 *
	 * _.isArguments([1, 2, 3]);
	 * // => false
	 */
	var isArguments = baseIsArguments(function () {
	    return arguments;
	}()) ? baseIsArguments : function (value) {
	    return isObjectLike(value) && hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee');
	};
	
	module.exports = isArguments;

/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseGetTag = __webpack_require__(52),
	    isObjectLike = __webpack_require__(62);
	
	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]';
	
	/**
	 * The base implementation of `_.isArguments`.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
	 */
	function baseIsArguments(value) {
	  return isObjectLike(value) && baseGetTag(value) == argsTag;
	}
	
	module.exports = baseIsArguments;

/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var root = __webpack_require__(54),
	    stubFalse = __webpack_require__(77);
	
	/** Detect free variable `exports`. */
	var freeExports = ( false ? 'undefined' : _typeof(exports)) == 'object' && exports && !exports.nodeType && exports;
	
	/** Detect free variable `module`. */
	var freeModule = freeExports && ( false ? 'undefined' : _typeof(module)) == 'object' && module && !module.nodeType && module;
	
	/** Detect the popular CommonJS extension `module.exports`. */
	var moduleExports = freeModule && freeModule.exports === freeExports;
	
	/** Built-in value references. */
	var Buffer = moduleExports ? root.Buffer : undefined;
	
	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;
	
	/**
	 * Checks if `value` is a buffer.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.3.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
	 * @example
	 *
	 * _.isBuffer(new Buffer(2));
	 * // => true
	 *
	 * _.isBuffer(new Uint8Array(2));
	 * // => false
	 */
	var isBuffer = nativeIsBuffer || stubFalse;
	
	module.exports = isBuffer;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(76)(module)))

/***/ },
/* 76 */
/***/ function(module, exports) {

	"use strict";
	
	module.exports = function (module) {
		if (!module.webpackPolyfill) {
			module.deprecate = function () {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	};

/***/ },
/* 77 */
/***/ function(module, exports) {

	"use strict";
	
	/**
	 * This method returns `false`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.13.0
	 * @category Util
	 * @returns {boolean} Returns `false`.
	 * @example
	 *
	 * _.times(2, _.stubFalse);
	 * // => [false, false]
	 */
	function stubFalse() {
	  return false;
	}
	
	module.exports = stubFalse;

/***/ },
/* 78 */
/***/ function(module, exports) {

	'use strict';
	
	/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER = 9007199254740991;
	
	/** Used to detect unsigned integer values. */
	var reIsUint = /^(?:0|[1-9]\d*)$/;
	
	/**
	 * Checks if `value` is a valid array-like index.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	 */
	function isIndex(value, length) {
	  length = length == null ? MAX_SAFE_INTEGER : length;
	  return !!length && (typeof value == 'number' || reIsUint.test(value)) && value > -1 && value % 1 == 0 && value < length;
	}
	
	module.exports = isIndex;

/***/ },
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseIsTypedArray = __webpack_require__(80),
	    baseUnary = __webpack_require__(81),
	    nodeUtil = __webpack_require__(82);
	
	/* Node.js helper references. */
	var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
	
	/**
	 * Checks if `value` is classified as a typed array.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
	 * @example
	 *
	 * _.isTypedArray(new Uint8Array);
	 * // => true
	 *
	 * _.isTypedArray([]);
	 * // => false
	 */
	var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
	
	module.exports = isTypedArray;

/***/ },
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseGetTag = __webpack_require__(52),
	    isLength = __webpack_require__(59),
	    isObjectLike = __webpack_require__(62);
	
	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	    arrayTag = '[object Array]',
	    boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    funcTag = '[object Function]',
	    mapTag = '[object Map]',
	    numberTag = '[object Number]',
	    objectTag = '[object Object]',
	    regexpTag = '[object RegExp]',
	    setTag = '[object Set]',
	    stringTag = '[object String]',
	    weakMapTag = '[object WeakMap]';
	
	var arrayBufferTag = '[object ArrayBuffer]',
	    dataViewTag = '[object DataView]',
	    float32Tag = '[object Float32Array]',
	    float64Tag = '[object Float64Array]',
	    int8Tag = '[object Int8Array]',
	    int16Tag = '[object Int16Array]',
	    int32Tag = '[object Int32Array]',
	    uint8Tag = '[object Uint8Array]',
	    uint8ClampedTag = '[object Uint8ClampedArray]',
	    uint16Tag = '[object Uint16Array]',
	    uint32Tag = '[object Uint32Array]';
	
	/** Used to identify `toStringTag` values of typed arrays. */
	var typedArrayTags = {};
	typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
	typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
	
	/**
	 * The base implementation of `_.isTypedArray` without Node.js optimizations.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
	 */
	function baseIsTypedArray(value) {
	    return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
	}
	
	module.exports = baseIsTypedArray;

/***/ },
/* 81 */
/***/ function(module, exports) {

	"use strict";
	
	/**
	 * The base implementation of `_.unary` without support for storing metadata.
	 *
	 * @private
	 * @param {Function} func The function to cap arguments for.
	 * @returns {Function} Returns the new capped function.
	 */
	function baseUnary(func) {
	  return function (value) {
	    return func(value);
	  };
	}
	
	module.exports = baseUnary;

/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var freeGlobal = __webpack_require__(55);
	
	/** Detect free variable `exports`. */
	var freeExports = ( false ? 'undefined' : _typeof(exports)) == 'object' && exports && !exports.nodeType && exports;
	
	/** Detect free variable `module`. */
	var freeModule = freeExports && ( false ? 'undefined' : _typeof(module)) == 'object' && module && !module.nodeType && module;
	
	/** Detect the popular CommonJS extension `module.exports`. */
	var moduleExports = freeModule && freeModule.exports === freeExports;
	
	/** Detect free variable `process` from Node.js. */
	var freeProcess = moduleExports && freeGlobal.process;
	
	/** Used to access faster Node.js helpers. */
	var nodeUtil = function () {
	  try {
	    return freeProcess && freeProcess.binding && freeProcess.binding('util');
	  } catch (e) {}
	}();
	
	module.exports = nodeUtil;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(76)(module)))

/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var isPrototype = __webpack_require__(84),
	    nativeKeys = __webpack_require__(85);
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */
	function baseKeys(object) {
	  if (!isPrototype(object)) {
	    return nativeKeys(object);
	  }
	  var result = [];
	  for (var key in Object(object)) {
	    if (hasOwnProperty.call(object, key) && key != 'constructor') {
	      result.push(key);
	    }
	  }
	  return result;
	}
	
	module.exports = baseKeys;

/***/ },
/* 84 */
/***/ function(module, exports) {

	'use strict';
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/**
	 * Checks if `value` is likely a prototype object.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
	 */
	function isPrototype(value) {
	  var Ctor = value && value.constructor,
	      proto = typeof Ctor == 'function' && Ctor.prototype || objectProto;
	
	  return value === proto;
	}
	
	module.exports = isPrototype;

/***/ },
/* 85 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var overArg = __webpack_require__(86);
	
	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeKeys = overArg(Object.keys, Object);
	
	module.exports = nativeKeys;

/***/ },
/* 86 */
/***/ function(module, exports) {

	"use strict";
	
	/**
	 * Creates a unary function that invokes `func` with its argument transformed.
	 *
	 * @private
	 * @param {Function} func The function to wrap.
	 * @param {Function} transform The argument transform.
	 * @returns {Function} Returns the new function.
	 */
	function overArg(func, transform) {
	  return function (arg) {
	    return func(transform(arg));
	  };
	}
	
	module.exports = overArg;

/***/ },
/* 87 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseKeys = __webpack_require__(83),
	    getTag = __webpack_require__(88),
	    isArguments = __webpack_require__(73),
	    isArray = __webpack_require__(61),
	    isArrayLike = __webpack_require__(50),
	    isBuffer = __webpack_require__(75),
	    isPrototype = __webpack_require__(84),
	    isTypedArray = __webpack_require__(79);
	
	/** `Object#toString` result references. */
	var mapTag = '[object Map]',
	    setTag = '[object Set]';
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * Checks if `value` is an empty object, collection, map, or set.
	 *
	 * Objects are considered empty if they have no own enumerable string keyed
	 * properties.
	 *
	 * Array-like values such as `arguments` objects, arrays, buffers, strings, or
	 * jQuery-like collections are considered empty if they have a `length` of `0`.
	 * Similarly, maps and sets are considered empty if they have a `size` of `0`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is empty, else `false`.
	 * @example
	 *
	 * _.isEmpty(null);
	 * // => true
	 *
	 * _.isEmpty(true);
	 * // => true
	 *
	 * _.isEmpty(1);
	 * // => true
	 *
	 * _.isEmpty([1, 2, 3]);
	 * // => false
	 *
	 * _.isEmpty({ 'a': 1 });
	 * // => false
	 */
	function isEmpty(value) {
	  if (value == null) {
	    return true;
	  }
	  if (isArrayLike(value) && (isArray(value) || typeof value == 'string' || typeof value.splice == 'function' || isBuffer(value) || isTypedArray(value) || isArguments(value))) {
	    return !value.length;
	  }
	  var tag = getTag(value);
	  if (tag == mapTag || tag == setTag) {
	    return !value.size;
	  }
	  if (isPrototype(value)) {
	    return !baseKeys(value).length;
	  }
	  for (var key in value) {
	    if (hasOwnProperty.call(value, key)) {
	      return false;
	    }
	  }
	  return true;
	}
	
	module.exports = isEmpty;

/***/ },
/* 88 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var DataView = __webpack_require__(89),
	    Map = __webpack_require__(96),
	    Promise = __webpack_require__(97),
	    Set = __webpack_require__(98),
	    WeakMap = __webpack_require__(99),
	    baseGetTag = __webpack_require__(52),
	    toSource = __webpack_require__(94);
	
	/** `Object#toString` result references. */
	var mapTag = '[object Map]',
	    objectTag = '[object Object]',
	    promiseTag = '[object Promise]',
	    setTag = '[object Set]',
	    weakMapTag = '[object WeakMap]';
	
	var dataViewTag = '[object DataView]';
	
	/** Used to detect maps, sets, and weakmaps. */
	var dataViewCtorString = toSource(DataView),
	    mapCtorString = toSource(Map),
	    promiseCtorString = toSource(Promise),
	    setCtorString = toSource(Set),
	    weakMapCtorString = toSource(WeakMap);
	
	/**
	 * Gets the `toStringTag` of `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the `toStringTag`.
	 */
	var getTag = baseGetTag;
	
	// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
	if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag || Map && getTag(new Map()) != mapTag || Promise && getTag(Promise.resolve()) != promiseTag || Set && getTag(new Set()) != setTag || WeakMap && getTag(new WeakMap()) != weakMapTag) {
	    getTag = function getTag(value) {
	        var result = baseGetTag(value),
	            Ctor = result == objectTag ? value.constructor : undefined,
	            ctorString = Ctor ? toSource(Ctor) : '';
	
	        if (ctorString) {
	            switch (ctorString) {
	                case dataViewCtorString:
	                    return dataViewTag;
	                case mapCtorString:
	                    return mapTag;
	                case promiseCtorString:
	                    return promiseTag;
	                case setCtorString:
	                    return setTag;
	                case weakMapCtorString:
	                    return weakMapTag;
	            }
	        }
	        return result;
	    };
	}
	
	module.exports = getTag;

/***/ },
/* 89 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var getNative = __webpack_require__(90),
	    root = __webpack_require__(54);
	
	/* Built-in method references that are verified to be native. */
	var DataView = getNative(root, 'DataView');
	
	module.exports = DataView;

/***/ },
/* 90 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseIsNative = __webpack_require__(91),
	    getValue = __webpack_require__(95);
	
	/**
	 * Gets the native function at `key` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the method to get.
	 * @returns {*} Returns the function if it's native, else `undefined`.
	 */
	function getNative(object, key) {
	  var value = getValue(object, key);
	  return baseIsNative(value) ? value : undefined;
	}
	
	module.exports = getNative;

/***/ },
/* 91 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var isFunction = __webpack_require__(51),
	    isMasked = __webpack_require__(92),
	    isObject = __webpack_require__(58),
	    toSource = __webpack_require__(94);
	
	/**
	 * Used to match `RegExp`
	 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
	 */
	var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
	
	/** Used to detect host constructors (Safari). */
	var reIsHostCtor = /^\[object .+?Constructor\]$/;
	
	/** Used for built-in method references. */
	var funcProto = Function.prototype,
	    objectProto = Object.prototype;
	
	/** Used to resolve the decompiled source of functions. */
	var funcToString = funcProto.toString;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/** Used to detect if a method is native. */
	var reIsNative = RegExp('^' + funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&').replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$');
	
	/**
	 * The base implementation of `_.isNative` without bad shim checks.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a native function,
	 *  else `false`.
	 */
	function baseIsNative(value) {
	  if (!isObject(value) || isMasked(value)) {
	    return false;
	  }
	  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
	  return pattern.test(toSource(value));
	}
	
	module.exports = baseIsNative;

/***/ },
/* 92 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var coreJsData = __webpack_require__(93);
	
	/** Used to detect methods masquerading as native. */
	var maskSrcKey = function () {
	  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
	  return uid ? 'Symbol(src)_1.' + uid : '';
	}();
	
	/**
	 * Checks if `func` has its source masked.
	 *
	 * @private
	 * @param {Function} func The function to check.
	 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
	 */
	function isMasked(func) {
	  return !!maskSrcKey && maskSrcKey in func;
	}
	
	module.exports = isMasked;

/***/ },
/* 93 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var root = __webpack_require__(54);
	
	/** Used to detect overreaching core-js shims. */
	var coreJsData = root['__core-js_shared__'];
	
	module.exports = coreJsData;

/***/ },
/* 94 */
/***/ function(module, exports) {

	'use strict';
	
	/** Used for built-in method references. */
	var funcProto = Function.prototype;
	
	/** Used to resolve the decompiled source of functions. */
	var funcToString = funcProto.toString;
	
	/**
	 * Converts `func` to its source code.
	 *
	 * @private
	 * @param {Function} func The function to convert.
	 * @returns {string} Returns the source code.
	 */
	function toSource(func) {
	  if (func != null) {
	    try {
	      return funcToString.call(func);
	    } catch (e) {}
	    try {
	      return func + '';
	    } catch (e) {}
	  }
	  return '';
	}
	
	module.exports = toSource;

/***/ },
/* 95 */
/***/ function(module, exports) {

	"use strict";
	
	/**
	 * Gets the value at `key` of `object`.
	 *
	 * @private
	 * @param {Object} [object] The object to query.
	 * @param {string} key The key of the property to get.
	 * @returns {*} Returns the property value.
	 */
	function getValue(object, key) {
	  return object == null ? undefined : object[key];
	}
	
	module.exports = getValue;

/***/ },
/* 96 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var getNative = __webpack_require__(90),
	    root = __webpack_require__(54);
	
	/* Built-in method references that are verified to be native. */
	var Map = getNative(root, 'Map');
	
	module.exports = Map;

/***/ },
/* 97 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var getNative = __webpack_require__(90),
	    root = __webpack_require__(54);
	
	/* Built-in method references that are verified to be native. */
	var Promise = getNative(root, 'Promise');
	
	module.exports = Promise;

/***/ },
/* 98 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var getNative = __webpack_require__(90),
	    root = __webpack_require__(54);
	
	/* Built-in method references that are verified to be native. */
	var Set = getNative(root, 'Set');
	
	module.exports = Set;

/***/ },
/* 99 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var getNative = __webpack_require__(90),
	    root = __webpack_require__(54);
	
	/* Built-in method references that are verified to be native. */
	var WeakMap = getNative(root, 'WeakMap');
	
	module.exports = WeakMap;

/***/ },
/* 100 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", { value: true });
	var in_clause_under_conjunction_plugin_1 = __webpack_require__(101);
	var head = __webpack_require__(103);
	function getAppropriatePlugin(fileReader, basePath, queryParam, datapackage) {
	    var plugins = [new in_clause_under_conjunction_plugin_1.InClauseUnderConjunctionPlugin(fileReader, basePath, queryParam, datapackage)];
	    return head(plugins.filter(function (plugin) {
	        return plugin.isMatched();
	    }));
	}
	exports.getAppropriatePlugin = getAppropriatePlugin;
	//# sourceMappingURL=index.js.map

/***/ },
/* 101 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	Object.defineProperty(exports, "__esModule", { value: true });
	var path = __webpack_require__(102);
	var head = __webpack_require__(103);
	var values = __webpack_require__(67);
	var keys = __webpack_require__(70);
	var get = __webpack_require__(104);
	var flattenDeep = __webpack_require__(137);
	var isEmpty = __webpack_require__(87);
	var startsWith = __webpack_require__(141);
	var includes = __webpack_require__(45);
	var compact = __webpack_require__(143);
	var Papa = __webpack_require__(144);
	var WHERE_KEYWORD = 'where';
	var JOIN_KEYWORD = 'join';
	var KEY_IN = '$in';
	var KEY_AND = '$and';
	var getFirstConditionClause = function getFirstConditionClause(clause) {
	    return head(values(clause));
	};
	var getFirstKey = function getFirstKey(obj) {
	    return head(keys(obj));
	};
	var isOneKeyBased = function isOneKeyBased(obj) {
	    return keys(obj).length === 1;
	};
	
	var InClauseUnderConjunctionPlugin = function () {
	    function InClauseUnderConjunctionPlugin(fileReader, basePath, query, datapackage) {
	        _classCallCheck(this, InClauseUnderConjunctionPlugin);
	
	        this.fileReader = fileReader;
	        this.basePath = basePath;
	        this.query = query;
	        this.datapackage = datapackage;
	        this.flow = {};
	    }
	
	    _createClass(InClauseUnderConjunctionPlugin, [{
	        key: "isMatched",
	        value: function isMatched() {
	            this.flow.joinObject = get(this.query, JOIN_KEYWORD);
	            var mainAndClause = get(this.query, WHERE_KEYWORD);
	            var isMainAndClauseCorrect = isOneKeyBased(mainAndClause);
	            var joinKeys = keys(this.flow.joinObject);
	            var areJoinKeysSameAsKeyInWhereClause = true;
	            var _iteratorNormalCompletion = true;
	            var _didIteratorError = false;
	            var _iteratorError = undefined;
	
	            try {
	                for (var _iterator = joinKeys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	                    var key = _step.value;
	
	                    var joinPart = this.flow.joinObject[key];
	                    var firstKey = getFirstKey(joinPart.where);
	                    if (joinPart.key !== firstKey && firstKey !== KEY_AND) {
	                        areJoinKeysSameAsKeyInWhereClause = false;
	                        break;
	                    }
	                }
	            } catch (err) {
	                _didIteratorError = true;
	                _iteratorError = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion && _iterator.return) {
	                        _iterator.return();
	                    }
	                } finally {
	                    if (_didIteratorError) {
	                        throw _iteratorError;
	                    }
	                }
	            }
	
	            return isMainAndClauseCorrect && !!this.flow.joinObject && areJoinKeysSameAsKeyInWhereClause;
	        }
	    }, {
	        key: "getOptimalFilesSet",
	        value: function getOptimalFilesSet() {
	            var _this = this;
	
	            return new Promise(function (resolve, reject) {
	                if (_this.isMatched()) {
	                    _this.fillResourceToFileHash().collectProcessableClauses().collectEntityFilesNames().collectEntities().then(function (data) {
	                        var result = _this.fillEntityValuesHash(data).getFilesGroupsQueryClause().getOptimalFilesGroup();
	                        resolve(result);
	                    }).catch(function (err) {
	                        return reject(err);
	                    });
	                } else {
	                    reject("Plugin \"InClauseUnderConjunction\" is not matched!");
	                }
	            });
	        }
	    }, {
	        key: "fillResourceToFileHash",
	        value: function fillResourceToFileHash() {
	            this.flow.resourceToFile = this.datapackage.resources.reduce(function (hash, resource) {
	                hash.set(resource.name, resource.path);
	                return hash;
	            }, new Map());
	            return this;
	        }
	    }, {
	        key: "collectProcessableClauses",
	        value: function collectProcessableClauses() {
	            var _this2 = this;
	
	            var joinKeys = keys(this.flow.joinObject);
	            this.flow.processableClauses = [];
	            var _iteratorNormalCompletion2 = true;
	            var _didIteratorError2 = false;
	            var _iteratorError2 = undefined;
	
	            try {
	                for (var _iterator2 = joinKeys[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	                    var joinKey = _step2.value;
	
	                    var where = get(this.flow.joinObject[joinKey], WHERE_KEYWORD);
	                    if (this.singleAndField(where)) {
	                        var _flow$processableClau;
	
	                        (_flow$processableClau = this.flow.processableClauses).push.apply(_flow$processableClau, _toConsumableArray(flattenDeep(where.$and.map(function (el) {
	                            return _this2.getProcessableClauses(el);
	                        }))));
	                    } else {
	                        var _flow$processableClau2;
	
	                        (_flow$processableClau2 = this.flow.processableClauses).push.apply(_flow$processableClau2, _toConsumableArray(this.getProcessableClauses(where)));
	                    }
	                }
	            } catch (err) {
	                _didIteratorError2 = true;
	                _iteratorError2 = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
	                        _iterator2.return();
	                    }
	                } finally {
	                    if (_didIteratorError2) {
	                        throw _iteratorError2;
	                    }
	                }
	            }
	
	            return this;
	        }
	    }, {
	        key: "collectEntityFilesNames",
	        value: function collectEntityFilesNames() {
	            this.flow.entityFilesNames = [];
	            this.flow.fileNameToPrimaryKeyHash = new Map();
	            var _iteratorNormalCompletion3 = true;
	            var _didIteratorError3 = false;
	            var _iteratorError3 = undefined;
	
	            try {
	                for (var _iterator3 = this.datapackage.ddfSchema.entities[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
	                    var schemaResourceRecord = _step3.value;
	                    var _iteratorNormalCompletion4 = true;
	                    var _didIteratorError4 = false;
	                    var _iteratorError4 = undefined;
	
	                    try {
	                        for (var _iterator4 = this.flow.processableClauses[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
	                            var clause = _step4.value;
	
	                            var primaryKey = getFirstKey(clause);
	                            if (head(schemaResourceRecord.primaryKey) === primaryKey) {
	                                var _iteratorNormalCompletion5 = true;
	                                var _didIteratorError5 = false;
	                                var _iteratorError5 = undefined;
	
	                                try {
	                                    for (var _iterator5 = schemaResourceRecord.resources[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
	                                        var resourceName = _step5.value;
	
	                                        var file = this.flow.resourceToFile.get(resourceName);
	                                        this.flow.entityFilesNames.push(file);
	                                        this.flow.fileNameToPrimaryKeyHash.set(file, primaryKey);
	                                    }
	                                } catch (err) {
	                                    _didIteratorError5 = true;
	                                    _iteratorError5 = err;
	                                } finally {
	                                    try {
	                                        if (!_iteratorNormalCompletion5 && _iterator5.return) {
	                                            _iterator5.return();
	                                        }
	                                    } finally {
	                                        if (_didIteratorError5) {
	                                            throw _iteratorError5;
	                                        }
	                                    }
	                                }
	                            }
	                        }
	                    } catch (err) {
	                        _didIteratorError4 = true;
	                        _iteratorError4 = err;
	                    } finally {
	                        try {
	                            if (!_iteratorNormalCompletion4 && _iterator4.return) {
	                                _iterator4.return();
	                            }
	                        } finally {
	                            if (_didIteratorError4) {
	                                throw _iteratorError4;
	                            }
	                        }
	                    }
	                }
	            } catch (err) {
	                _didIteratorError3 = true;
	                _iteratorError3 = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
	                        _iterator3.return();
	                    }
	                } finally {
	                    if (_didIteratorError3) {
	                        throw _iteratorError3;
	                    }
	                }
	            }
	
	            return this;
	        }
	    }, {
	        key: "collectEntities",
	        value: function collectEntities() {
	            var _this3 = this;
	
	            var actions = this.flow.entityFilesNames.map(function (file) {
	                return new Promise(function (actResolve, actReject) {
	                    _this3.fileReader.readText(path.resolve(_this3.basePath, file), function (err, text) {
	                        if (err) {
	                            return actReject(err);
	                        }
	                        Papa.parse(text, {
	                            header: true,
	                            skipEmptyLines: true,
	                            complete: function complete(result) {
	                                return actResolve({ file: file, result: result });
	                            },
	                            error: function error(_error) {
	                                return actReject(_error);
	                            }
	                        });
	                    });
	                });
	            });
	            return Promise.all(actions);
	        }
	    }, {
	        key: "fillEntityValuesHash",
	        value: function fillEntityValuesHash(entitiesData) {
	            var getSubdomainsFromRecord = function getSubdomainsFromRecord(record) {
	                return compact(keys(record).filter(function (key) {
	                    return startsWith(key, 'is--') && (record[key] === 'TRUE' || record[key] === 'true');
	                }).map(function (key) {
	                    return key.replace(/^is--/, '');
	                }));
	            };
	            this.flow.entityValueToFileHash = new Map();
	            this.flow.entityValueToDomainHash = new Map();
	            var _iteratorNormalCompletion6 = true;
	            var _didIteratorError6 = false;
	            var _iteratorError6 = undefined;
	
	            try {
	                for (var _iterator6 = entitiesData[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
	                    var entityFileDescriptor = _step6.value;
	                    var _iteratorNormalCompletion7 = true;
	                    var _didIteratorError7 = false;
	                    var _iteratorError7 = undefined;
	
	                    try {
	                        for (var _iterator7 = entityFileDescriptor.result.data[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
	                            var entityRecord = _step7.value;
	
	                            var primaryKeyForThisFile = this.flow.fileNameToPrimaryKeyHash.get(entityFileDescriptor.file);
	                            var primaryKeyCellValue = entityRecord[primaryKeyForThisFile];
	                            var domainsForCurrentRecord = [].concat(_toConsumableArray(getSubdomainsFromRecord(entityRecord)));
	                            if (isEmpty(domainsForCurrentRecord)) {
	                                domainsForCurrentRecord.push(primaryKeyForThisFile);
	                            }
	                            this.flow.entityValueToDomainHash.set(primaryKeyCellValue, domainsForCurrentRecord);
	                            this.flow.entityValueToFileHash.set(primaryKeyCellValue, entityFileDescriptor.file);
	                        }
	                    } catch (err) {
	                        _didIteratorError7 = true;
	                        _iteratorError7 = err;
	                    } finally {
	                        try {
	                            if (!_iteratorNormalCompletion7 && _iterator7.return) {
	                                _iterator7.return();
	                            }
	                        } finally {
	                            if (_didIteratorError7) {
	                                throw _iteratorError7;
	                            }
	                        }
	                    }
	                }
	            } catch (err) {
	                _didIteratorError6 = true;
	                _iteratorError6 = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion6 && _iterator6.return) {
	                        _iterator6.return();
	                    }
	                } finally {
	                    if (_didIteratorError6) {
	                        throw _iteratorError6;
	                    }
	                }
	            }
	
	            return this;
	        }
	    }, {
	        key: "getFilesGroupsQueryClause",
	        value: function getFilesGroupsQueryClause() {
	            var filesGroupsByClause = new Map();
	            var _iteratorNormalCompletion8 = true;
	            var _didIteratorError8 = false;
	            var _iteratorError8 = undefined;
	
	            try {
	                for (var _iterator8 = this.flow.processableClauses[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
	                    var clause = _step8.value;
	
	                    var filesGroupByClause = {
	                        entities: new Set(),
	                        datapoints: new Set(),
	                        concepts: new Set()
	                    };
	                    var entityValuesFromClause = getFirstConditionClause(clause).$in;
	                    var _iteratorNormalCompletion9 = true;
	                    var _didIteratorError9 = false;
	                    var _iteratorError9 = undefined;
	
	                    try {
	                        for (var _iterator9 = entityValuesFromClause[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
	                            var entityValueFromClause = _step9.value;
	
	                            filesGroupByClause.entities.add(this.flow.entityValueToFileHash.get(entityValueFromClause));
	                            var entitiesByQuery = this.flow.entityValueToDomainHash.get(entityValueFromClause);
	                            var _iteratorNormalCompletion11 = true;
	                            var _didIteratorError11 = false;
	                            var _iteratorError11 = undefined;
	
	                            try {
	                                for (var _iterator11 = entitiesByQuery[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
	                                    var entityByQuery = _step11.value;
	                                    var _iteratorNormalCompletion12 = true;
	                                    var _didIteratorError12 = false;
	                                    var _iteratorError12 = undefined;
	
	                                    try {
	                                        for (var _iterator12 = this.datapackage.ddfSchema.datapoints[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
	                                            var schemaResourceRecord = _step12.value;
	                                            var _iteratorNormalCompletion13 = true;
	                                            var _didIteratorError13 = false;
	                                            var _iteratorError13 = undefined;
	
	                                            try {
	                                                for (var _iterator13 = schemaResourceRecord.resources[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
	                                                    var resourceName = _step13.value;
	
	                                                    if (includes(schemaResourceRecord.primaryKey, entityByQuery)) {
	                                                        filesGroupByClause.datapoints.add(this.flow.resourceToFile.get(resourceName));
	                                                    }
	                                                }
	                                            } catch (err) {
	                                                _didIteratorError13 = true;
	                                                _iteratorError13 = err;
	                                            } finally {
	                                                try {
	                                                    if (!_iteratorNormalCompletion13 && _iterator13.return) {
	                                                        _iterator13.return();
	                                                    }
	                                                } finally {
	                                                    if (_didIteratorError13) {
	                                                        throw _iteratorError13;
	                                                    }
	                                                }
	                                            }
	                                        }
	                                    } catch (err) {
	                                        _didIteratorError12 = true;
	                                        _iteratorError12 = err;
	                                    } finally {
	                                        try {
	                                            if (!_iteratorNormalCompletion12 && _iterator12.return) {
	                                                _iterator12.return();
	                                            }
	                                        } finally {
	                                            if (_didIteratorError12) {
	                                                throw _iteratorError12;
	                                            }
	                                        }
	                                    }
	                                }
	                            } catch (err) {
	                                _didIteratorError11 = true;
	                                _iteratorError11 = err;
	                            } finally {
	                                try {
	                                    if (!_iteratorNormalCompletion11 && _iterator11.return) {
	                                        _iterator11.return();
	                                    }
	                                } finally {
	                                    if (_didIteratorError11) {
	                                        throw _iteratorError11;
	                                    }
	                                }
	                            }
	                        }
	                    } catch (err) {
	                        _didIteratorError9 = true;
	                        _iteratorError9 = err;
	                    } finally {
	                        try {
	                            if (!_iteratorNormalCompletion9 && _iterator9.return) {
	                                _iterator9.return();
	                            }
	                        } finally {
	                            if (_didIteratorError9) {
	                                throw _iteratorError9;
	                            }
	                        }
	                    }
	
	                    var _iteratorNormalCompletion10 = true;
	                    var _didIteratorError10 = false;
	                    var _iteratorError10 = undefined;
	
	                    try {
	                        for (var _iterator10 = this.datapackage.ddfSchema.concepts[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
	                            var _schemaResourceRecord = _step10.value;
	                            var _iteratorNormalCompletion14 = true;
	                            var _didIteratorError14 = false;
	                            var _iteratorError14 = undefined;
	
	                            try {
	                                for (var _iterator14 = _schemaResourceRecord.resources[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
	                                    var _resourceName = _step14.value;
	
	                                    filesGroupByClause.concepts.add(this.flow.resourceToFile.get(_resourceName));
	                                }
	                            } catch (err) {
	                                _didIteratorError14 = true;
	                                _iteratorError14 = err;
	                            } finally {
	                                try {
	                                    if (!_iteratorNormalCompletion14 && _iterator14.return) {
	                                        _iterator14.return();
	                                    }
	                                } finally {
	                                    if (_didIteratorError14) {
	                                        throw _iteratorError14;
	                                    }
	                                }
	                            }
	                        }
	                    } catch (err) {
	                        _didIteratorError10 = true;
	                        _iteratorError10 = err;
	                    } finally {
	                        try {
	                            if (!_iteratorNormalCompletion10 && _iterator10.return) {
	                                _iterator10.return();
	                            }
	                        } finally {
	                            if (_didIteratorError10) {
	                                throw _iteratorError10;
	                            }
	                        }
	                    }
	
	                    filesGroupsByClause.set(clause, filesGroupByClause);
	                }
	            } catch (err) {
	                _didIteratorError8 = true;
	                _iteratorError8 = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion8 && _iterator8.return) {
	                        _iterator8.return();
	                    }
	                } finally {
	                    if (_didIteratorError8) {
	                        throw _iteratorError8;
	                    }
	                }
	            }
	
	            this.flow.filesGroupsByClause = filesGroupsByClause;
	            return this;
	        }
	    }, {
	        key: "getOptimalFilesGroup",
	        value: function getOptimalFilesGroup() {
	            var clauseKeys = this.flow.filesGroupsByClause.keys();
	            var appropriateClauseKey = void 0;
	            var appropriateClauseSize = void 0;
	            var _iteratorNormalCompletion15 = true;
	            var _didIteratorError15 = false;
	            var _iteratorError15 = undefined;
	
	            try {
	                for (var _iterator15 = clauseKeys[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
	                    var key = _step15.value;
	
	                    var size = this.flow.filesGroupsByClause.get(key).datapoints.size + this.flow.filesGroupsByClause.get(key).entities.size + this.flow.filesGroupsByClause.get(key).concepts.size;
	                    if (!appropriateClauseKey || size < appropriateClauseSize) {
	                        appropriateClauseKey = key;
	                        appropriateClauseSize = size;
	                    }
	                }
	            } catch (err) {
	                _didIteratorError15 = true;
	                _iteratorError15 = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion15 && _iterator15.return) {
	                        _iterator15.return();
	                    }
	                } finally {
	                    if (_didIteratorError15) {
	                        throw _iteratorError15;
	                    }
	                }
	            }
	
	            return [].concat(_toConsumableArray(Array.from(this.flow.filesGroupsByClause.get(appropriateClauseKey).concepts)), _toConsumableArray(Array.from(this.flow.filesGroupsByClause.get(appropriateClauseKey).entities)), _toConsumableArray(Array.from(this.flow.filesGroupsByClause.get(appropriateClauseKey).datapoints)));
	        }
	    }, {
	        key: "getProcessableClauses",
	        value: function getProcessableClauses(clause) {
	            var result = [];
	            var clauseKeys = keys(clause);
	            var _iteratorNormalCompletion16 = true;
	            var _didIteratorError16 = false;
	            var _iteratorError16 = undefined;
	
	            try {
	                for (var _iterator16 = clauseKeys[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
	                    var key = _step16.value;
	
	                    if (!startsWith(key, '$') && isOneKeyBased(clause[key])) {
	                        var conditionKey = head(keys(clause[key]));
	                        if (conditionKey === KEY_IN) {
	                            result.push(clause);
	                        }
	                    }
	                }
	            } catch (err) {
	                _didIteratorError16 = true;
	                _iteratorError16 = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion16 && _iterator16.return) {
	                        _iterator16.return();
	                    }
	                } finally {
	                    if (_didIteratorError16) {
	                        throw _iteratorError16;
	                    }
	                }
	            }
	
	            return result;
	        }
	    }, {
	        key: "singleAndField",
	        value: function singleAndField(clause) {
	            return isOneKeyBased(clause) && !!get(clause, KEY_AND);
	        }
	    }]);
	
	    return InClauseUnderConjunctionPlugin;
	}();
	
	exports.InClauseUnderConjunctionPlugin = InClauseUnderConjunctionPlugin;
	//# sourceMappingURL=in-clause-under-conjunction-plugin.js.map

/***/ },
/* 102 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	// resolves . and .. elements in a path array with directory names there
	// must be no slashes, empty elements, or device names (c:\) in the array
	// (so also no leading and trailing slashes - it does not distinguish
	// relative and absolute paths)
	function normalizeArray(parts, allowAboveRoot) {
	  // if the path tries to go above the root, `up` ends up > 0
	  var up = 0;
	  for (var i = parts.length - 1; i >= 0; i--) {
	    var last = parts[i];
	    if (last === '.') {
	      parts.splice(i, 1);
	    } else if (last === '..') {
	      parts.splice(i, 1);
	      up++;
	    } else if (up) {
	      parts.splice(i, 1);
	      up--;
	    }
	  }
	
	  // if the path is allowed to go above the root, restore leading ..s
	  if (allowAboveRoot) {
	    for (; up--; up) {
	      parts.unshift('..');
	    }
	  }
	
	  return parts;
	}
	
	// Split a filename into [root, dir, basename, ext], unix version
	// 'root' is just a slash, or nothing.
	var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
	var splitPath = function splitPath(filename) {
	  return splitPathRe.exec(filename).slice(1);
	};
	
	// path.resolve([from ...], to)
	// posix version
	exports.resolve = function () {
	  var resolvedPath = '',
	      resolvedAbsolute = false;
	
	  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
	    var path = i >= 0 ? arguments[i] : process.cwd();
	
	    // Skip empty and invalid entries
	    if (typeof path !== 'string') {
	      throw new TypeError('Arguments to path.resolve must be strings');
	    } else if (!path) {
	      continue;
	    }
	
	    resolvedPath = path + '/' + resolvedPath;
	    resolvedAbsolute = path.charAt(0) === '/';
	  }
	
	  // At this point the path should be resolved to a full absolute path, but
	  // handle relative paths to be safe (might happen when process.cwd() fails)
	
	  // Normalize the path
	  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function (p) {
	    return !!p;
	  }), !resolvedAbsolute).join('/');
	
	  return (resolvedAbsolute ? '/' : '') + resolvedPath || '.';
	};
	
	// path.normalize(path)
	// posix version
	exports.normalize = function (path) {
	  var isAbsolute = exports.isAbsolute(path),
	      trailingSlash = substr(path, -1) === '/';
	
	  // Normalize the path
	  path = normalizeArray(filter(path.split('/'), function (p) {
	    return !!p;
	  }), !isAbsolute).join('/');
	
	  if (!path && !isAbsolute) {
	    path = '.';
	  }
	  if (path && trailingSlash) {
	    path += '/';
	  }
	
	  return (isAbsolute ? '/' : '') + path;
	};
	
	// posix version
	exports.isAbsolute = function (path) {
	  return path.charAt(0) === '/';
	};
	
	// posix version
	exports.join = function () {
	  var paths = Array.prototype.slice.call(arguments, 0);
	  return exports.normalize(filter(paths, function (p, index) {
	    if (typeof p !== 'string') {
	      throw new TypeError('Arguments to path.join must be strings');
	    }
	    return p;
	  }).join('/'));
	};
	
	// path.relative(from, to)
	// posix version
	exports.relative = function (from, to) {
	  from = exports.resolve(from).substr(1);
	  to = exports.resolve(to).substr(1);
	
	  function trim(arr) {
	    var start = 0;
	    for (; start < arr.length; start++) {
	      if (arr[start] !== '') break;
	    }
	
	    var end = arr.length - 1;
	    for (; end >= 0; end--) {
	      if (arr[end] !== '') break;
	    }
	
	    if (start > end) return [];
	    return arr.slice(start, end - start + 1);
	  }
	
	  var fromParts = trim(from.split('/'));
	  var toParts = trim(to.split('/'));
	
	  var length = Math.min(fromParts.length, toParts.length);
	  var samePartsLength = length;
	  for (var i = 0; i < length; i++) {
	    if (fromParts[i] !== toParts[i]) {
	      samePartsLength = i;
	      break;
	    }
	  }
	
	  var outputParts = [];
	  for (var i = samePartsLength; i < fromParts.length; i++) {
	    outputParts.push('..');
	  }
	
	  outputParts = outputParts.concat(toParts.slice(samePartsLength));
	
	  return outputParts.join('/');
	};
	
	exports.sep = '/';
	exports.delimiter = ':';
	
	exports.dirname = function (path) {
	  var result = splitPath(path),
	      root = result[0],
	      dir = result[1];
	
	  if (!root && !dir) {
	    // No dirname whatsoever
	    return '.';
	  }
	
	  if (dir) {
	    // It has a dirname, strip trailing slash
	    dir = dir.substr(0, dir.length - 1);
	  }
	
	  return root + dir;
	};
	
	exports.basename = function (path, ext) {
	  var f = splitPath(path)[2];
	  // TODO: make this comparison case-insensitive on windows?
	  if (ext && f.substr(-1 * ext.length) === ext) {
	    f = f.substr(0, f.length - ext.length);
	  }
	  return f;
	};
	
	exports.extname = function (path) {
	  return splitPath(path)[3];
	};
	
	function filter(xs, f) {
	  if (xs.filter) return xs.filter(f);
	  var res = [];
	  for (var i = 0; i < xs.length; i++) {
	    if (f(xs[i], i, xs)) res.push(xs[i]);
	  }
	  return res;
	}
	
	// String.prototype.substr - negative index don't work in IE8
	var substr = 'ab'.substr(-1) === 'b' ? function (str, start, len) {
	  return str.substr(start, len);
	} : function (str, start, len) {
	  if (start < 0) start = str.length + start;
	  return str.substr(start, len);
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ },
/* 103 */
/***/ function(module, exports) {

	"use strict";
	
	/**
	 * Gets the first element of `array`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @alias first
	 * @category Array
	 * @param {Array} array The array to query.
	 * @returns {*} Returns the first element of `array`.
	 * @example
	 *
	 * _.head([1, 2, 3]);
	 * // => 1
	 *
	 * _.head([]);
	 * // => undefined
	 */
	function head(array) {
	  return array && array.length ? array[0] : undefined;
	}
	
	module.exports = head;

/***/ },
/* 104 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseGet = __webpack_require__(105);
	
	/**
	 * Gets the value at `path` of `object`. If the resolved value is
	 * `undefined`, the `defaultValue` is returned in its place.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.7.0
	 * @category Object
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path of the property to get.
	 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
	 * @returns {*} Returns the resolved value.
	 * @example
	 *
	 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
	 *
	 * _.get(object, 'a[0].b.c');
	 * // => 3
	 *
	 * _.get(object, ['a', '0', 'b', 'c']);
	 * // => 3
	 *
	 * _.get(object, 'a.b.c', 'default');
	 * // => 'default'
	 */
	function get(object, path, defaultValue) {
	  var result = object == null ? undefined : baseGet(object, path);
	  return result === undefined ? defaultValue : result;
	}
	
	module.exports = get;

/***/ },
/* 105 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var castPath = __webpack_require__(106),
	    toKey = __webpack_require__(136);
	
	/**
	 * The base implementation of `_.get` without support for default values.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path of the property to get.
	 * @returns {*} Returns the resolved value.
	 */
	function baseGet(object, path) {
	  path = castPath(path, object);
	
	  var index = 0,
	      length = path.length;
	
	  while (object != null && index < length) {
	    object = object[toKey(path[index++])];
	  }
	  return index && index == length ? object : undefined;
	}
	
	module.exports = baseGet;

/***/ },
/* 106 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var isArray = __webpack_require__(61),
	    isKey = __webpack_require__(107),
	    stringToPath = __webpack_require__(108),
	    toString = __webpack_require__(134);
	
	/**
	 * Casts `value` to a path array if it's not one.
	 *
	 * @private
	 * @param {*} value The value to inspect.
	 * @param {Object} [object] The object to query keys on.
	 * @returns {Array} Returns the cast property path array.
	 */
	function castPath(value, object) {
	  if (isArray(value)) {
	    return value;
	  }
	  return isKey(value, object) ? [value] : stringToPath(toString(value));
	}
	
	module.exports = castPath;

/***/ },
/* 107 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var isArray = __webpack_require__(61),
	    isSymbol = __webpack_require__(66);
	
	/** Used to match property names within property paths. */
	var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
	    reIsPlainProp = /^\w*$/;
	
	/**
	 * Checks if `value` is a property name and not a property path.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {Object} [object] The object to query keys on.
	 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
	 */
	function isKey(value, object) {
	  if (isArray(value)) {
	    return false;
	  }
	  var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);
	  if (type == 'number' || type == 'symbol' || type == 'boolean' || value == null || isSymbol(value)) {
	    return true;
	  }
	  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
	}
	
	module.exports = isKey;

/***/ },
/* 108 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var memoizeCapped = __webpack_require__(109);
	
	/** Used to match property names within property paths. */
	var reLeadingDot = /^\./,
	    rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
	
	/** Used to match backslashes in property paths. */
	var reEscapeChar = /\\(\\)?/g;
	
	/**
	 * Converts `string` to a property path array.
	 *
	 * @private
	 * @param {string} string The string to convert.
	 * @returns {Array} Returns the property path array.
	 */
	var stringToPath = memoizeCapped(function (string) {
	  var result = [];
	  if (reLeadingDot.test(string)) {
	    result.push('');
	  }
	  string.replace(rePropName, function (match, number, quote, string) {
	    result.push(quote ? string.replace(reEscapeChar, '$1') : number || match);
	  });
	  return result;
	});
	
	module.exports = stringToPath;

/***/ },
/* 109 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var memoize = __webpack_require__(110);
	
	/** Used as the maximum memoize cache size. */
	var MAX_MEMOIZE_SIZE = 500;
	
	/**
	 * A specialized version of `_.memoize` which clears the memoized function's
	 * cache when it exceeds `MAX_MEMOIZE_SIZE`.
	 *
	 * @private
	 * @param {Function} func The function to have its output memoized.
	 * @returns {Function} Returns the new memoized function.
	 */
	function memoizeCapped(func) {
	  var result = memoize(func, function (key) {
	    if (cache.size === MAX_MEMOIZE_SIZE) {
	      cache.clear();
	    }
	    return key;
	  });
	
	  var cache = result.cache;
	  return result;
	}
	
	module.exports = memoizeCapped;

/***/ },
/* 110 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var MapCache = __webpack_require__(111);
	
	/** Error message constants. */
	var FUNC_ERROR_TEXT = 'Expected a function';
	
	/**
	 * Creates a function that memoizes the result of `func`. If `resolver` is
	 * provided, it determines the cache key for storing the result based on the
	 * arguments provided to the memoized function. By default, the first argument
	 * provided to the memoized function is used as the map cache key. The `func`
	 * is invoked with the `this` binding of the memoized function.
	 *
	 * **Note:** The cache is exposed as the `cache` property on the memoized
	 * function. Its creation may be customized by replacing the `_.memoize.Cache`
	 * constructor with one whose instances implement the
	 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
	 * method interface of `clear`, `delete`, `get`, `has`, and `set`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Function
	 * @param {Function} func The function to have its output memoized.
	 * @param {Function} [resolver] The function to resolve the cache key.
	 * @returns {Function} Returns the new memoized function.
	 * @example
	 *
	 * var object = { 'a': 1, 'b': 2 };
	 * var other = { 'c': 3, 'd': 4 };
	 *
	 * var values = _.memoize(_.values);
	 * values(object);
	 * // => [1, 2]
	 *
	 * values(other);
	 * // => [3, 4]
	 *
	 * object.a = 2;
	 * values(object);
	 * // => [1, 2]
	 *
	 * // Modify the result cache.
	 * values.cache.set(object, ['a', 'b']);
	 * values(object);
	 * // => ['a', 'b']
	 *
	 * // Replace `_.memoize.Cache`.
	 * _.memoize.Cache = WeakMap;
	 */
	function memoize(func, resolver) {
	  if (typeof func != 'function' || resolver != null && typeof resolver != 'function') {
	    throw new TypeError(FUNC_ERROR_TEXT);
	  }
	  var memoized = function memoized() {
	    var args = arguments,
	        key = resolver ? resolver.apply(this, args) : args[0],
	        cache = memoized.cache;
	
	    if (cache.has(key)) {
	      return cache.get(key);
	    }
	    var result = func.apply(this, args);
	    memoized.cache = cache.set(key, result) || cache;
	    return result;
	  };
	  memoized.cache = new (memoize.Cache || MapCache)();
	  return memoized;
	}
	
	// Expose `MapCache`.
	memoize.Cache = MapCache;
	
	module.exports = memoize;

/***/ },
/* 111 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var mapCacheClear = __webpack_require__(112),
	    mapCacheDelete = __webpack_require__(128),
	    mapCacheGet = __webpack_require__(131),
	    mapCacheHas = __webpack_require__(132),
	    mapCacheSet = __webpack_require__(133);
	
	/**
	 * Creates a map cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function MapCache(entries) {
	    var index = -1,
	        length = entries == null ? 0 : entries.length;
	
	    this.clear();
	    while (++index < length) {
	        var entry = entries[index];
	        this.set(entry[0], entry[1]);
	    }
	}
	
	// Add methods to `MapCache`.
	MapCache.prototype.clear = mapCacheClear;
	MapCache.prototype['delete'] = mapCacheDelete;
	MapCache.prototype.get = mapCacheGet;
	MapCache.prototype.has = mapCacheHas;
	MapCache.prototype.set = mapCacheSet;
	
	module.exports = MapCache;

/***/ },
/* 112 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Hash = __webpack_require__(113),
	    ListCache = __webpack_require__(120),
	    Map = __webpack_require__(96);
	
	/**
	 * Removes all key-value entries from the map.
	 *
	 * @private
	 * @name clear
	 * @memberOf MapCache
	 */
	function mapCacheClear() {
	  this.size = 0;
	  this.__data__ = {
	    'hash': new Hash(),
	    'map': new (Map || ListCache)(),
	    'string': new Hash()
	  };
	}
	
	module.exports = mapCacheClear;

/***/ },
/* 113 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var hashClear = __webpack_require__(114),
	    hashDelete = __webpack_require__(116),
	    hashGet = __webpack_require__(117),
	    hashHas = __webpack_require__(118),
	    hashSet = __webpack_require__(119);
	
	/**
	 * Creates a hash object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function Hash(entries) {
	    var index = -1,
	        length = entries == null ? 0 : entries.length;
	
	    this.clear();
	    while (++index < length) {
	        var entry = entries[index];
	        this.set(entry[0], entry[1]);
	    }
	}
	
	// Add methods to `Hash`.
	Hash.prototype.clear = hashClear;
	Hash.prototype['delete'] = hashDelete;
	Hash.prototype.get = hashGet;
	Hash.prototype.has = hashHas;
	Hash.prototype.set = hashSet;
	
	module.exports = Hash;

/***/ },
/* 114 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var nativeCreate = __webpack_require__(115);
	
	/**
	 * Removes all key-value entries from the hash.
	 *
	 * @private
	 * @name clear
	 * @memberOf Hash
	 */
	function hashClear() {
	  this.__data__ = nativeCreate ? nativeCreate(null) : {};
	  this.size = 0;
	}
	
	module.exports = hashClear;

/***/ },
/* 115 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var getNative = __webpack_require__(90);
	
	/* Built-in method references that are verified to be native. */
	var nativeCreate = getNative(Object, 'create');
	
	module.exports = nativeCreate;

/***/ },
/* 116 */
/***/ function(module, exports) {

	"use strict";
	
	/**
	 * Removes `key` and its value from the hash.
	 *
	 * @private
	 * @name delete
	 * @memberOf Hash
	 * @param {Object} hash The hash to modify.
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function hashDelete(key) {
	  var result = this.has(key) && delete this.__data__[key];
	  this.size -= result ? 1 : 0;
	  return result;
	}
	
	module.exports = hashDelete;

/***/ },
/* 117 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var nativeCreate = __webpack_require__(115);
	
	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = '__lodash_hash_undefined__';
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * Gets the hash value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf Hash
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function hashGet(key) {
	  var data = this.__data__;
	  if (nativeCreate) {
	    var result = data[key];
	    return result === HASH_UNDEFINED ? undefined : result;
	  }
	  return hasOwnProperty.call(data, key) ? data[key] : undefined;
	}
	
	module.exports = hashGet;

/***/ },
/* 118 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var nativeCreate = __webpack_require__(115);
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * Checks if a hash value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf Hash
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function hashHas(key) {
	  var data = this.__data__;
	  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
	}
	
	module.exports = hashHas;

/***/ },
/* 119 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var nativeCreate = __webpack_require__(115);
	
	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = '__lodash_hash_undefined__';
	
	/**
	 * Sets the hash `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf Hash
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the hash instance.
	 */
	function hashSet(key, value) {
	  var data = this.__data__;
	  this.size += this.has(key) ? 0 : 1;
	  data[key] = nativeCreate && value === undefined ? HASH_UNDEFINED : value;
	  return this;
	}
	
	module.exports = hashSet;

/***/ },
/* 120 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var listCacheClear = __webpack_require__(121),
	    listCacheDelete = __webpack_require__(122),
	    listCacheGet = __webpack_require__(125),
	    listCacheHas = __webpack_require__(126),
	    listCacheSet = __webpack_require__(127);
	
	/**
	 * Creates an list cache object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function ListCache(entries) {
	    var index = -1,
	        length = entries == null ? 0 : entries.length;
	
	    this.clear();
	    while (++index < length) {
	        var entry = entries[index];
	        this.set(entry[0], entry[1]);
	    }
	}
	
	// Add methods to `ListCache`.
	ListCache.prototype.clear = listCacheClear;
	ListCache.prototype['delete'] = listCacheDelete;
	ListCache.prototype.get = listCacheGet;
	ListCache.prototype.has = listCacheHas;
	ListCache.prototype.set = listCacheSet;
	
	module.exports = ListCache;

/***/ },
/* 121 */
/***/ function(module, exports) {

	"use strict";
	
	/**
	 * Removes all key-value entries from the list cache.
	 *
	 * @private
	 * @name clear
	 * @memberOf ListCache
	 */
	function listCacheClear() {
	  this.__data__ = [];
	  this.size = 0;
	}
	
	module.exports = listCacheClear;

/***/ },
/* 122 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var assocIndexOf = __webpack_require__(123);
	
	/** Used for built-in method references. */
	var arrayProto = Array.prototype;
	
	/** Built-in value references. */
	var splice = arrayProto.splice;
	
	/**
	 * Removes `key` and its value from the list cache.
	 *
	 * @private
	 * @name delete
	 * @memberOf ListCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function listCacheDelete(key) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);
	
	  if (index < 0) {
	    return false;
	  }
	  var lastIndex = data.length - 1;
	  if (index == lastIndex) {
	    data.pop();
	  } else {
	    splice.call(data, index, 1);
	  }
	  --this.size;
	  return true;
	}
	
	module.exports = listCacheDelete;

/***/ },
/* 123 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var eq = __webpack_require__(124);
	
	/**
	 * Gets the index at which the `key` is found in `array` of key-value pairs.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {*} key The key to search for.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function assocIndexOf(array, key) {
	  var length = array.length;
	  while (length--) {
	    if (eq(array[length][0], key)) {
	      return length;
	    }
	  }
	  return -1;
	}
	
	module.exports = assocIndexOf;

/***/ },
/* 124 */
/***/ function(module, exports) {

	"use strict";
	
	/**
	 * Performs a
	 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * comparison between two values to determine if they are equivalent.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 * var other = { 'a': 1 };
	 *
	 * _.eq(object, object);
	 * // => true
	 *
	 * _.eq(object, other);
	 * // => false
	 *
	 * _.eq('a', 'a');
	 * // => true
	 *
	 * _.eq('a', Object('a'));
	 * // => false
	 *
	 * _.eq(NaN, NaN);
	 * // => true
	 */
	function eq(value, other) {
	  return value === other || value !== value && other !== other;
	}
	
	module.exports = eq;

/***/ },
/* 125 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var assocIndexOf = __webpack_require__(123);
	
	/**
	 * Gets the list cache value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf ListCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function listCacheGet(key) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);
	
	  return index < 0 ? undefined : data[index][1];
	}
	
	module.exports = listCacheGet;

/***/ },
/* 126 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var assocIndexOf = __webpack_require__(123);
	
	/**
	 * Checks if a list cache value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf ListCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function listCacheHas(key) {
	  return assocIndexOf(this.__data__, key) > -1;
	}
	
	module.exports = listCacheHas;

/***/ },
/* 127 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var assocIndexOf = __webpack_require__(123);
	
	/**
	 * Sets the list cache `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf ListCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the list cache instance.
	 */
	function listCacheSet(key, value) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);
	
	  if (index < 0) {
	    ++this.size;
	    data.push([key, value]);
	  } else {
	    data[index][1] = value;
	  }
	  return this;
	}
	
	module.exports = listCacheSet;

/***/ },
/* 128 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var getMapData = __webpack_require__(129);
	
	/**
	 * Removes `key` and its value from the map.
	 *
	 * @private
	 * @name delete
	 * @memberOf MapCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function mapCacheDelete(key) {
	  var result = getMapData(this, key)['delete'](key);
	  this.size -= result ? 1 : 0;
	  return result;
	}
	
	module.exports = mapCacheDelete;

/***/ },
/* 129 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var isKeyable = __webpack_require__(130);
	
	/**
	 * Gets the data for `map`.
	 *
	 * @private
	 * @param {Object} map The map to query.
	 * @param {string} key The reference key.
	 * @returns {*} Returns the map data.
	 */
	function getMapData(map, key) {
	  var data = map.__data__;
	  return isKeyable(key) ? data[typeof key == 'string' ? 'string' : 'hash'] : data.map;
	}
	
	module.exports = getMapData;

/***/ },
/* 130 */
/***/ function(module, exports) {

	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	/**
	 * Checks if `value` is suitable for use as unique object key.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
	 */
	function isKeyable(value) {
	  var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);
	  return type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean' ? value !== '__proto__' : value === null;
	}
	
	module.exports = isKeyable;

/***/ },
/* 131 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var getMapData = __webpack_require__(129);
	
	/**
	 * Gets the map value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf MapCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function mapCacheGet(key) {
	  return getMapData(this, key).get(key);
	}
	
	module.exports = mapCacheGet;

/***/ },
/* 132 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var getMapData = __webpack_require__(129);
	
	/**
	 * Checks if a map value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf MapCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function mapCacheHas(key) {
	  return getMapData(this, key).has(key);
	}
	
	module.exports = mapCacheHas;

/***/ },
/* 133 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var getMapData = __webpack_require__(129);
	
	/**
	 * Sets the map `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf MapCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the map cache instance.
	 */
	function mapCacheSet(key, value) {
	  var data = getMapData(this, key),
	      size = data.size;
	
	  data.set(key, value);
	  this.size += data.size == size ? 0 : 1;
	  return this;
	}
	
	module.exports = mapCacheSet;

/***/ },
/* 134 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseToString = __webpack_require__(135);
	
	/**
	 * Converts `value` to a string. An empty string is returned for `null`
	 * and `undefined` values. The sign of `-0` is preserved.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {string} Returns the converted string.
	 * @example
	 *
	 * _.toString(null);
	 * // => ''
	 *
	 * _.toString(-0);
	 * // => '-0'
	 *
	 * _.toString([1, 2, 3]);
	 * // => '1,2,3'
	 */
	function toString(value) {
	  return value == null ? '' : baseToString(value);
	}
	
	module.exports = toString;

/***/ },
/* 135 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _Symbol = __webpack_require__(53),
	    arrayMap = __webpack_require__(69),
	    isArray = __webpack_require__(61),
	    isSymbol = __webpack_require__(66);
	
	/** Used as references for various `Number` constants. */
	var INFINITY = 1 / 0;
	
	/** Used to convert symbols to primitives and strings. */
	var symbolProto = _Symbol ? _Symbol.prototype : undefined,
	    symbolToString = symbolProto ? symbolProto.toString : undefined;
	
	/**
	 * The base implementation of `_.toString` which doesn't convert nullish
	 * values to empty strings.
	 *
	 * @private
	 * @param {*} value The value to process.
	 * @returns {string} Returns the string.
	 */
	function baseToString(value) {
	  // Exit early for strings to avoid a performance hit in some environments.
	  if (typeof value == 'string') {
	    return value;
	  }
	  if (isArray(value)) {
	    // Recursively convert values (susceptible to call stack limits).
	    return arrayMap(value, baseToString) + '';
	  }
	  if (isSymbol(value)) {
	    return symbolToString ? symbolToString.call(value) : '';
	  }
	  var result = value + '';
	  return result == '0' && 1 / value == -INFINITY ? '-0' : result;
	}
	
	module.exports = baseToString;

/***/ },
/* 136 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var isSymbol = __webpack_require__(66);
	
	/** Used as references for various `Number` constants. */
	var INFINITY = 1 / 0;
	
	/**
	 * Converts `value` to a string key if it's not a string or symbol.
	 *
	 * @private
	 * @param {*} value The value to inspect.
	 * @returns {string|symbol} Returns the key.
	 */
	function toKey(value) {
	  if (typeof value == 'string' || isSymbol(value)) {
	    return value;
	  }
	  var result = value + '';
	  return result == '0' && 1 / value == -INFINITY ? '-0' : result;
	}
	
	module.exports = toKey;

/***/ },
/* 137 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseFlatten = __webpack_require__(138);
	
	/** Used as references for various `Number` constants. */
	var INFINITY = 1 / 0;
	
	/**
	 * Recursively flattens `array`.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category Array
	 * @param {Array} array The array to flatten.
	 * @returns {Array} Returns the new flattened array.
	 * @example
	 *
	 * _.flattenDeep([1, [2, [3, [4]], 5]]);
	 * // => [1, 2, 3, 4, 5]
	 */
	function flattenDeep(array) {
	  var length = array == null ? 0 : array.length;
	  return length ? baseFlatten(array, INFINITY) : [];
	}
	
	module.exports = flattenDeep;

/***/ },
/* 138 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var arrayPush = __webpack_require__(139),
	    isFlattenable = __webpack_require__(140);
	
	/**
	 * The base implementation of `_.flatten` with support for restricting flattening.
	 *
	 * @private
	 * @param {Array} array The array to flatten.
	 * @param {number} depth The maximum recursion depth.
	 * @param {boolean} [predicate=isFlattenable] The function invoked per iteration.
	 * @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.
	 * @param {Array} [result=[]] The initial result value.
	 * @returns {Array} Returns the new flattened array.
	 */
	function baseFlatten(array, depth, predicate, isStrict, result) {
	  var index = -1,
	      length = array.length;
	
	  predicate || (predicate = isFlattenable);
	  result || (result = []);
	
	  while (++index < length) {
	    var value = array[index];
	    if (depth > 0 && predicate(value)) {
	      if (depth > 1) {
	        // Recursively flatten arrays (susceptible to call stack limits).
	        baseFlatten(value, depth - 1, predicate, isStrict, result);
	      } else {
	        arrayPush(result, value);
	      }
	    } else if (!isStrict) {
	      result[result.length] = value;
	    }
	  }
	  return result;
	}
	
	module.exports = baseFlatten;

/***/ },
/* 139 */
/***/ function(module, exports) {

	"use strict";
	
	/**
	 * Appends the elements of `values` to `array`.
	 *
	 * @private
	 * @param {Array} array The array to modify.
	 * @param {Array} values The values to append.
	 * @returns {Array} Returns `array`.
	 */
	function arrayPush(array, values) {
	  var index = -1,
	      length = values.length,
	      offset = array.length;
	
	  while (++index < length) {
	    array[offset + index] = values[index];
	  }
	  return array;
	}
	
	module.exports = arrayPush;

/***/ },
/* 140 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _Symbol = __webpack_require__(53),
	    isArguments = __webpack_require__(73),
	    isArray = __webpack_require__(61);
	
	/** Built-in value references. */
	var spreadableSymbol = _Symbol ? _Symbol.isConcatSpreadable : undefined;
	
	/**
	 * Checks if `value` is a flattenable `arguments` object or array.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
	 */
	function isFlattenable(value) {
	    return isArray(value) || isArguments(value) || !!(spreadableSymbol && value && value[spreadableSymbol]);
	}
	
	module.exports = isFlattenable;

/***/ },
/* 141 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseClamp = __webpack_require__(142),
	    baseToString = __webpack_require__(135),
	    toInteger = __webpack_require__(63),
	    toString = __webpack_require__(134);
	
	/**
	 * Checks if `string` starts with the given target string.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category String
	 * @param {string} [string=''] The string to inspect.
	 * @param {string} [target] The string to search for.
	 * @param {number} [position=0] The position to search from.
	 * @returns {boolean} Returns `true` if `string` starts with `target`,
	 *  else `false`.
	 * @example
	 *
	 * _.startsWith('abc', 'a');
	 * // => true
	 *
	 * _.startsWith('abc', 'b');
	 * // => false
	 *
	 * _.startsWith('abc', 'b', 1);
	 * // => true
	 */
	function startsWith(string, target, position) {
	  string = toString(string);
	  position = position == null ? 0 : baseClamp(toInteger(position), 0, string.length);
	
	  target = baseToString(target);
	  return string.slice(position, position + target.length) == target;
	}
	
	module.exports = startsWith;

/***/ },
/* 142 */
/***/ function(module, exports) {

	"use strict";
	
	/**
	 * The base implementation of `_.clamp` which doesn't coerce arguments.
	 *
	 * @private
	 * @param {number} number The number to clamp.
	 * @param {number} [lower] The lower bound.
	 * @param {number} upper The upper bound.
	 * @returns {number} Returns the clamped number.
	 */
	function baseClamp(number, lower, upper) {
	  if (number === number) {
	    if (upper !== undefined) {
	      number = number <= upper ? number : upper;
	    }
	    if (lower !== undefined) {
	      number = number >= lower ? number : lower;
	    }
	  }
	  return number;
	}
	
	module.exports = baseClamp;

/***/ },
/* 143 */
/***/ function(module, exports) {

	"use strict";
	
	/**
	 * Creates an array with all falsey values removed. The values `false`, `null`,
	 * `0`, `""`, `undefined`, and `NaN` are falsey.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Array
	 * @param {Array} array The array to compact.
	 * @returns {Array} Returns the new array of filtered values.
	 * @example
	 *
	 * _.compact([0, 1, false, 2, '', 3]);
	 * // => [1, 2, 3]
	 */
	function compact(array) {
	  var index = -1,
	      length = array == null ? 0 : array.length,
	      resIndex = 0,
	      result = [];
	
	  while (++index < length) {
	    var value = array[index];
	    if (value) {
	      result[resIndex++] = value;
	    }
	  }
	  return result;
	}
	
	module.exports = compact;

/***/ },
/* 144 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	/*!
		Papa Parse
		v4.3.6
		https://github.com/mholt/PapaParse
		License: MIT
	*/
	(function (root, factory) {
		if (true) {
			// AMD. Register as an anonymous module.
			!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		} else if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && typeof exports !== 'undefined') {
			// Node. Does not work with strict CommonJS, but
			// only CommonJS-like environments that support module.exports,
			// like Node.
			module.exports = factory();
		} else {
			// Browser globals (root is window)
			root.Papa = factory();
		}
	})(undefined, function () {
		'use strict';
	
		var global = function () {
			// alternative method, similar to `Function('return this')()`
			// but without using `eval` (which is disabled when
			// using Content Security Policy).
	
			if (typeof self !== 'undefined') {
				return self;
			}
			if (typeof window !== 'undefined') {
				return window;
			}
			if (typeof global !== 'undefined') {
				return global;
			}
	
			// When running tests none of the above have been defined
			return {};
		}();
	
		var IS_WORKER = !global.document && !!global.postMessage,
		    IS_PAPA_WORKER = IS_WORKER && /(\?|&)papaworker(=|&|$)/.test(global.location.search),
		    LOADED_SYNC = false,
		    AUTO_SCRIPT_PATH;
		var workers = {},
		    workerIdCounter = 0;
	
		var Papa = {};
	
		Papa.parse = CsvToJson;
		Papa.unparse = JsonToCsv;
	
		Papa.RECORD_SEP = String.fromCharCode(30);
		Papa.UNIT_SEP = String.fromCharCode(31);
		Papa.BYTE_ORDER_MARK = '\uFEFF';
		Papa.BAD_DELIMITERS = ['\r', '\n', '"', Papa.BYTE_ORDER_MARK];
		Papa.WORKERS_SUPPORTED = !IS_WORKER && !!global.Worker;
		Papa.SCRIPT_PATH = null; // Must be set by your code if you use workers and this lib is loaded asynchronously
	
		// Configurable chunk sizes for local and remote files, respectively
		Papa.LocalChunkSize = 1024 * 1024 * 10; // 10 MB
		Papa.RemoteChunkSize = 1024 * 1024 * 5; // 5 MB
		Papa.DefaultDelimiter = ','; // Used if not specified and detection fails
	
		// Exposed for testing and development only
		Papa.Parser = Parser;
		Papa.ParserHandle = ParserHandle;
		Papa.NetworkStreamer = NetworkStreamer;
		Papa.FileStreamer = FileStreamer;
		Papa.StringStreamer = StringStreamer;
		Papa.ReadableStreamStreamer = ReadableStreamStreamer;
	
		if (global.jQuery) {
			var $ = global.jQuery;
			$.fn.parse = function (options) {
				var config = options.config || {};
				var queue = [];
	
				this.each(function (idx) {
					var supported = $(this).prop('tagName').toUpperCase() === 'INPUT' && $(this).attr('type').toLowerCase() === 'file' && global.FileReader;
	
					if (!supported || !this.files || this.files.length === 0) return true; // continue to next input element
	
					for (var i = 0; i < this.files.length; i++) {
						queue.push({
							file: this.files[i],
							inputElem: this,
							instanceConfig: $.extend({}, config)
						});
					}
				});
	
				parseNextFile(); // begin parsing
				return this; // maintains chainability
	
	
				function parseNextFile() {
					if (queue.length === 0) {
						if (isFunction(options.complete)) options.complete();
						return;
					}
	
					var f = queue[0];
	
					if (isFunction(options.before)) {
						var returned = options.before(f.file, f.inputElem);
	
						if ((typeof returned === 'undefined' ? 'undefined' : _typeof(returned)) === 'object') {
							if (returned.action === 'abort') {
								error('AbortError', f.file, f.inputElem, returned.reason);
								return; // Aborts all queued files immediately
							} else if (returned.action === 'skip') {
								fileComplete(); // parse the next file in the queue, if any
								return;
							} else if (_typeof(returned.config) === 'object') f.instanceConfig = $.extend(f.instanceConfig, returned.config);
						} else if (returned === 'skip') {
							fileComplete(); // parse the next file in the queue, if any
							return;
						}
					}
	
					// Wrap up the user's complete callback, if any, so that ours also gets executed
					var userCompleteFunc = f.instanceConfig.complete;
					f.instanceConfig.complete = function (results) {
						if (isFunction(userCompleteFunc)) userCompleteFunc(results, f.file, f.inputElem);
						fileComplete();
					};
	
					Papa.parse(f.file, f.instanceConfig);
				}
	
				function error(name, file, elem, reason) {
					if (isFunction(options.error)) options.error({ name: name }, file, elem, reason);
				}
	
				function fileComplete() {
					queue.splice(0, 1);
					parseNextFile();
				}
			};
		}
	
		if (IS_PAPA_WORKER) {
			global.onmessage = workerThreadReceivedMessage;
		} else if (Papa.WORKERS_SUPPORTED) {
			AUTO_SCRIPT_PATH = getScriptPath();
	
			// Check if the script was loaded synchronously
			if (!document.body) {
				// Body doesn't exist yet, must be synchronous
				LOADED_SYNC = true;
			} else {
				document.addEventListener('DOMContentLoaded', function () {
					LOADED_SYNC = true;
				}, true);
			}
		}
	
		function CsvToJson(_input, _config) {
			_config = _config || {};
			var dynamicTyping = _config.dynamicTyping || false;
			if (isFunction(dynamicTyping)) {
				_config.dynamicTypingFunction = dynamicTyping;
				// Will be filled on first row call
				dynamicTyping = {};
			}
			_config.dynamicTyping = dynamicTyping;
	
			if (_config.worker && Papa.WORKERS_SUPPORTED) {
				var w = newWorker();
	
				w.userStep = _config.step;
				w.userChunk = _config.chunk;
				w.userComplete = _config.complete;
				w.userError = _config.error;
	
				_config.step = isFunction(_config.step);
				_config.chunk = isFunction(_config.chunk);
				_config.complete = isFunction(_config.complete);
				_config.error = isFunction(_config.error);
				delete _config.worker; // prevent infinite loop
	
				w.postMessage({
					input: _input,
					config: _config,
					workerId: w.id
				});
	
				return;
			}
	
			var streamer = null;
			if (typeof _input === 'string') {
				if (_config.download) streamer = new NetworkStreamer(_config);else streamer = new StringStreamer(_config);
			} else if (_input.readable === true && isFunction(_input.read) && isFunction(_input.on)) {
				streamer = new ReadableStreamStreamer(_config);
			} else if (global.File && _input instanceof File || _input instanceof Object) // ...Safari. (see issue #106)
				streamer = new FileStreamer(_config);
	
			return streamer.stream(_input);
		}
	
		function JsonToCsv(_input, _config) {
			var _output = '';
			var _fields = [];
	
			// Default configuration
	
			/** whether to surround every datum with quotes */
			var _quotes = false;
	
			/** whether to write headers */
			var _writeHeader = true;
	
			/** delimiting character */
			var _delimiter = ',';
	
			/** newline character(s) */
			var _newline = '\r\n';
	
			/** quote character */
			var _quoteChar = '"';
	
			unpackConfig();
	
			var quoteCharRegex = new RegExp(_quoteChar, 'g');
	
			if (typeof _input === 'string') _input = JSON.parse(_input);
	
			if (_input instanceof Array) {
				if (!_input.length || _input[0] instanceof Array) return serialize(null, _input);else if (_typeof(_input[0]) === 'object') return serialize(objectKeys(_input[0]), _input);
			} else if ((typeof _input === 'undefined' ? 'undefined' : _typeof(_input)) === 'object') {
				if (typeof _input.data === 'string') _input.data = JSON.parse(_input.data);
	
				if (_input.data instanceof Array) {
					if (!_input.fields) _input.fields = _input.meta && _input.meta.fields;
	
					if (!_input.fields) _input.fields = _input.data[0] instanceof Array ? _input.fields : objectKeys(_input.data[0]);
	
					if (!(_input.data[0] instanceof Array) && _typeof(_input.data[0]) !== 'object') _input.data = [_input.data]; // handles input like [1,2,3] or ['asdf']
				}
	
				return serialize(_input.fields || [], _input.data || []);
			}
	
			// Default (any valid paths should return before this)
			throw 'exception: Unable to serialize unrecognized input';
	
			function unpackConfig() {
				if ((typeof _config === 'undefined' ? 'undefined' : _typeof(_config)) !== 'object') return;
	
				if (typeof _config.delimiter === 'string' && _config.delimiter.length === 1 && Papa.BAD_DELIMITERS.indexOf(_config.delimiter) === -1) {
					_delimiter = _config.delimiter;
				}
	
				if (typeof _config.quotes === 'boolean' || _config.quotes instanceof Array) _quotes = _config.quotes;
	
				if (typeof _config.newline === 'string') _newline = _config.newline;
	
				if (typeof _config.quoteChar === 'string') _quoteChar = _config.quoteChar;
	
				if (typeof _config.header === 'boolean') _writeHeader = _config.header;
			}
	
			/** Turns an object's keys into an array */
			function objectKeys(obj) {
				if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object') return [];
				var keys = [];
				for (var key in obj) {
					keys.push(key);
				}return keys;
			}
	
			/** The double for loop that iterates the data and writes out a CSV string including header row */
			function serialize(fields, data) {
				var csv = '';
	
				if (typeof fields === 'string') fields = JSON.parse(fields);
				if (typeof data === 'string') data = JSON.parse(data);
	
				var hasHeader = fields instanceof Array && fields.length > 0;
				var dataKeyedByField = !(data[0] instanceof Array);
	
				// If there a header row, write it first
				if (hasHeader && _writeHeader) {
					for (var i = 0; i < fields.length; i++) {
						if (i > 0) csv += _delimiter;
						csv += safe(fields[i], i);
					}
					if (data.length > 0) csv += _newline;
				}
	
				// Then write out the data
				for (var row = 0; row < data.length; row++) {
					var maxCol = hasHeader ? fields.length : data[row].length;
	
					for (var col = 0; col < maxCol; col++) {
						if (col > 0) csv += _delimiter;
						var colIdx = hasHeader && dataKeyedByField ? fields[col] : col;
						csv += safe(data[row][colIdx], col);
					}
	
					if (row < data.length - 1) csv += _newline;
				}
	
				return csv;
			}
	
			/** Encloses a value around quotes if needed (makes a value safe for CSV insertion) */
			function safe(str, col) {
				if (typeof str === 'undefined' || str === null) return '';
	
				str = str.toString().replace(quoteCharRegex, _quoteChar + _quoteChar);
	
				var needsQuotes = typeof _quotes === 'boolean' && _quotes || _quotes instanceof Array && _quotes[col] || hasAny(str, Papa.BAD_DELIMITERS) || str.indexOf(_delimiter) > -1 || str.charAt(0) === ' ' || str.charAt(str.length - 1) === ' ';
	
				return needsQuotes ? _quoteChar + str + _quoteChar : str;
			}
	
			function hasAny(str, substrings) {
				for (var i = 0; i < substrings.length; i++) {
					if (str.indexOf(substrings[i]) > -1) return true;
				}return false;
			}
		}
	
		/** ChunkStreamer is the base prototype for various streamer implementations. */
		function ChunkStreamer(config) {
			this._handle = null;
			this._paused = false;
			this._finished = false;
			this._input = null;
			this._baseIndex = 0;
			this._partialLine = '';
			this._rowCount = 0;
			this._start = 0;
			this._nextChunk = null;
			this.isFirstChunk = true;
			this._completeResults = {
				data: [],
				errors: [],
				meta: {}
			};
			replaceConfig.call(this, config);
	
			this.parseChunk = function (chunk) {
				// First chunk pre-processing
				if (this.isFirstChunk && isFunction(this._config.beforeFirstChunk)) {
					var modifiedChunk = this._config.beforeFirstChunk(chunk);
					if (modifiedChunk !== undefined) chunk = modifiedChunk;
				}
				this.isFirstChunk = false;
	
				// Rejoin the line we likely just split in two by chunking the file
				var aggregate = this._partialLine + chunk;
				this._partialLine = '';
	
				var results = this._handle.parse(aggregate, this._baseIndex, !this._finished);
	
				if (this._handle.paused() || this._handle.aborted()) return;
	
				var lastIndex = results.meta.cursor;
	
				if (!this._finished) {
					this._partialLine = aggregate.substring(lastIndex - this._baseIndex);
					this._baseIndex = lastIndex;
				}
	
				if (results && results.data) this._rowCount += results.data.length;
	
				var finishedIncludingPreview = this._finished || this._config.preview && this._rowCount >= this._config.preview;
	
				if (IS_PAPA_WORKER) {
					global.postMessage({
						results: results,
						workerId: Papa.WORKER_ID,
						finished: finishedIncludingPreview
					});
				} else if (isFunction(this._config.chunk)) {
					this._config.chunk(results, this._handle);
					if (this._paused) return;
					results = undefined;
					this._completeResults = undefined;
				}
	
				if (!this._config.step && !this._config.chunk) {
					this._completeResults.data = this._completeResults.data.concat(results.data);
					this._completeResults.errors = this._completeResults.errors.concat(results.errors);
					this._completeResults.meta = results.meta;
				}
	
				if (finishedIncludingPreview && isFunction(this._config.complete) && (!results || !results.meta.aborted)) this._config.complete(this._completeResults, this._input);
	
				if (!finishedIncludingPreview && (!results || !results.meta.paused)) this._nextChunk();
	
				return results;
			};
	
			this._sendError = function (error) {
				if (isFunction(this._config.error)) this._config.error(error);else if (IS_PAPA_WORKER && this._config.error) {
					global.postMessage({
						workerId: Papa.WORKER_ID,
						error: error,
						finished: false
					});
				}
			};
	
			function replaceConfig(config) {
				// Deep-copy the config so we can edit it
				var configCopy = copy(config);
				configCopy.chunkSize = parseInt(configCopy.chunkSize); // parseInt VERY important so we don't concatenate strings!
				if (!config.step && !config.chunk) configCopy.chunkSize = null; // disable Range header if not streaming; bad values break IIS - see issue #196
				this._handle = new ParserHandle(configCopy);
				this._handle.streamer = this;
				this._config = configCopy; // persist the copy to the caller
			}
		}
	
		function NetworkStreamer(config) {
			config = config || {};
			if (!config.chunkSize) config.chunkSize = Papa.RemoteChunkSize;
			ChunkStreamer.call(this, config);
	
			var xhr;
	
			if (IS_WORKER) {
				this._nextChunk = function () {
					this._readChunk();
					this._chunkLoaded();
				};
			} else {
				this._nextChunk = function () {
					this._readChunk();
				};
			}
	
			this.stream = function (url) {
				this._input = url;
				this._nextChunk(); // Starts streaming
			};
	
			this._readChunk = function () {
				if (this._finished) {
					this._chunkLoaded();
					return;
				}
	
				xhr = new XMLHttpRequest();
	
				if (this._config.withCredentials) {
					xhr.withCredentials = this._config.withCredentials;
				}
	
				if (!IS_WORKER) {
					xhr.onload = bindFunction(this._chunkLoaded, this);
					xhr.onerror = bindFunction(this._chunkError, this);
				}
	
				xhr.open('GET', this._input, !IS_WORKER);
				// Headers can only be set when once the request state is OPENED
				if (this._config.downloadRequestHeaders) {
					var headers = this._config.downloadRequestHeaders;
	
					for (var headerName in headers) {
						xhr.setRequestHeader(headerName, headers[headerName]);
					}
				}
	
				if (this._config.chunkSize) {
					var end = this._start + this._config.chunkSize - 1; // minus one because byte range is inclusive
					xhr.setRequestHeader('Range', 'bytes=' + this._start + '-' + end);
					xhr.setRequestHeader('If-None-Match', 'webkit-no-cache'); // https://bugs.webkit.org/show_bug.cgi?id=82672
				}
	
				try {
					xhr.send();
				} catch (err) {
					this._chunkError(err.message);
				}
	
				if (IS_WORKER && xhr.status === 0) this._chunkError();else this._start += this._config.chunkSize;
			};
	
			this._chunkLoaded = function () {
				if (xhr.readyState != 4) return;
	
				if (xhr.status < 200 || xhr.status >= 400) {
					this._chunkError();
					return;
				}
	
				this._finished = !this._config.chunkSize || this._start > getFileSize(xhr);
				this.parseChunk(xhr.responseText);
			};
	
			this._chunkError = function (errorMessage) {
				var errorText = xhr.statusText || errorMessage;
				this._sendError(errorText);
			};
	
			function getFileSize(xhr) {
				var contentRange = xhr.getResponseHeader('Content-Range');
				if (contentRange === null) {
					// no content range, then finish!
					return -1;
				}
				return parseInt(contentRange.substr(contentRange.lastIndexOf('/') + 1));
			}
		}
		NetworkStreamer.prototype = Object.create(ChunkStreamer.prototype);
		NetworkStreamer.prototype.constructor = NetworkStreamer;
	
		function FileStreamer(config) {
			config = config || {};
			if (!config.chunkSize) config.chunkSize = Papa.LocalChunkSize;
			ChunkStreamer.call(this, config);
	
			var reader, slice;
	
			// FileReader is better than FileReaderSync (even in worker) - see http://stackoverflow.com/q/24708649/1048862
			// But Firefox is a pill, too - see issue #76: https://github.com/mholt/PapaParse/issues/76
			var usingAsyncReader = typeof FileReader !== 'undefined'; // Safari doesn't consider it a function - see issue #105
	
			this.stream = function (file) {
				this._input = file;
				slice = file.slice || file.webkitSlice || file.mozSlice;
	
				if (usingAsyncReader) {
					reader = new FileReader(); // Preferred method of reading files, even in workers
					reader.onload = bindFunction(this._chunkLoaded, this);
					reader.onerror = bindFunction(this._chunkError, this);
				} else reader = new FileReaderSync(); // Hack for running in a web worker in Firefox
	
				this._nextChunk(); // Starts streaming
			};
	
			this._nextChunk = function () {
				if (!this._finished && (!this._config.preview || this._rowCount < this._config.preview)) this._readChunk();
			};
	
			this._readChunk = function () {
				var input = this._input;
				if (this._config.chunkSize) {
					var end = Math.min(this._start + this._config.chunkSize, this._input.size);
					input = slice.call(input, this._start, end);
				}
				var txt = reader.readAsText(input, this._config.encoding);
				if (!usingAsyncReader) this._chunkLoaded({ target: { result: txt } }); // mimic the async signature
			};
	
			this._chunkLoaded = function (event) {
				// Very important to increment start each time before handling results
				this._start += this._config.chunkSize;
				this._finished = !this._config.chunkSize || this._start >= this._input.size;
				this.parseChunk(event.target.result);
			};
	
			this._chunkError = function () {
				this._sendError(reader.error);
			};
		}
		FileStreamer.prototype = Object.create(ChunkStreamer.prototype);
		FileStreamer.prototype.constructor = FileStreamer;
	
		function StringStreamer(config) {
			config = config || {};
			ChunkStreamer.call(this, config);
	
			var string;
			var remaining;
			this.stream = function (s) {
				string = s;
				remaining = s;
				return this._nextChunk();
			};
			this._nextChunk = function () {
				if (this._finished) return;
				var size = this._config.chunkSize;
				var chunk = size ? remaining.substr(0, size) : remaining;
				remaining = size ? remaining.substr(size) : '';
				this._finished = !remaining;
				return this.parseChunk(chunk);
			};
		}
		StringStreamer.prototype = Object.create(StringStreamer.prototype);
		StringStreamer.prototype.constructor = StringStreamer;
	
		function ReadableStreamStreamer(config) {
			config = config || {};
	
			ChunkStreamer.call(this, config);
	
			var queue = [];
			var parseOnData = true;
	
			this.stream = function (stream) {
				this._input = stream;
	
				this._input.on('data', this._streamData);
				this._input.on('end', this._streamEnd);
				this._input.on('error', this._streamError);
			};
	
			this._nextChunk = function () {
				if (queue.length) {
					this.parseChunk(queue.shift());
				} else {
					parseOnData = true;
				}
			};
	
			this._streamData = bindFunction(function (chunk) {
				try {
					queue.push(typeof chunk === 'string' ? chunk : chunk.toString(this._config.encoding));
	
					if (parseOnData) {
						parseOnData = false;
						this.parseChunk(queue.shift());
					}
				} catch (error) {
					this._streamError(error);
				}
			}, this);
	
			this._streamError = bindFunction(function (error) {
				this._streamCleanUp();
				this._sendError(error.message);
			}, this);
	
			this._streamEnd = bindFunction(function () {
				this._streamCleanUp();
				this._finished = true;
				this._streamData('');
			}, this);
	
			this._streamCleanUp = bindFunction(function () {
				this._input.removeListener('data', this._streamData);
				this._input.removeListener('end', this._streamEnd);
				this._input.removeListener('error', this._streamError);
			}, this);
		}
		ReadableStreamStreamer.prototype = Object.create(ChunkStreamer.prototype);
		ReadableStreamStreamer.prototype.constructor = ReadableStreamStreamer;
	
		// Use one ParserHandle per entire CSV file or string
		function ParserHandle(_config) {
			// One goal is to minimize the use of regular expressions...
			var FLOAT = /^\s*-?(\d*\.?\d+|\d+\.?\d*)(e[-+]?\d+)?\s*$/i;
	
			var self = this;
			var _stepCounter = 0; // Number of times step was called (number of rows parsed)
			var _input; // The input being parsed
			var _parser; // The core parser being used
			var _paused = false; // Whether we are paused or not
			var _aborted = false; // Whether the parser has aborted or not
			var _delimiterError; // Temporary state between delimiter detection and processing results
			var _fields = []; // Fields are from the header row of the input, if there is one
			var _results = { // The last results returned from the parser
				data: [],
				errors: [],
				meta: {}
			};
	
			if (isFunction(_config.step)) {
				var userStep = _config.step;
				_config.step = function (results) {
					_results = results;
	
					if (needsHeaderRow()) processResults();else // only call user's step function after header row
						{
							processResults();
	
							// It's possbile that this line was empty and there's no row here after all
							if (_results.data.length === 0) return;
	
							_stepCounter += results.data.length;
							if (_config.preview && _stepCounter > _config.preview) _parser.abort();else userStep(_results, self);
						}
				};
			}
	
			/**
	   * Parses input. Most users won't need, and shouldn't mess with, the baseIndex
	   * and ignoreLastRow parameters. They are used by streamers (wrapper functions)
	   * when an input comes in multiple chunks, like from a file.
	   */
			this.parse = function (input, baseIndex, ignoreLastRow) {
				if (!_config.newline) _config.newline = guessLineEndings(input);
	
				_delimiterError = false;
				if (!_config.delimiter) {
					var delimGuess = guessDelimiter(input, _config.newline, _config.skipEmptyLines);
					if (delimGuess.successful) _config.delimiter = delimGuess.bestDelimiter;else {
						_delimiterError = true; // add error after parsing (otherwise it would be overwritten)
						_config.delimiter = Papa.DefaultDelimiter;
					}
					_results.meta.delimiter = _config.delimiter;
				} else if (isFunction(_config.delimiter)) {
					_config.delimiter = _config.delimiter(input);
					_results.meta.delimiter = _config.delimiter;
				}
	
				var parserConfig = copy(_config);
				if (_config.preview && _config.header) parserConfig.preview++; // to compensate for header row
	
				_input = input;
				_parser = new Parser(parserConfig);
				_results = _parser.parse(_input, baseIndex, ignoreLastRow);
				processResults();
				return _paused ? { meta: { paused: true } } : _results || { meta: { paused: false } };
			};
	
			this.paused = function () {
				return _paused;
			};
	
			this.pause = function () {
				_paused = true;
				_parser.abort();
				_input = _input.substr(_parser.getCharIndex());
			};
	
			this.resume = function () {
				_paused = false;
				self.streamer.parseChunk(_input);
			};
	
			this.aborted = function () {
				return _aborted;
			};
	
			this.abort = function () {
				_aborted = true;
				_parser.abort();
				_results.meta.aborted = true;
				if (isFunction(_config.complete)) _config.complete(_results);
				_input = '';
			};
	
			function processResults() {
				if (_results && _delimiterError) {
					addError('Delimiter', 'UndetectableDelimiter', 'Unable to auto-detect delimiting character; defaulted to \'' + Papa.DefaultDelimiter + '\'');
					_delimiterError = false;
				}
	
				if (_config.skipEmptyLines) {
					for (var i = 0; i < _results.data.length; i++) {
						if (_results.data[i].length === 1 && _results.data[i][0] === '') _results.data.splice(i--, 1);
					}
				}
	
				if (needsHeaderRow()) fillHeaderFields();
	
				return applyHeaderAndDynamicTyping();
			}
	
			function needsHeaderRow() {
				return _config.header && _fields.length === 0;
			}
	
			function fillHeaderFields() {
				if (!_results) return;
				for (var i = 0; needsHeaderRow() && i < _results.data.length; i++) {
					for (var j = 0; j < _results.data[i].length; j++) {
						_fields.push(_results.data[i][j]);
					}
				}_results.data.splice(0, 1);
			}
	
			function shouldApplyDynamicTyping(field) {
				// Cache function values to avoid calling it for each row
				if (_config.dynamicTypingFunction && _config.dynamicTyping[field] === undefined) {
					_config.dynamicTyping[field] = _config.dynamicTypingFunction(field);
				}
				return (_config.dynamicTyping[field] || _config.dynamicTyping) === true;
			}
	
			function parseDynamic(field, value) {
				if (shouldApplyDynamicTyping(field)) {
					if (value === 'true' || value === 'TRUE') return true;else if (value === 'false' || value === 'FALSE') return false;else return tryParseFloat(value);
				}
				return value;
			}
	
			function applyHeaderAndDynamicTyping() {
				if (!_results || !_config.header && !_config.dynamicTyping) return _results;
	
				for (var i = 0; i < _results.data.length; i++) {
					var row = _config.header ? {} : [];
	
					for (var j = 0; j < _results.data[i].length; j++) {
						var field = j;
						var value = _results.data[i][j];
	
						if (_config.header) field = j >= _fields.length ? '__parsed_extra' : _fields[j];
	
						value = parseDynamic(field, value);
	
						if (field === '__parsed_extra') {
							row[field] = row[field] || [];
							row[field].push(value);
						} else row[field] = value;
					}
	
					_results.data[i] = row;
	
					if (_config.header) {
						if (j > _fields.length) addError('FieldMismatch', 'TooManyFields', 'Too many fields: expected ' + _fields.length + ' fields but parsed ' + j, i);else if (j < _fields.length) addError('FieldMismatch', 'TooFewFields', 'Too few fields: expected ' + _fields.length + ' fields but parsed ' + j, i);
					}
				}
	
				if (_config.header && _results.meta) _results.meta.fields = _fields;
				return _results;
			}
	
			function guessDelimiter(input, newline, skipEmptyLines) {
				var delimChoices = [',', '\t', '|', ';', Papa.RECORD_SEP, Papa.UNIT_SEP];
				var bestDelim, bestDelta, fieldCountPrevRow;
	
				for (var i = 0; i < delimChoices.length; i++) {
					var delim = delimChoices[i];
					var delta = 0,
					    avgFieldCount = 0,
					    emptyLinesCount = 0;
					fieldCountPrevRow = undefined;
	
					var preview = new Parser({
						delimiter: delim,
						newline: newline,
						preview: 10
					}).parse(input);
	
					for (var j = 0; j < preview.data.length; j++) {
						if (skipEmptyLines && preview.data[j].length === 1 && preview.data[j][0].length === 0) {
							emptyLinesCount++;
							continue;
						}
						var fieldCount = preview.data[j].length;
						avgFieldCount += fieldCount;
	
						if (typeof fieldCountPrevRow === 'undefined') {
							fieldCountPrevRow = fieldCount;
							continue;
						} else if (fieldCount > 1) {
							delta += Math.abs(fieldCount - fieldCountPrevRow);
							fieldCountPrevRow = fieldCount;
						}
					}
	
					if (preview.data.length > 0) avgFieldCount /= preview.data.length - emptyLinesCount;
	
					if ((typeof bestDelta === 'undefined' || delta < bestDelta) && avgFieldCount > 1.99) {
						bestDelta = delta;
						bestDelim = delim;
					}
				}
	
				_config.delimiter = bestDelim;
	
				return {
					successful: !!bestDelim,
					bestDelimiter: bestDelim
				};
			}
	
			function guessLineEndings(input) {
				input = input.substr(0, 1024 * 1024); // max length 1 MB
	
				var r = input.split('\r');
	
				var n = input.split('\n');
	
				var nAppearsFirst = n.length > 1 && n[0].length < r[0].length;
	
				if (r.length === 1 || nAppearsFirst) return '\n';
	
				var numWithN = 0;
				for (var i = 0; i < r.length; i++) {
					if (r[i][0] === '\n') numWithN++;
				}
	
				return numWithN >= r.length / 2 ? '\r\n' : '\r';
			}
	
			function tryParseFloat(val) {
				var isNumber = FLOAT.test(val);
				return isNumber ? parseFloat(val) : val;
			}
	
			function addError(type, code, msg, row) {
				_results.errors.push({
					type: type,
					code: code,
					message: msg,
					row: row
				});
			}
		}
	
		/** The core parser implements speedy and correct CSV parsing */
		function Parser(config) {
			// Unpack the config object
			config = config || {};
			var delim = config.delimiter;
			var newline = config.newline;
			var comments = config.comments;
			var step = config.step;
			var preview = config.preview;
			var fastMode = config.fastMode;
			var quoteChar = config.quoteChar || '"';
	
			// Delimiter must be valid
			if (typeof delim !== 'string' || Papa.BAD_DELIMITERS.indexOf(delim) > -1) delim = ',';
	
			// Comment character must be valid
			if (comments === delim) throw 'Comment character same as delimiter';else if (comments === true) comments = '#';else if (typeof comments !== 'string' || Papa.BAD_DELIMITERS.indexOf(comments) > -1) comments = false;
	
			// Newline must be valid: \r, \n, or \r\n
			if (newline != '\n' && newline != '\r' && newline != '\r\n') newline = '\n';
	
			// We're gonna need these at the Parser scope
			var cursor = 0;
			var aborted = false;
	
			this.parse = function (input, baseIndex, ignoreLastRow) {
				// For some reason, in Chrome, this speeds things up (!?)
				if (typeof input !== 'string') throw 'Input must be a string';
	
				// We don't need to compute some of these every time parse() is called,
				// but having them in a more local scope seems to perform better
				var inputLen = input.length,
				    delimLen = delim.length,
				    newlineLen = newline.length,
				    commentsLen = comments.length;
				var stepIsFunction = isFunction(step);
	
				// Establish starting state
				cursor = 0;
				var data = [],
				    errors = [],
				    row = [],
				    lastCursor = 0;
	
				if (!input) return returnable();
	
				if (fastMode || fastMode !== false && input.indexOf(quoteChar) === -1) {
					var rows = input.split(newline);
					for (var i = 0; i < rows.length; i++) {
						var row = rows[i];
						cursor += row.length;
						if (i !== rows.length - 1) cursor += newline.length;else if (ignoreLastRow) return returnable();
						if (comments && row.substr(0, commentsLen) === comments) continue;
						if (stepIsFunction) {
							data = [];
							pushRow(row.split(delim));
							doStep();
							if (aborted) return returnable();
						} else pushRow(row.split(delim));
						if (preview && i >= preview) {
							data = data.slice(0, preview);
							return returnable(true);
						}
					}
					return returnable();
				}
	
				var nextDelim = input.indexOf(delim, cursor);
				var nextNewline = input.indexOf(newline, cursor);
				var quoteCharRegex = new RegExp(quoteChar + quoteChar, 'g');
	
				// Parser loop
				for (;;) {
					// Field has opening quote
					if (input[cursor] === quoteChar) {
						// Start our search for the closing quote where the cursor is
						var quoteSearch = cursor;
	
						// Skip the opening quote
						cursor++;
	
						for (;;) {
							// Find closing quote
							var quoteSearch = input.indexOf(quoteChar, quoteSearch + 1);
	
							//No other quotes are found - no other delimiters
							if (quoteSearch === -1) {
								if (!ignoreLastRow) {
									// No closing quote... what a pity
									errors.push({
										type: 'Quotes',
										code: 'MissingQuotes',
										message: 'Quoted field unterminated',
										row: data.length, // row has yet to be inserted
										index: cursor
									});
								}
								return finish();
							}
	
							// Closing quote at EOF
							if (quoteSearch === inputLen - 1) {
								var value = input.substring(cursor, quoteSearch).replace(quoteCharRegex, quoteChar);
								return finish(value);
							}
	
							// If this quote is escaped, it's part of the data; skip it
							if (input[quoteSearch + 1] === quoteChar) {
								quoteSearch++;
								continue;
							}
	
							// Closing quote followed by delimiter
							if (input[quoteSearch + 1] === delim) {
								row.push(input.substring(cursor, quoteSearch).replace(quoteCharRegex, quoteChar));
								cursor = quoteSearch + 1 + delimLen;
								nextDelim = input.indexOf(delim, cursor);
								nextNewline = input.indexOf(newline, cursor);
								break;
							}
	
							// Closing quote followed by newline
							if (input.substr(quoteSearch + 1, newlineLen) === newline) {
								row.push(input.substring(cursor, quoteSearch).replace(quoteCharRegex, quoteChar));
								saveRow(quoteSearch + 1 + newlineLen);
								nextDelim = input.indexOf(delim, cursor); // because we may have skipped the nextDelim in the quoted field
	
								if (stepIsFunction) {
									doStep();
									if (aborted) return returnable();
								}
	
								if (preview && data.length >= preview) return returnable(true);
	
								break;
							}
	
							// Checks for valid closing quotes are complete (escaped quotes or quote followed by EOF/delimiter/newline) -- assume these quotes are part of an invalid text string
							errors.push({
								type: 'Quotes',
								code: 'InvalidQuotes',
								message: 'Trailing quote on quoted field is malformed',
								row: data.length, // row has yet to be inserted
								index: cursor
							});
	
							quoteSearch++;
							continue;
						}
	
						continue;
					}
	
					// Comment found at start of new line
					if (comments && row.length === 0 && input.substr(cursor, commentsLen) === comments) {
						if (nextNewline === -1) // Comment ends at EOF
							return returnable();
						cursor = nextNewline + newlineLen;
						nextNewline = input.indexOf(newline, cursor);
						nextDelim = input.indexOf(delim, cursor);
						continue;
					}
	
					// Next delimiter comes before next newline, so we've reached end of field
					if (nextDelim !== -1 && (nextDelim < nextNewline || nextNewline === -1)) {
						row.push(input.substring(cursor, nextDelim));
						cursor = nextDelim + delimLen;
						nextDelim = input.indexOf(delim, cursor);
						continue;
					}
	
					// End of row
					if (nextNewline !== -1) {
						row.push(input.substring(cursor, nextNewline));
						saveRow(nextNewline + newlineLen);
	
						if (stepIsFunction) {
							doStep();
							if (aborted) return returnable();
						}
	
						if (preview && data.length >= preview) return returnable(true);
	
						continue;
					}
	
					break;
				}
	
				return finish();
	
				function pushRow(row) {
					data.push(row);
					lastCursor = cursor;
				}
	
				/**
	    * Appends the remaining input from cursor to the end into
	    * row, saves the row, calls step, and returns the results.
	    */
				function finish(value) {
					if (ignoreLastRow) return returnable();
					if (typeof value === 'undefined') value = input.substr(cursor);
					row.push(value);
					cursor = inputLen; // important in case parsing is paused
					pushRow(row);
					if (stepIsFunction) doStep();
					return returnable();
				}
	
				/**
	    * Appends the current row to the results. It sets the cursor
	    * to newCursor and finds the nextNewline. The caller should
	    * take care to execute user's step function and check for
	    * preview and end parsing if necessary.
	    */
				function saveRow(newCursor) {
					cursor = newCursor;
					pushRow(row);
					row = [];
					nextNewline = input.indexOf(newline, cursor);
				}
	
				/** Returns an object with the results, errors, and meta. */
				function returnable(stopped) {
					return {
						data: data,
						errors: errors,
						meta: {
							delimiter: delim,
							linebreak: newline,
							aborted: aborted,
							truncated: !!stopped,
							cursor: lastCursor + (baseIndex || 0)
						}
					};
				}
	
				/** Executes the user's step function and resets data & errors. */
				function doStep() {
					step(returnable());
					data = [], errors = [];
				}
			};
	
			/** Sets the abort flag */
			this.abort = function () {
				aborted = true;
			};
	
			/** Gets the cursor position */
			this.getCharIndex = function () {
				return cursor;
			};
		}
	
		// If you need to load Papa Parse asynchronously and you also need worker threads, hard-code
		// the script path here. See: https://github.com/mholt/PapaParse/issues/87#issuecomment-57885358
		function getScriptPath() {
			var scripts = document.getElementsByTagName('script');
			return scripts.length ? scripts[scripts.length - 1].src : '';
		}
	
		function newWorker() {
			if (!Papa.WORKERS_SUPPORTED) return false;
			if (!LOADED_SYNC && Papa.SCRIPT_PATH === null) throw new Error('Script path cannot be determined automatically when Papa Parse is loaded asynchronously. ' + 'You need to set Papa.SCRIPT_PATH manually.');
			var workerUrl = Papa.SCRIPT_PATH || AUTO_SCRIPT_PATH;
			// Append 'papaworker' to the search string to tell papaparse that this is our worker.
			workerUrl += (workerUrl.indexOf('?') !== -1 ? '&' : '?') + 'papaworker';
			var w = new global.Worker(workerUrl);
			w.onmessage = mainThreadReceivedMessage;
			w.id = workerIdCounter++;
			workers[w.id] = w;
			return w;
		}
	
		/** Callback when main thread receives a message */
		function mainThreadReceivedMessage(e) {
			var msg = e.data;
			var worker = workers[msg.workerId];
			var aborted = false;
	
			if (msg.error) worker.userError(msg.error, msg.file);else if (msg.results && msg.results.data) {
				var abort = function abort() {
					aborted = true;
					completeWorker(msg.workerId, { data: [], errors: [], meta: { aborted: true } });
				};
	
				var handle = {
					abort: abort,
					pause: notImplemented,
					resume: notImplemented
				};
	
				if (isFunction(worker.userStep)) {
					for (var i = 0; i < msg.results.data.length; i++) {
						worker.userStep({
							data: [msg.results.data[i]],
							errors: msg.results.errors,
							meta: msg.results.meta
						}, handle);
						if (aborted) break;
					}
					delete msg.results; // free memory ASAP
				} else if (isFunction(worker.userChunk)) {
					worker.userChunk(msg.results, handle, msg.file);
					delete msg.results;
				}
			}
	
			if (msg.finished && !aborted) completeWorker(msg.workerId, msg.results);
		}
	
		function completeWorker(workerId, results) {
			var worker = workers[workerId];
			if (isFunction(worker.userComplete)) worker.userComplete(results);
			worker.terminate();
			delete workers[workerId];
		}
	
		function notImplemented() {
			throw 'Not implemented.';
		}
	
		/** Callback when worker thread receives a message */
		function workerThreadReceivedMessage(e) {
			var msg = e.data;
	
			if (typeof Papa.WORKER_ID === 'undefined' && msg) Papa.WORKER_ID = msg.workerId;
	
			if (typeof msg.input === 'string') {
				global.postMessage({
					workerId: Papa.WORKER_ID,
					results: Papa.parse(msg.input, msg.config),
					finished: true
				});
			} else if (global.File && msg.input instanceof File || msg.input instanceof Object) // thank you, Safari (see issue #106)
				{
					var results = Papa.parse(msg.input, msg.config);
					if (results) global.postMessage({
						workerId: Papa.WORKER_ID,
						results: results,
						finished: true
					});
				}
		}
	
		/** Makes a deep copy of an array or object (mostly) */
		function copy(obj) {
			if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object') return obj;
			var cpy = obj instanceof Array ? [] : {};
			for (var key in obj) {
				cpy[key] = copy(obj[key]);
			}return cpy;
		}
	
		function bindFunction(f, self) {
			return function () {
				f.apply(self, arguments);
			};
		}
	
		function isFunction(func) {
			return typeof func === 'function';
		}
	
		return Papa;
	});

/***/ }
/******/ ]);
//# sourceMappingURL=vizabi-ddfcsv-reader.js.map