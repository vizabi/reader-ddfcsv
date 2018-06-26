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
	                onFileRead(filePath + " read error: " + err);
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
	
	        _this.name = 'DdfCsvError';
	        _this.message = message + " [filepath: " + file + "]. " + details + ".";
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
	var tslib_1 = __webpack_require__(5);
	var ddf_csv_1 = __webpack_require__(6);
	function prepareDDFCsvReaderObject(defaultFileReader) {
	    return function (externalFileReader, logger) {
	        return {
	            init: function init(readerInfo) {
	                this._basepath = readerInfo.path;
	                this._lastModified = readerInfo._lastModified;
	                this.fileReader = externalFileReader || defaultFileReader;
	                this.logger = logger;
	                this.resultTransformer = readerInfo.resultTransformer;
	                this.reader = ddf_csv_1.ddfCsvReader(this._basepath, this.fileReader, this.logger);
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
	            read: function read(queryParam, parsers) {
	                return tslib_1.__awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
	                    var result;
	                    return regeneratorRuntime.wrap(function _callee$(_context) {
	                        while (1) {
	                            switch (_context.prev = _context.next) {
	                                case 0:
	                                    result = void 0;
	                                    _context.prev = 1;
	                                    _context.next = 4;
	                                    return this.reader.query(queryParam);
	
	                                case 4:
	                                    result = _context.sent;
	
	                                    result = parsers ? this._prettifyData(result, parsers) : result;
	                                    if (this.resultTransformer) {
	                                        result = this.resultTransformer(result);
	                                    }
	                                    if (this.logger && this.logger.log) {
	                                        logger.log(JSON.stringify(queryParam), result.length);
	                                        logger.log(result);
	                                    }
	                                    _context.next = 13;
	                                    break;
	
	                                case 10:
	                                    _context.prev = 10;
	                                    _context.t0 = _context["catch"](1);
	                                    throw _context.t0;
	
	                                case 13:
	                                    return _context.abrupt("return", result);
	
	                                case 14:
	                                case "end":
	                                    return _context.stop();
	                            }
	                        }
	                    }, _callee, this, [[1, 10]]);
	                }));
	            },
	            _prettifyData: function _prettifyData(data, parsers) {
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
	        };
	    };
	}
	exports.prepareDDFCsvReaderObject = prepareDDFCsvReaderObject;
	//# sourceMappingURL=ddfcsv-reader.js.map

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(global) {"use strict";
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	/*! *****************************************************************************
	Copyright (c) Microsoft Corporation. All rights reserved.
	Licensed under the Apache License, Version 2.0 (the "License"); you may not use
	this file except in compliance with the License. You may obtain a copy of the
	License at http://www.apache.org/licenses/LICENSE-2.0
	
	THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
	WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
	MERCHANTABLITY OR NON-INFRINGEMENT.
	
	See the Apache Version 2.0 License for specific language governing permissions
	and limitations under the License.
	***************************************************************************** */
	/* global global, define, System, Reflect, Promise */
	var __extends;
	var __assign;
	var __rest;
	var __decorate;
	var __param;
	var __metadata;
	var __awaiter;
	var __generator;
	var __exportStar;
	var __values;
	var __read;
	var __spread;
	var _await;
	var __asyncGenerator;
	var __asyncDelegator;
	var __asyncValues;
	var __makeTemplateObject;
	var __importStar;
	var __importDefault;
	(function (factory) {
	    var root = (typeof global === "undefined" ? "undefined" : _typeof(global)) === "object" ? global : (typeof self === "undefined" ? "undefined" : _typeof(self)) === "object" ? self : _typeof(this) === "object" ? this : {};
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports], __WEBPACK_AMD_DEFINE_RESULT__ = function (exports) {
	            factory(createExporter(root, createExporter(exports)));
	        }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    } else if ((typeof module === "undefined" ? "undefined" : _typeof(module)) === "object" && _typeof(module.exports) === "object") {
	        factory(createExporter(root, createExporter(module.exports)));
	    } else {
	        factory(createExporter(root));
	    }
	    function createExporter(exports, previous) {
	        if (exports !== root) {
	            if (typeof Object.create === "function") {
	                Object.defineProperty(exports, "__esModule", { value: true });
	            } else {
	                exports.__esModule = true;
	            }
	        }
	        return function (id, v) {
	            return exports[id] = previous ? previous(id, v) : v;
	        };
	    }
	})(function (exporter) {
	    var extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
	        d.__proto__ = b;
	    } || function (d, b) {
	        for (var p in b) {
	            if (b.hasOwnProperty(p)) d[p] = b[p];
	        }
	    };
	
	    __extends = function __extends(d, b) {
	        extendStatics(d, b);
	        function __() {
	            this.constructor = d;
	        }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	
	    __assign = Object.assign || function (t) {
	        for (var s, i = 1, n = arguments.length; i < n; i++) {
	            s = arguments[i];
	            for (var p in s) {
	                if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
	            }
	        }
	        return t;
	    };
	
	    __rest = function __rest(s, e) {
	        var t = {};
	        for (var p in s) {
	            if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
	        }if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
	            if (e.indexOf(p[i]) < 0) t[p[i]] = s[p[i]];
	        }return t;
	    };
	
	    __decorate = function __decorate(decorators, target, key, desc) {
	        var c = arguments.length,
	            r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
	            d;
	        if ((typeof Reflect === "undefined" ? "undefined" : _typeof(Reflect)) === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) {
	            if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	        }return c > 3 && r && Object.defineProperty(target, key, r), r;
	    };
	
	    __param = function __param(paramIndex, decorator) {
	        return function (target, key) {
	            decorator(target, key, paramIndex);
	        };
	    };
	
	    __metadata = function __metadata(metadataKey, metadataValue) {
	        if ((typeof Reflect === "undefined" ? "undefined" : _typeof(Reflect)) === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
	    };
	
	    __awaiter = function __awaiter(thisArg, _arguments, P, generator) {
	        return new (P || (P = Promise))(function (resolve, reject) {
	            function fulfilled(value) {
	                try {
	                    step(generator.next(value));
	                } catch (e) {
	                    reject(e);
	                }
	            }
	            function rejected(value) {
	                try {
	                    step(generator["throw"](value));
	                } catch (e) {
	                    reject(e);
	                }
	            }
	            function step(result) {
	                result.done ? resolve(result.value) : new P(function (resolve) {
	                    resolve(result.value);
	                }).then(fulfilled, rejected);
	            }
	            step((generator = generator.apply(thisArg, _arguments || [])).next());
	        });
	    };
	
	    __generator = function __generator(thisArg, body) {
	        var _ = { label: 0, sent: function sent() {
	                if (t[0] & 1) throw t[1];return t[1];
	            }, trys: [], ops: [] },
	            f,
	            y,
	            t,
	            g;
	        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
	            return this;
	        }), g;
	        function verb(n) {
	            return function (v) {
	                return step([n, v]);
	            };
	        }
	        function step(op) {
	            if (f) throw new TypeError("Generator is already executing.");
	            while (_) {
	                try {
	                    if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
	                    if (y = 0, t) op = [op[0] & 2, t.value];
	                    switch (op[0]) {
	                        case 0:case 1:
	                            t = op;break;
	                        case 4:
	                            _.label++;return { value: op[1], done: false };
	                        case 5:
	                            _.label++;y = op[1];op = [0];continue;
	                        case 7:
	                            op = _.ops.pop();_.trys.pop();continue;
	                        default:
	                            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
	                                _ = 0;continue;
	                            }
	                            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
	                                _.label = op[1];break;
	                            }
	                            if (op[0] === 6 && _.label < t[1]) {
	                                _.label = t[1];t = op;break;
	                            }
	                            if (t && _.label < t[2]) {
	                                _.label = t[2];_.ops.push(op);break;
	                            }
	                            if (t[2]) _.ops.pop();
	                            _.trys.pop();continue;
	                    }
	                    op = body.call(thisArg, _);
	                } catch (e) {
	                    op = [6, e];y = 0;
	                } finally {
	                    f = t = 0;
	                }
	            }if (op[0] & 5) throw op[1];return { value: op[0] ? op[1] : void 0, done: true };
	        }
	    };
	
	    __exportStar = function __exportStar(m, exports) {
	        for (var p in m) {
	            if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	        }
	    };
	
	    __values = function __values(o) {
	        var m = typeof Symbol === "function" && o[Symbol.iterator],
	            i = 0;
	        if (m) return m.call(o);
	        return {
	            next: function next() {
	                if (o && i >= o.length) o = void 0;
	                return { value: o && o[i++], done: !o };
	            }
	        };
	    };
	
	    __read = function __read(o, n) {
	        var m = typeof Symbol === "function" && o[Symbol.iterator];
	        if (!m) return o;
	        var i = m.call(o),
	            r,
	            ar = [],
	            e;
	        try {
	            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) {
	                ar.push(r.value);
	            }
	        } catch (error) {
	            e = { error: error };
	        } finally {
	            try {
	                if (r && !r.done && (m = i["return"])) m.call(i);
	            } finally {
	                if (e) throw e.error;
	            }
	        }
	        return ar;
	    };
	
	    __spread = function __spread() {
	        for (var ar = [], i = 0; i < arguments.length; i++) {
	            ar = ar.concat(__read(arguments[i]));
	        }return ar;
	    };
	
	    _await = function __await(v) {
	        return this instanceof _await ? (this.v = v, this) : new _await(v);
	    };
	
	    __asyncGenerator = function __asyncGenerator(thisArg, _arguments, generator) {
	        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
	        var g = generator.apply(thisArg, _arguments || []),
	            i,
	            q = [];
	        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () {
	            return this;
	        }, i;
	        function verb(n) {
	            if (g[n]) i[n] = function (v) {
	                return new Promise(function (a, b) {
	                    q.push([n, v, a, b]) > 1 || resume(n, v);
	                });
	            };
	        }
	        function resume(n, v) {
	            try {
	                step(g[n](v));
	            } catch (e) {
	                settle(q[0][3], e);
	            }
	        }
	        function step(r) {
	            r.value instanceof _await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
	        }
	        function fulfill(value) {
	            resume("next", value);
	        }
	        function reject(value) {
	            resume("throw", value);
	        }
	        function settle(f, v) {
	            if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]);
	        }
	    };
	
	    __asyncDelegator = function __asyncDelegator(o) {
	        var i, p;
	        return i = {}, verb("next"), verb("throw", function (e) {
	            throw e;
	        }), verb("return"), i[Symbol.iterator] = function () {
	            return this;
	        }, i;
	        function verb(n, f) {
	            i[n] = o[n] ? function (v) {
	                return (p = !p) ? { value: _await(o[n](v)), done: n === "return" } : f ? f(v) : v;
	            } : f;
	        }
	    };
	
	    __asyncValues = function __asyncValues(o) {
	        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
	        var m = o[Symbol.asyncIterator],
	            i;
	        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () {
	            return this;
	        }, i);
	        function verb(n) {
	            i[n] = o[n] && function (v) {
	                return new Promise(function (resolve, reject) {
	                    v = o[n](v), settle(resolve, reject, v.done, v.value);
	                });
	            };
	        }
	        function settle(resolve, reject, d, v) {
	            Promise.resolve(v).then(function (v) {
	                resolve({ value: v, done: d });
	            }, reject);
	        }
	    };
	
	    __makeTemplateObject = function __makeTemplateObject(cooked, raw) {
	        if (Object.defineProperty) {
	            Object.defineProperty(cooked, "raw", { value: raw });
	        } else {
	            cooked.raw = raw;
	        }
	        return cooked;
	    };
	
	    __importStar = function __importStar(mod) {
	        if (mod && mod.__esModule) return mod;
	        var result = {};
	        if (mod != null) for (var k in mod) {
	            if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
	        }result["default"] = mod;
	        return result;
	    };
	
	    __importDefault = function __importDefault(mod) {
	        return mod && mod.__esModule ? mod : { "default": mod };
	    };
	
	    exporter("__extends", __extends);
	    exporter("__assign", __assign);
	    exporter("__rest", __rest);
	    exporter("__decorate", __decorate);
	    exporter("__param", __param);
	    exporter("__metadata", __metadata);
	    exporter("__awaiter", __awaiter);
	    exporter("__generator", __generator);
	    exporter("__exportStar", __exportStar);
	    exporter("__values", __values);
	    exporter("__read", __read);
	    exporter("__spread", __spread);
	    exporter("__await", _await);
	    exporter("__asyncGenerator", __asyncGenerator);
	    exporter("__asyncDelegator", __asyncDelegator);
	    exporter("__asyncValues", __asyncValues);
	    exporter("__makeTemplateObject", __makeTemplateObject);
	    exporter("__importStar", __importStar);
	    exporter("__importDefault", __importDefault);
	});
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	Object.defineProperty(exports, "__esModule", { value: true });
	var tslib_1 = __webpack_require__(5);
	var includes = __webpack_require__(7);
	var isEmpty = __webpack_require__(49);
	var query_optimization_plugins_1 = __webpack_require__(62);
	var ddfcsv_error_1 = __webpack_require__(3);
	var ddf_query_validator_1 = __webpack_require__(108);
	var Papa = __webpack_require__(107);
	var isValidNumeric = function isValidNumeric(val) {
	    return typeof val !== 'number' && !val ? false : true;
	};
	function ddfCsvReader(basePath, fileReader, logger) {
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
	    var baseOptions = {
	        basePath: basePath,
	        conceptsLookup: new Map(),
	        datapackagePath: '',
	        datasetPath: '',
	        dataset: ''
	    };
	    var keyValueLookup = new Map();
	    var resourcesLookup = new Map();
	    var optimalFilesSet = [];
	    function loadDataPackage(datapackagePath) {
	        return new Promise(function (resolve, reject) {
	            fileReader.readText(datapackagePath, function (err, data) {
	                if (err) {
	                    return reject(new ddfcsv_error_1.DdfCsvError(ddfcsv_error_1.FILE_READING_ERROR, err, datapackagePath));
	                }
	                var datapackage = void 0;
	                try {
	                    datapackage = JSON.parse(data);
	                    optimalFilesSet = [];
	                    buildResourcesLookup(datapackage);
	                    buildKeyValueLookup(datapackage);
	                } catch (parseErr) {
	                    return reject(new ddfcsv_error_1.DdfCsvError(ddfcsv_error_1.JSON_PARSING_ERROR, parseErr.message, datapackagePath));
	                }
	                resolve(datapackage);
	            });
	        });
	    }
	    function loadConcepts(queryParam, options) {
	        return tslib_1.__awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
	            var conceptQuery, result, concepts;
	            return regeneratorRuntime.wrap(function _callee$(_context) {
	                while (1) {
	                    switch (_context.prev = _context.next) {
	                        case 0:
	                            setConceptsLookup(internalConcepts, options);
	                            conceptQuery = {
	                                select: { key: ['concept'], value: ['concept_type', 'domain'] },
	                                from: 'concepts',
	                                dataset: queryParam.dataset,
	                                branch: queryParam.branch,
	                                commit: queryParam.commit
	                            };
	                            result = void 0;
	                            _context.prev = 3;
	                            _context.next = 6;
	                            return queryData(conceptQuery, options);
	
	                        case 6:
	                            concepts = _context.sent;
	
	                            buildConceptsLookup(concepts, options);
	                            _context.next = 10;
	                            return reparseConcepts(options);
	
	                        case 10:
	                            result = _context.sent;
	                            _context.next = 16;
	                            break;
	
	                        case 13:
	                            _context.prev = 13;
	                            _context.t0 = _context["catch"](3);
	                            throw _context.t0;
	
	                        case 16:
	                            return _context.abrupt("return", result);
	
	                        case 17:
	                        case "end":
	                            return _context.stop();
	                    }
	                }
	            }, _callee, this, [[3, 13]]);
	        }));
	    }
	    function buildConceptsLookup(concepts, options) {
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
	        setConceptsLookup(concepts, options);
	    }
	    function reparseConcepts(_ref) {
	        var conceptsLookup = _ref.conceptsLookup;
	
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
	    function setConceptsLookup(concepts, options) {
	        options.conceptsLookup.clear();
	        concepts.forEach(function (row) {
	            return options.conceptsLookup.set(row.concept, row);
	        });
	    }
	    function query(queryParam) {
	        return tslib_1.__awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
	            var data, datapackage, appropriatePlugin, files;
	            return regeneratorRuntime.wrap(function _callee2$(_context2) {
	                while (1) {
	                    switch (_context2.prev = _context2.next) {
	                        case 0:
	                            data = void 0;
	                            _context2.prev = 1;
	
	                            baseOptions.fileReader = fileReader;
	                            _context2.next = 5;
	                            return ddf_query_validator_1.validateQueryStructure(queryParam, baseOptions);
	
	                        case 5:
	                            _context2.next = 7;
	                            return ddf_query_validator_1.validateQueryAvailability(queryParam, baseOptions);
	
	                        case 7:
	                            _context2.next = 9;
	                            return ddf_query_validator_1.extendQueryParamWithDatasetProps(queryParam, baseOptions);
	
	                        case 9:
	                            _context2.next = 11;
	                            return loadDataPackage(baseOptions.datapackagePath);
	
	                        case 11:
	                            datapackage = _context2.sent;
	
	                            baseOptions.datapackage = datapackage;
	                            _context2.next = 15;
	                            return loadConcepts(queryParam, baseOptions);
	
	                        case 15:
	                            _context2.next = 17;
	                            return ddf_query_validator_1.validateQueryDefinitions(queryParam, baseOptions);
	
	                        case 17:
	                            if (!ddf_query_validator_1.isSchemaQuery(queryParam)) {
	                                _context2.next = 23;
	                                break;
	                            }
	
	                            _context2.next = 20;
	                            return querySchema(queryParam, { datapackage: datapackage });
	
	                        case 20:
	                            data = _context2.sent;
	                            _context2.next = 33;
	                            break;
	
	                        case 23:
	                            appropriatePlugin = query_optimization_plugins_1.getAppropriatePlugin(queryParam, baseOptions);
	
	                            if (!appropriatePlugin) {
	                                _context2.next = 30;
	                                break;
	                            }
	
	                            optimalFilesSet = [];
	                            _context2.next = 28;
	                            return appropriatePlugin.getOptimalFilesSet();
	
	                        case 28:
	                            files = _context2.sent;
	
	                            optimalFilesSet = files;
	
	                        case 30:
	                            _context2.next = 32;
	                            return queryData(queryParam, baseOptions);
	
	                        case 32:
	                            data = _context2.sent;
	
	                        case 33:
	                            _context2.next = 38;
	                            break;
	
	                        case 35:
	                            _context2.prev = 35;
	                            _context2.t0 = _context2["catch"](1);
	                            throw _context2.t0;
	
	                        case 38:
	                            return _context2.abrupt("return", data);
	
	                        case 39:
	                        case "end":
	                            return _context2.stop();
	                    }
	                }
	            }, _callee2, this, [[1, 35]]);
	        }));
	    }
	    function queryData(queryParam, options) {
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
	        var resourcesPromise = loadResources(select.key, [].concat(_toConsumableArray(select.value), _toConsumableArray(filterFields)), language, options);
	        var joinsPromise = getJoinFilters(join, queryParam, options);
	        var entitySetFilterPromise = getEntitySetFilter(select.key, queryParam, options);
	        return Promise.all([resourcesPromise, entitySetFilterPromise, joinsPromise]).then(function (_ref2) {
	            var _ref3 = _slicedToArray(_ref2, 3),
	                resourceResponses = _ref3[0],
	                entitySetFilter = _ref3[1],
	                joinFilters = _ref3[2];
	
	            var whereResolved = processWhere(where, joinFilters);
	            var filter = mergeFilters(entitySetFilter, whereResolved);
	            var dataTables = resourceResponses.map(function (response) {
	                return processResourceResponse(response, select, filterFields, options);
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
	    function querySchema(queryParam, _ref4) {
	        var datapackage = _ref4.datapackage;
	
	        var getSchemaFromCollection = function getSchemaFromCollection(collectionPar) {
	            return datapackage.ddfSchema[collectionPar].map(function (_ref5) {
	                var primaryKey = _ref5.primaryKey,
	                    value = _ref5.value;
	                return { key: primaryKey, value: value };
	            });
	        };
	        var collection = queryParam.from.split('.')[0];
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
	    function getJoinFilters(join, queryParam, options) {
	        return Promise.all(Object.keys(join).map(function (joinID) {
	            return getJoinFilter(joinID, join[joinID], queryParam, options);
	        })).then(function (results) {
	            return results.reduce(mergeObjects, {});
	        });
	    }
	    function mergeObjects(a, b) {
	        return Object.assign(a, b);
	    }
	    function getJoinFilter(joinID, join, queryParam, options) {
	        if (options.conceptsLookup.get(join.key).concept_type === 'time') {
	            return Promise.resolve(_defineProperty({}, joinID, join.where));
	        } else {
	            return query({
	                select: { key: [join.key] },
	                where: join.where,
	                from: options.conceptsLookup.has(join.key) ? 'concepts' : 'entities',
	                dataset: queryParam.dataset,
	                branch: queryParam.branch,
	                commit: queryParam.commit
	            }).then(function (result) {
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
	    function filterConceptsByType(conceptTypes, queryKey, options) {
	        var conceptStrings = queryKey || Array.from(options.conceptsLookup.keys());
	        var concepts = [];
	        var _iteratorNormalCompletion3 = true;
	        var _didIteratorError3 = false;
	        var _iteratorError3 = undefined;
	
	        try {
	            for (var _iterator3 = conceptStrings[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
	                var conceptString = _step3.value;
	
	                var concept = options.conceptsLookup.get(conceptString);
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
	    function getEntityConceptRenameMap(queryKey, resourceKey, options) {
	        var resourceKeySet = new Set(resourceKey);
	        var entityConceptTypes = ['entity_set', 'entity_domain'];
	        var queryEntityConcepts = filterConceptsByType(entityConceptTypes, queryKey, options);
	        if (queryEntityConcepts.length === 0) {
	            return new Map();
	        }
	        var allEntityConcepts = filterConceptsByType(entityConceptTypes, null, options);
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
	    function getEntitySetFilter(conceptStrings, queryParam, options) {
	        var promises = filterConceptsByType(['entity_set'], conceptStrings, options).map(function (concept) {
	            return query({
	                select: { key: [concept.domain], value: ['is--' + concept.concept] },
	                from: 'entities',
	                dataset: queryParam.dataset,
	                branch: queryParam.branch,
	                commit: queryParam.commit
	            }).then(function (result) {
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
	    function processResourceResponse(response, select, filterFields, options) {
	        var resourcePK = response.resource.schema.primaryKey;
	        var resourceProjection = new Set([].concat(_toConsumableArray(resourcePK), _toConsumableArray(select.value), _toConsumableArray(filterFields)));
	        var renameMap = getEntityConceptRenameMap(select.key, resourcePK, options);
	        return response.data.map(function (row) {
	            return projectRow(row, resourceProjection);
	        }).map(function (row) {
	            return renameHeaderRow(row, renameMap);
	        });
	    }
	    function loadResources(key, value, language, options) {
	        var resources = getResources(key, value);
	        return Promise.all([].concat(_toConsumableArray(resources)).map(function (resource) {
	            return loadResource(resource, language, options);
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
	    function loadResource(resource, language, options) {
	        var filePromises = [];
	        if (typeof resource.data === 'undefined') {
	            resource.data = loadFile(options.datasetPath + '/' + resource.path, options);
	        }
	        filePromises.push(resource.data);
	        var languageValid = typeof language !== 'undefined' && getLanguages(options).includes(language);
	        var languageLoaded = typeof resource.translations[language] !== 'undefined';
	        if (languageValid) {
	            if (!languageLoaded) {
	                var translationPath = options.datasetPath + "/lang/" + language + "/" + resource.path;
	                resource.translations[language] = loadFile(translationPath, options).catch(function (err) {
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
	    function getLanguages(_ref8) {
	        var datapackage = _ref8.datapackage;
	
	        if (!datapackage.translations) {
	            return [];
	        }
	        return datapackage.translations.map(function (lang) {
	            return lang.id;
	        });
	    }
	    function loadFile(filePath, options) {
	        return new Promise(function (resolve, reject) {
	            fileReader.readText(filePath, function (err, data) {
	                if (err) {
	                    return reject(new ddfcsv_error_1.DdfCsvError(ddfcsv_error_1.FILE_READING_ERROR, err, filePath));
	                }
	                Papa.parse(data, {
	                    header: true,
	                    skipEmptyLines: true,
	                    dynamicTyping: function dynamicTyping(headerName) {
	                        if (!options.conceptsLookup) {
	                            return true;
	                        }
	                        var concept = options.conceptsLookup.get(headerName) || {};
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
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseIndexOf = __webpack_require__(8),
	    isArrayLike = __webpack_require__(12),
	    isString = __webpack_require__(22),
	    toInteger = __webpack_require__(25),
	    values = __webpack_require__(29);
	
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
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseFindIndex = __webpack_require__(9),
	    baseIsNaN = __webpack_require__(10),
	    strictIndexOf = __webpack_require__(11);
	
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
/* 9 */
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
/* 10 */
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
/* 11 */
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
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var isFunction = __webpack_require__(13),
	    isLength = __webpack_require__(21);
	
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
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseGetTag = __webpack_require__(14),
	    isObject = __webpack_require__(20);
	
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
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _Symbol = __webpack_require__(15),
	    getRawTag = __webpack_require__(18),
	    objectToString = __webpack_require__(19);
	
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
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var root = __webpack_require__(16);
	
	/** Built-in value references. */
	var _Symbol = root.Symbol;
	
	module.exports = _Symbol;

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var freeGlobal = __webpack_require__(17);
	
	/** Detect free variable `self`. */
	var freeSelf = (typeof self === 'undefined' ? 'undefined' : _typeof(self)) == 'object' && self && self.Object === Object && self;
	
	/** Used as a reference to the global object. */
	var root = freeGlobal || freeSelf || Function('return this')();
	
	module.exports = root;

/***/ },
/* 17 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	/** Detect free variable `global` from Node.js. */
	var freeGlobal = (typeof global === 'undefined' ? 'undefined' : _typeof(global)) == 'object' && global && global.Object === Object && global;
	
	module.exports = freeGlobal;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _Symbol = __webpack_require__(15);
	
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
/* 19 */
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
/* 20 */
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
/* 21 */
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
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseGetTag = __webpack_require__(14),
	    isArray = __webpack_require__(23),
	    isObjectLike = __webpack_require__(24);
	
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
/* 23 */
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
/* 24 */
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
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var toFinite = __webpack_require__(26);
	
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
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var toNumber = __webpack_require__(27);
	
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
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var isObject = __webpack_require__(20),
	    isSymbol = __webpack_require__(28);
	
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
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var baseGetTag = __webpack_require__(14),
	    isObjectLike = __webpack_require__(24);
	
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
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseValues = __webpack_require__(30),
	    keys = __webpack_require__(32);
	
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
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var arrayMap = __webpack_require__(31);
	
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
/* 31 */
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
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var arrayLikeKeys = __webpack_require__(33),
	    baseKeys = __webpack_require__(45),
	    isArrayLike = __webpack_require__(12);
	
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
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseTimes = __webpack_require__(34),
	    isArguments = __webpack_require__(35),
	    isArray = __webpack_require__(23),
	    isBuffer = __webpack_require__(37),
	    isIndex = __webpack_require__(40),
	    isTypedArray = __webpack_require__(41);
	
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
/* 34 */
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
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseIsArguments = __webpack_require__(36),
	    isObjectLike = __webpack_require__(24);
	
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
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseGetTag = __webpack_require__(14),
	    isObjectLike = __webpack_require__(24);
	
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
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var root = __webpack_require__(16),
	    stubFalse = __webpack_require__(39);
	
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
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(38)(module)))

/***/ },
/* 38 */
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
/* 39 */
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
/* 40 */
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
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseIsTypedArray = __webpack_require__(42),
	    baseUnary = __webpack_require__(43),
	    nodeUtil = __webpack_require__(44);
	
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
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseGetTag = __webpack_require__(14),
	    isLength = __webpack_require__(21),
	    isObjectLike = __webpack_require__(24);
	
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
/* 43 */
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
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var freeGlobal = __webpack_require__(17);
	
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
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(38)(module)))

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var isPrototype = __webpack_require__(46),
	    nativeKeys = __webpack_require__(47);
	
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
/* 46 */
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
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var overArg = __webpack_require__(48);
	
	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeKeys = overArg(Object.keys, Object);
	
	module.exports = nativeKeys;

/***/ },
/* 48 */
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
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseKeys = __webpack_require__(45),
	    getTag = __webpack_require__(50),
	    isArguments = __webpack_require__(35),
	    isArray = __webpack_require__(23),
	    isArrayLike = __webpack_require__(12),
	    isBuffer = __webpack_require__(37),
	    isPrototype = __webpack_require__(46),
	    isTypedArray = __webpack_require__(41);
	
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
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var DataView = __webpack_require__(51),
	    Map = __webpack_require__(58),
	    Promise = __webpack_require__(59),
	    Set = __webpack_require__(60),
	    WeakMap = __webpack_require__(61),
	    baseGetTag = __webpack_require__(14),
	    toSource = __webpack_require__(56);
	
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
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var getNative = __webpack_require__(52),
	    root = __webpack_require__(16);
	
	/* Built-in method references that are verified to be native. */
	var DataView = getNative(root, 'DataView');
	
	module.exports = DataView;

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseIsNative = __webpack_require__(53),
	    getValue = __webpack_require__(57);
	
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
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var isFunction = __webpack_require__(13),
	    isMasked = __webpack_require__(54),
	    isObject = __webpack_require__(20),
	    toSource = __webpack_require__(56);
	
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
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var coreJsData = __webpack_require__(55);
	
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
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var root = __webpack_require__(16);
	
	/** Used to detect overreaching core-js shims. */
	var coreJsData = root['__core-js_shared__'];
	
	module.exports = coreJsData;

/***/ },
/* 56 */
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
/* 57 */
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
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var getNative = __webpack_require__(52),
	    root = __webpack_require__(16);
	
	/* Built-in method references that are verified to be native. */
	var Map = getNative(root, 'Map');
	
	module.exports = Map;

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var getNative = __webpack_require__(52),
	    root = __webpack_require__(16);
	
	/* Built-in method references that are verified to be native. */
	var Promise = getNative(root, 'Promise');
	
	module.exports = Promise;

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var getNative = __webpack_require__(52),
	    root = __webpack_require__(16);
	
	/* Built-in method references that are verified to be native. */
	var Set = getNative(root, 'Set');
	
	module.exports = Set;

/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var getNative = __webpack_require__(52),
	    root = __webpack_require__(16);
	
	/* Built-in method references that are verified to be native. */
	var WeakMap = getNative(root, 'WeakMap');
	
	module.exports = WeakMap;

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", { value: true });
	var in_clause_under_conjunction_plugin_1 = __webpack_require__(63);
	var head = __webpack_require__(66);
	function getAppropriatePlugin(queryParam, options) {
	    var plugins = [new in_clause_under_conjunction_plugin_1.InClauseUnderConjunctionPlugin(queryParam, options)];
	    return head(plugins.filter(function (plugin) {
	        return plugin.isMatched();
	    }));
	}
	exports.getAppropriatePlugin = getAppropriatePlugin;
	//# sourceMappingURL=index.js.map

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	Object.defineProperty(exports, "__esModule", { value: true });
	var tslib_1 = __webpack_require__(5);
	var path = __webpack_require__(64);
	var head = __webpack_require__(66);
	var values = __webpack_require__(29);
	var keys = __webpack_require__(32);
	var get = __webpack_require__(67);
	var flattenDeep = __webpack_require__(100);
	var isEmpty = __webpack_require__(49);
	var startsWith = __webpack_require__(104);
	var includes = __webpack_require__(7);
	var compact = __webpack_require__(106);
	var ddfcsv_error_1 = __webpack_require__(3);
	var Papa = __webpack_require__(107);
	var WHERE_KEYWORD = 'where';
	var JOIN_KEYWORD = 'join';
	var KEY_KEYWORD = 'key';
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
	    function InClauseUnderConjunctionPlugin(queryParam, options) {
	        _classCallCheck(this, InClauseUnderConjunctionPlugin);
	
	        this.flow = {};
	        this.fileReader = options.fileReader;
	        this.datasetPath = options.datasetPath;
	        this.query = queryParam;
	        this.datapackage = options.datapackage;
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
	
	                    var joinPart = get(this.flow.joinObject, key, {});
	                    var firstKey = getFirstKey(joinPart[WHERE_KEYWORD]);
	                    if (joinPart[KEY_KEYWORD] !== firstKey && firstKey !== KEY_AND) {
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
	            return tslib_1.__awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
	                var result, data;
	                return regeneratorRuntime.wrap(function _callee$(_context) {
	                    while (1) {
	                        switch (_context.prev = _context.next) {
	                            case 0:
	                                if (!this.isMatched()) {
	                                    _context.next = 20;
	                                    break;
	                                }
	
	                                result = void 0;
	                                _context.prev = 2;
	
	                                this.fillResourceToFileHash();
	                                this.collectProcessableClauses();
	                                this.collectEntityFilesNames();
	                                _context.next = 8;
	                                return this.collectEntities();
	
	                            case 8:
	                                data = _context.sent;
	
	                                this.fillEntityValuesHash(data);
	                                this.getFilesGroupsQueryClause();
	                                result = this.getOptimalFilesGroup();
	                                _context.next = 17;
	                                break;
	
	                            case 14:
	                                _context.prev = 14;
	                                _context.t0 = _context["catch"](2);
	                                return _context.abrupt("return", []);
	
	                            case 17:
	                                return _context.abrupt("return", result);
	
	                            case 20:
	                                throw new ddfcsv_error_1.DdfCsvError("Plugin \"InClauseUnderConjunction\" is not matched!", 'InClauseUnderConjunction plugin');
	
	                            case 21:
	                            case "end":
	                                return _context.stop();
	                        }
	                    }
	                }, _callee, this, [[2, 14]]);
	            }));
	        }
	    }, {
	        key: "fillResourceToFileHash",
	        value: function fillResourceToFileHash() {
	            this.flow.resourceToFile = get(this.datapackage, 'resources', []).reduce(function (hash, resource) {
	                hash.set(resource.name, resource.path);
	                return hash;
	            }, new Map());
	            return this;
	        }
	    }, {
	        key: "collectProcessableClauses",
	        value: function collectProcessableClauses() {
	            var _this = this;
	
	            var joinKeys = keys(this.flow.joinObject);
	            this.flow.processableClauses = [];
	            var _iteratorNormalCompletion2 = true;
	            var _didIteratorError2 = false;
	            var _iteratorError2 = undefined;
	
	            try {
	                for (var _iterator2 = joinKeys[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	                    var joinKey = _step2.value;
	
	                    var where = get(this.flow.joinObject, joinKey + "." + WHERE_KEYWORD, {});
	                    if (this.singleAndField(where)) {
	                        var _flow$processableClau;
	
	                        (_flow$processableClau = this.flow.processableClauses).push.apply(_flow$processableClau, _toConsumableArray(flattenDeep(where[KEY_AND].map(function (el) {
	                            return _this.getProcessableClauses(el);
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
	            var self = this;
	            var actions = self.flow.entityFilesNames.map(function (file) {
	                return new Promise(function (actResolve, actReject) {
	                    self.fileReader.readText(path.resolve(self.datasetPath, file), function (err, text) {
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
/* 64 */
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
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(65)))

/***/ },
/* 65 */
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
/* 66 */
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
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseGet = __webpack_require__(68);
	
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
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var castPath = __webpack_require__(69),
	    toKey = __webpack_require__(99);
	
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
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var isArray = __webpack_require__(23),
	    isKey = __webpack_require__(70),
	    stringToPath = __webpack_require__(71),
	    toString = __webpack_require__(97);
	
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
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var isArray = __webpack_require__(23),
	    isSymbol = __webpack_require__(28);
	
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
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var memoizeCapped = __webpack_require__(72);
	
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
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var memoize = __webpack_require__(73);
	
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
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var MapCache = __webpack_require__(74);
	
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
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var mapCacheClear = __webpack_require__(75),
	    mapCacheDelete = __webpack_require__(91),
	    mapCacheGet = __webpack_require__(94),
	    mapCacheHas = __webpack_require__(95),
	    mapCacheSet = __webpack_require__(96);
	
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
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Hash = __webpack_require__(76),
	    ListCache = __webpack_require__(83),
	    Map = __webpack_require__(58);
	
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
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var hashClear = __webpack_require__(77),
	    hashDelete = __webpack_require__(79),
	    hashGet = __webpack_require__(80),
	    hashHas = __webpack_require__(81),
	    hashSet = __webpack_require__(82);
	
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
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var nativeCreate = __webpack_require__(78);
	
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
/* 78 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var getNative = __webpack_require__(52);
	
	/* Built-in method references that are verified to be native. */
	var nativeCreate = getNative(Object, 'create');
	
	module.exports = nativeCreate;

/***/ },
/* 79 */
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
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var nativeCreate = __webpack_require__(78);
	
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
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var nativeCreate = __webpack_require__(78);
	
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
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var nativeCreate = __webpack_require__(78);
	
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
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var listCacheClear = __webpack_require__(84),
	    listCacheDelete = __webpack_require__(85),
	    listCacheGet = __webpack_require__(88),
	    listCacheHas = __webpack_require__(89),
	    listCacheSet = __webpack_require__(90);
	
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
/* 84 */
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
/* 85 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var assocIndexOf = __webpack_require__(86);
	
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
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var eq = __webpack_require__(87);
	
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
/* 87 */
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
/* 88 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var assocIndexOf = __webpack_require__(86);
	
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
/* 89 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var assocIndexOf = __webpack_require__(86);
	
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
/* 90 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var assocIndexOf = __webpack_require__(86);
	
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
/* 91 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var getMapData = __webpack_require__(92);
	
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
/* 92 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var isKeyable = __webpack_require__(93);
	
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
/* 93 */
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
/* 94 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var getMapData = __webpack_require__(92);
	
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
/* 95 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var getMapData = __webpack_require__(92);
	
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
/* 96 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var getMapData = __webpack_require__(92);
	
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
/* 97 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseToString = __webpack_require__(98);
	
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
/* 98 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _Symbol = __webpack_require__(15),
	    arrayMap = __webpack_require__(31),
	    isArray = __webpack_require__(23),
	    isSymbol = __webpack_require__(28);
	
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
/* 99 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var isSymbol = __webpack_require__(28);
	
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
/* 100 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseFlatten = __webpack_require__(101);
	
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
/* 101 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var arrayPush = __webpack_require__(102),
	    isFlattenable = __webpack_require__(103);
	
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
/* 102 */
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
/* 103 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _Symbol = __webpack_require__(15),
	    isArguments = __webpack_require__(35),
	    isArray = __webpack_require__(23);
	
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
/* 104 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseClamp = __webpack_require__(105),
	    baseToString = __webpack_require__(98),
	    toInteger = __webpack_require__(25),
	    toString = __webpack_require__(97);
	
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
/* 105 */
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
/* 106 */
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
/* 107 */
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

/***/ },
/* 108 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", { value: true });
	var tslib_1 = __webpack_require__(5);
	tslib_1.__exportStar(__webpack_require__(109), exports);
	tslib_1.__exportStar(__webpack_require__(110), exports);
	tslib_1.__exportStar(__webpack_require__(157), exports);
	tslib_1.__exportStar(__webpack_require__(173), exports);
	tslib_1.__exportStar(__webpack_require__(174), exports);
	//# sourceMappingURL=index.js.map

/***/ },
/* 109 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {"use strict";
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	Object.defineProperty(exports, "__esModule", { value: true });
	var get = __webpack_require__(67);
	var includes = __webpack_require__(7);
	exports.SCHEMAS = new Set(['concepts.schema', 'entities.schema', 'datapoints.schema', '*.schema']);
	exports.DATAPOINTS = 'datapoints';
	exports.ENTITIES = 'entities';
	exports.CONCEPTS = 'concepts';
	exports.AVAILABLE_QUERY_OPERATORS = new Set(['$eq', '$gt', '$gte', '$lt', '$lte', '$ne', '$in', '$nin', '$or', '$and', '$not', '$nor', '$size', '$all', '$elemMatch']);
	exports.AVAILABLE_FROM_CLAUSE_VALUES = new Set([exports.CONCEPTS, exports.ENTITIES, exports.DATAPOINTS].concat(_toConsumableArray(exports.SCHEMAS)));
	exports.AVAILABLE_ORDER_BY_CLAUSE_VALUES = new Set(['asc', 'desc', 1, -1]);
	exports.DEFAULT_DATASET_NAME = process.env.DEFAULT_DATASET_NAME || 'systema_globalis';
	exports.DEFAULT_DATASET_COMMIT = process.env.DEFAULT_DATASET_COMMIT || 'HEAD';
	exports.DEFAULT_DATASET_BRANCH = process.env.DEFAULT_DATASET_BRANCH || 'master';
	exports.DEFAULT_DATASET_DIR = process.env.DEFAULT_DATASET_DIR || './datasets';
	exports.MAX_AMOUNT_OF_MEASURES_IN_SELECT = 5;
	function isSchemaQuery(query) {
	    var fromClause = get(query, 'from');
	    return exports.SCHEMAS.has(fromClause);
	}
	exports.isSchemaQuery = isSchemaQuery;
	function isDatapointsQuery(query) {
	    var fromClause = get(query, 'from');
	    return fromClause === exports.DATAPOINTS;
	}
	exports.isDatapointsQuery = isDatapointsQuery;
	function isEntitiesQuery(query) {
	    var fromClause = get(query, 'from');
	    return fromClause === exports.ENTITIES;
	}
	exports.isEntitiesQuery = isEntitiesQuery;
	function isConceptsQuery(query) {
	    var fromClause = get(query, 'from');
	    return fromClause === exports.CONCEPTS;
	}
	exports.isConceptsQuery = isConceptsQuery;
	function isEntityDomainOrSet(conceptType) {
	    return includes(['entity_domain', 'entity_set', 'time'], conceptType);
	}
	exports.isEntityDomainOrSet = isEntityDomainOrSet;
	function isMeasure(conceptType) {
	    return includes(['measure', 'string'], conceptType);
	}
	exports.isMeasure = isMeasure;
	//# sourceMappingURL=helper.service.js.map
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(65)))

/***/ },
/* 110 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	Object.defineProperty(exports, "__esModule", { value: true });
	var isEmpty = __webpack_require__(49);
	var isNil = __webpack_require__(111);
	var filter = __webpack_require__(112);
	var get = __webpack_require__(67);
	var compact = __webpack_require__(106);
	var helper_service_1 = __webpack_require__(109);
	function validateQueryDefinitions(query) {
	    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	
	    return new Promise(function (resolve, reject) {
	        var validationResult = [].concat(_toConsumableArray(validateSelectDefinitions(query, options)));
	        var isQueryValid = isEmpty(validationResult);
	        if (!isQueryValid) {
	            return reject("Too many query definition errors: \n* " + validationResult.join('\n* '));
	        }
	        return resolve();
	    });
	}
	exports.validateQueryDefinitions = validateQueryDefinitions;
	function validateSelectDefinitions(query, options) {
	    var errorMessages = [];
	    var selectClause = get(query, 'select', null);
	    var fromClause = get(query, 'from', null);
	    var key = get(selectClause, 'key');
	    var value = get(selectClause, 'value');
	    switch (true) {
	        case helper_service_1.isSchemaQuery(query):
	            errorMessages.push.apply(errorMessages, []);
	            break;
	        case helper_service_1.isEntitiesQuery(query):
	            errorMessages.push.apply(errorMessages, []);
	            break;
	        case helper_service_1.isConceptsQuery(query):
	            errorMessages.push.apply(errorMessages, []);
	            break;
	        case helper_service_1.isDatapointsQuery(query):
	            errorMessages.push(checkIfSelectKeyHasInvalidDefinitions(query, key, options), checkIfSelectValueHasInvalidDefinitions(query, value, options));
	            break;
	        default:
	            break;
	    }
	    return compact(errorMessages);
	}
	function checkIfSelectKeyHasInvalidDefinitions(query, key, options) {
	    var fromClause = get(query, 'from', null);
	    var unavailableKeys = getUnavailableSelectKeys(key, options);
	    if (!isEmpty(unavailableKeys)) {
	        return "'select.key' clause for '" + fromClause + "' queries contains unavailable item(s): " + unavailableKeys.join(', ') + " [repo: " + query.dataset + "]";
	    }
	}
	function checkIfSelectValueHasInvalidDefinitions(query, value, options) {
	    var fromClause = get(query, 'from', null);
	    var unavailableValues = getUnavailableSelectValues(value, options);
	    if (!isEmpty(unavailableValues)) {
	        return "'select.value' clause for '" + fromClause + "' queries contains unavailable item(s): " + unavailableValues.join(', ') + " [repo: " + query.dataset + "]";
	    }
	}
	function getUnavailableSelectKeys(key, options) {
	    return filter(key, function (keyItem) {
	        var concept = options.conceptsLookup.get(keyItem);
	        if (isNil(concept) || !helper_service_1.isEntityDomainOrSet(concept.concept_type)) {
	            return true;
	        }
	        return false;
	    });
	}
	function getUnavailableSelectValues(value, options) {
	    return filter(value, function (valueItem) {
	        var concept = options.conceptsLookup.get(valueItem);
	        if (isNil(concept) || !helper_service_1.isMeasure(concept.concept_type)) {
	            return true;
	        }
	        return false;
	    });
	}
	//# sourceMappingURL=definition.service.js.map

/***/ },
/* 111 */
/***/ function(module, exports) {

	"use strict";
	
	/**
	 * Checks if `value` is `null` or `undefined`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is nullish, else `false`.
	 * @example
	 *
	 * _.isNil(null);
	 * // => true
	 *
	 * _.isNil(void 0);
	 * // => true
	 *
	 * _.isNil(NaN);
	 * // => false
	 */
	function isNil(value) {
	  return value == null;
	}
	
	module.exports = isNil;

/***/ },
/* 112 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var arrayFilter = __webpack_require__(113),
	    baseFilter = __webpack_require__(114),
	    baseIteratee = __webpack_require__(120),
	    isArray = __webpack_require__(23);
	
	/**
	 * Iterates over elements of `collection`, returning an array of all elements
	 * `predicate` returns truthy for. The predicate is invoked with three
	 * arguments: (value, index|key, collection).
	 *
	 * **Note:** Unlike `_.remove`, this method returns a new array.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Collection
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} [predicate=_.identity] The function invoked per iteration.
	 * @returns {Array} Returns the new filtered array.
	 * @see _.reject
	 * @example
	 *
	 * var users = [
	 *   { 'user': 'barney', 'age': 36, 'active': true },
	 *   { 'user': 'fred',   'age': 40, 'active': false }
	 * ];
	 *
	 * _.filter(users, function(o) { return !o.active; });
	 * // => objects for ['fred']
	 *
	 * // The `_.matches` iteratee shorthand.
	 * _.filter(users, { 'age': 36, 'active': true });
	 * // => objects for ['barney']
	 *
	 * // The `_.matchesProperty` iteratee shorthand.
	 * _.filter(users, ['active', false]);
	 * // => objects for ['fred']
	 *
	 * // The `_.property` iteratee shorthand.
	 * _.filter(users, 'active');
	 * // => objects for ['barney']
	 */
	function filter(collection, predicate) {
	  var func = isArray(collection) ? arrayFilter : baseFilter;
	  return func(collection, baseIteratee(predicate, 3));
	}
	
	module.exports = filter;

/***/ },
/* 113 */
/***/ function(module, exports) {

	"use strict";
	
	/**
	 * A specialized version of `_.filter` for arrays without support for
	 * iteratee shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {Array} Returns the new filtered array.
	 */
	function arrayFilter(array, predicate) {
	  var index = -1,
	      length = array == null ? 0 : array.length,
	      resIndex = 0,
	      result = [];
	
	  while (++index < length) {
	    var value = array[index];
	    if (predicate(value, index, array)) {
	      result[resIndex++] = value;
	    }
	  }
	  return result;
	}
	
	module.exports = arrayFilter;

/***/ },
/* 114 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseEach = __webpack_require__(115);
	
	/**
	 * The base implementation of `_.filter` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {Array} Returns the new filtered array.
	 */
	function baseFilter(collection, predicate) {
	  var result = [];
	  baseEach(collection, function (value, index, collection) {
	    if (predicate(value, index, collection)) {
	      result.push(value);
	    }
	  });
	  return result;
	}
	
	module.exports = baseFilter;

/***/ },
/* 115 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseForOwn = __webpack_require__(116),
	    createBaseEach = __webpack_require__(119);
	
	/**
	 * The base implementation of `_.forEach` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array|Object} Returns `collection`.
	 */
	var baseEach = createBaseEach(baseForOwn);
	
	module.exports = baseEach;

/***/ },
/* 116 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseFor = __webpack_require__(117),
	    keys = __webpack_require__(32);
	
	/**
	 * The base implementation of `_.forOwn` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Object} Returns `object`.
	 */
	function baseForOwn(object, iteratee) {
	  return object && baseFor(object, iteratee, keys);
	}
	
	module.exports = baseForOwn;

/***/ },
/* 117 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var createBaseFor = __webpack_require__(118);
	
	/**
	 * The base implementation of `baseForOwn` which iterates over `object`
	 * properties returned by `keysFunc` and invokes `iteratee` for each property.
	 * Iteratee functions may exit iteration early by explicitly returning `false`.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @param {Function} keysFunc The function to get the keys of `object`.
	 * @returns {Object} Returns `object`.
	 */
	var baseFor = createBaseFor();
	
	module.exports = baseFor;

/***/ },
/* 118 */
/***/ function(module, exports) {

	"use strict";
	
	/**
	 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
	 *
	 * @private
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Function} Returns the new base function.
	 */
	function createBaseFor(fromRight) {
	  return function (object, iteratee, keysFunc) {
	    var index = -1,
	        iterable = Object(object),
	        props = keysFunc(object),
	        length = props.length;
	
	    while (length--) {
	      var key = props[fromRight ? length : ++index];
	      if (iteratee(iterable[key], key, iterable) === false) {
	        break;
	      }
	    }
	    return object;
	  };
	}
	
	module.exports = createBaseFor;

/***/ },
/* 119 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var isArrayLike = __webpack_require__(12);
	
	/**
	 * Creates a `baseEach` or `baseEachRight` function.
	 *
	 * @private
	 * @param {Function} eachFunc The function to iterate over a collection.
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Function} Returns the new base function.
	 */
	function createBaseEach(eachFunc, fromRight) {
	  return function (collection, iteratee) {
	    if (collection == null) {
	      return collection;
	    }
	    if (!isArrayLike(collection)) {
	      return eachFunc(collection, iteratee);
	    }
	    var length = collection.length,
	        index = fromRight ? length : -1,
	        iterable = Object(collection);
	
	    while (fromRight ? index-- : ++index < length) {
	      if (iteratee(iterable[index], index, iterable) === false) {
	        break;
	      }
	    }
	    return collection;
	  };
	}
	
	module.exports = createBaseEach;

/***/ },
/* 120 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var baseMatches = __webpack_require__(121),
	    baseMatchesProperty = __webpack_require__(149),
	    identity = __webpack_require__(153),
	    isArray = __webpack_require__(23),
	    property = __webpack_require__(154);
	
	/**
	 * The base implementation of `_.iteratee`.
	 *
	 * @private
	 * @param {*} [value=_.identity] The value to convert to an iteratee.
	 * @returns {Function} Returns the iteratee.
	 */
	function baseIteratee(value) {
	  // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
	  // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
	  if (typeof value == 'function') {
	    return value;
	  }
	  if (value == null) {
	    return identity;
	  }
	  if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) == 'object') {
	    return isArray(value) ? baseMatchesProperty(value[0], value[1]) : baseMatches(value);
	  }
	  return property(value);
	}
	
	module.exports = baseIteratee;

/***/ },
/* 121 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseIsMatch = __webpack_require__(122),
	    getMatchData = __webpack_require__(146),
	    matchesStrictComparable = __webpack_require__(148);
	
	/**
	 * The base implementation of `_.matches` which doesn't clone `source`.
	 *
	 * @private
	 * @param {Object} source The object of property values to match.
	 * @returns {Function} Returns the new spec function.
	 */
	function baseMatches(source) {
	  var matchData = getMatchData(source);
	  if (matchData.length == 1 && matchData[0][2]) {
	    return matchesStrictComparable(matchData[0][0], matchData[0][1]);
	  }
	  return function (object) {
	    return object === source || baseIsMatch(object, source, matchData);
	  };
	}
	
	module.exports = baseMatches;

/***/ },
/* 122 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Stack = __webpack_require__(123),
	    baseIsEqual = __webpack_require__(129);
	
	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1,
	    COMPARE_UNORDERED_FLAG = 2;
	
	/**
	 * The base implementation of `_.isMatch` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Object} object The object to inspect.
	 * @param {Object} source The object of property values to match.
	 * @param {Array} matchData The property names, values, and compare flags to match.
	 * @param {Function} [customizer] The function to customize comparisons.
	 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
	 */
	function baseIsMatch(object, source, matchData, customizer) {
	  var index = matchData.length,
	      length = index,
	      noCustomizer = !customizer;
	
	  if (object == null) {
	    return !length;
	  }
	  object = Object(object);
	  while (index--) {
	    var data = matchData[index];
	    if (noCustomizer && data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) {
	      return false;
	    }
	  }
	  while (++index < length) {
	    data = matchData[index];
	    var key = data[0],
	        objValue = object[key],
	        srcValue = data[1];
	
	    if (noCustomizer && data[2]) {
	      if (objValue === undefined && !(key in object)) {
	        return false;
	      }
	    } else {
	      var stack = new Stack();
	      if (customizer) {
	        var result = customizer(objValue, srcValue, key, object, source, stack);
	      }
	      if (!(result === undefined ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG, customizer, stack) : result)) {
	        return false;
	      }
	    }
	  }
	  return true;
	}
	
	module.exports = baseIsMatch;

/***/ },
/* 123 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var ListCache = __webpack_require__(83),
	    stackClear = __webpack_require__(124),
	    stackDelete = __webpack_require__(125),
	    stackGet = __webpack_require__(126),
	    stackHas = __webpack_require__(127),
	    stackSet = __webpack_require__(128);
	
	/**
	 * Creates a stack cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function Stack(entries) {
	  var data = this.__data__ = new ListCache(entries);
	  this.size = data.size;
	}
	
	// Add methods to `Stack`.
	Stack.prototype.clear = stackClear;
	Stack.prototype['delete'] = stackDelete;
	Stack.prototype.get = stackGet;
	Stack.prototype.has = stackHas;
	Stack.prototype.set = stackSet;
	
	module.exports = Stack;

/***/ },
/* 124 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var ListCache = __webpack_require__(83);
	
	/**
	 * Removes all key-value entries from the stack.
	 *
	 * @private
	 * @name clear
	 * @memberOf Stack
	 */
	function stackClear() {
	  this.__data__ = new ListCache();
	  this.size = 0;
	}
	
	module.exports = stackClear;

/***/ },
/* 125 */
/***/ function(module, exports) {

	'use strict';
	
	/**
	 * Removes `key` and its value from the stack.
	 *
	 * @private
	 * @name delete
	 * @memberOf Stack
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function stackDelete(key) {
	  var data = this.__data__,
	      result = data['delete'](key);
	
	  this.size = data.size;
	  return result;
	}
	
	module.exports = stackDelete;

/***/ },
/* 126 */
/***/ function(module, exports) {

	"use strict";
	
	/**
	 * Gets the stack value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf Stack
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function stackGet(key) {
	  return this.__data__.get(key);
	}
	
	module.exports = stackGet;

/***/ },
/* 127 */
/***/ function(module, exports) {

	"use strict";
	
	/**
	 * Checks if a stack value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf Stack
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function stackHas(key) {
	  return this.__data__.has(key);
	}
	
	module.exports = stackHas;

/***/ },
/* 128 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var ListCache = __webpack_require__(83),
	    Map = __webpack_require__(58),
	    MapCache = __webpack_require__(74);
	
	/** Used as the size to enable large array optimizations. */
	var LARGE_ARRAY_SIZE = 200;
	
	/**
	 * Sets the stack `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf Stack
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the stack cache instance.
	 */
	function stackSet(key, value) {
	  var data = this.__data__;
	  if (data instanceof ListCache) {
	    var pairs = data.__data__;
	    if (!Map || pairs.length < LARGE_ARRAY_SIZE - 1) {
	      pairs.push([key, value]);
	      this.size = ++data.size;
	      return this;
	    }
	    data = this.__data__ = new MapCache(pairs);
	  }
	  data.set(key, value);
	  this.size = data.size;
	  return this;
	}
	
	module.exports = stackSet;

/***/ },
/* 129 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseIsEqualDeep = __webpack_require__(130),
	    isObjectLike = __webpack_require__(24);
	
	/**
	 * The base implementation of `_.isEqual` which supports partial comparisons
	 * and tracks traversed objects.
	 *
	 * @private
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @param {boolean} bitmask The bitmask flags.
	 *  1 - Unordered comparison
	 *  2 - Partial comparison
	 * @param {Function} [customizer] The function to customize comparisons.
	 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 */
	function baseIsEqual(value, other, bitmask, customizer, stack) {
	  if (value === other) {
	    return true;
	  }
	  if (value == null || other == null || !isObjectLike(value) && !isObjectLike(other)) {
	    return value !== value && other !== other;
	  }
	  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
	}
	
	module.exports = baseIsEqual;

/***/ },
/* 130 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Stack = __webpack_require__(123),
	    equalArrays = __webpack_require__(131),
	    equalByTag = __webpack_require__(137),
	    equalObjects = __webpack_require__(141),
	    getTag = __webpack_require__(50),
	    isArray = __webpack_require__(23),
	    isBuffer = __webpack_require__(37),
	    isTypedArray = __webpack_require__(41);
	
	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1;
	
	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	    arrayTag = '[object Array]',
	    objectTag = '[object Object]';
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * A specialized version of `baseIsEqual` for arrays and objects which performs
	 * deep comparisons and tracks traversed objects enabling objects with circular
	 * references to be compared.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
	  var objIsArr = isArray(object),
	      othIsArr = isArray(other),
	      objTag = objIsArr ? arrayTag : getTag(object),
	      othTag = othIsArr ? arrayTag : getTag(other);
	
	  objTag = objTag == argsTag ? objectTag : objTag;
	  othTag = othTag == argsTag ? objectTag : othTag;
	
	  var objIsObj = objTag == objectTag,
	      othIsObj = othTag == objectTag,
	      isSameTag = objTag == othTag;
	
	  if (isSameTag && isBuffer(object)) {
	    if (!isBuffer(other)) {
	      return false;
	    }
	    objIsArr = true;
	    objIsObj = false;
	  }
	  if (isSameTag && !objIsObj) {
	    stack || (stack = new Stack());
	    return objIsArr || isTypedArray(object) ? equalArrays(object, other, bitmask, customizer, equalFunc, stack) : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
	  }
	  if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
	    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
	        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');
	
	    if (objIsWrapped || othIsWrapped) {
	      var objUnwrapped = objIsWrapped ? object.value() : object,
	          othUnwrapped = othIsWrapped ? other.value() : other;
	
	      stack || (stack = new Stack());
	      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
	    }
	  }
	  if (!isSameTag) {
	    return false;
	  }
	  stack || (stack = new Stack());
	  return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
	}
	
	module.exports = baseIsEqualDeep;

/***/ },
/* 131 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var SetCache = __webpack_require__(132),
	    arraySome = __webpack_require__(135),
	    cacheHas = __webpack_require__(136);
	
	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1,
	    COMPARE_UNORDERED_FLAG = 2;
	
	/**
	 * A specialized version of `baseIsEqualDeep` for arrays with support for
	 * partial deep comparisons.
	 *
	 * @private
	 * @param {Array} array The array to compare.
	 * @param {Array} other The other array to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} stack Tracks traversed `array` and `other` objects.
	 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
	 */
	function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
	  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
	      arrLength = array.length,
	      othLength = other.length;
	
	  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
	    return false;
	  }
	  // Assume cyclic values are equal.
	  var stacked = stack.get(array);
	  if (stacked && stack.get(other)) {
	    return stacked == other;
	  }
	  var index = -1,
	      result = true,
	      seen = bitmask & COMPARE_UNORDERED_FLAG ? new SetCache() : undefined;
	
	  stack.set(array, other);
	  stack.set(other, array);
	
	  // Ignore non-index properties.
	  while (++index < arrLength) {
	    var arrValue = array[index],
	        othValue = other[index];
	
	    if (customizer) {
	      var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
	    }
	    if (compared !== undefined) {
	      if (compared) {
	        continue;
	      }
	      result = false;
	      break;
	    }
	    // Recursively compare arrays (susceptible to call stack limits).
	    if (seen) {
	      if (!arraySome(other, function (othValue, othIndex) {
	        if (!cacheHas(seen, othIndex) && (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
	          return seen.push(othIndex);
	        }
	      })) {
	        result = false;
	        break;
	      }
	    } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
	      result = false;
	      break;
	    }
	  }
	  stack['delete'](array);
	  stack['delete'](other);
	  return result;
	}
	
	module.exports = equalArrays;

/***/ },
/* 132 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var MapCache = __webpack_require__(74),
	    setCacheAdd = __webpack_require__(133),
	    setCacheHas = __webpack_require__(134);
	
	/**
	 *
	 * Creates an array cache object to store unique values.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [values] The values to cache.
	 */
	function SetCache(values) {
	    var index = -1,
	        length = values == null ? 0 : values.length;
	
	    this.__data__ = new MapCache();
	    while (++index < length) {
	        this.add(values[index]);
	    }
	}
	
	// Add methods to `SetCache`.
	SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
	SetCache.prototype.has = setCacheHas;
	
	module.exports = SetCache;

/***/ },
/* 133 */
/***/ function(module, exports) {

	'use strict';
	
	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = '__lodash_hash_undefined__';
	
	/**
	 * Adds `value` to the array cache.
	 *
	 * @private
	 * @name add
	 * @memberOf SetCache
	 * @alias push
	 * @param {*} value The value to cache.
	 * @returns {Object} Returns the cache instance.
	 */
	function setCacheAdd(value) {
	  this.__data__.set(value, HASH_UNDEFINED);
	  return this;
	}
	
	module.exports = setCacheAdd;

/***/ },
/* 134 */
/***/ function(module, exports) {

	"use strict";
	
	/**
	 * Checks if `value` is in the array cache.
	 *
	 * @private
	 * @name has
	 * @memberOf SetCache
	 * @param {*} value The value to search for.
	 * @returns {number} Returns `true` if `value` is found, else `false`.
	 */
	function setCacheHas(value) {
	  return this.__data__.has(value);
	}
	
	module.exports = setCacheHas;

/***/ },
/* 135 */
/***/ function(module, exports) {

	"use strict";
	
	/**
	 * A specialized version of `_.some` for arrays without support for iteratee
	 * shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {boolean} Returns `true` if any element passes the predicate check,
	 *  else `false`.
	 */
	function arraySome(array, predicate) {
	  var index = -1,
	      length = array == null ? 0 : array.length;
	
	  while (++index < length) {
	    if (predicate(array[index], index, array)) {
	      return true;
	    }
	  }
	  return false;
	}
	
	module.exports = arraySome;

/***/ },
/* 136 */
/***/ function(module, exports) {

	"use strict";
	
	/**
	 * Checks if a `cache` value for `key` exists.
	 *
	 * @private
	 * @param {Object} cache The cache to query.
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function cacheHas(cache, key) {
	  return cache.has(key);
	}
	
	module.exports = cacheHas;

/***/ },
/* 137 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _Symbol = __webpack_require__(15),
	    Uint8Array = __webpack_require__(138),
	    eq = __webpack_require__(87),
	    equalArrays = __webpack_require__(131),
	    mapToArray = __webpack_require__(139),
	    setToArray = __webpack_require__(140);
	
	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1,
	    COMPARE_UNORDERED_FLAG = 2;
	
	/** `Object#toString` result references. */
	var boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    mapTag = '[object Map]',
	    numberTag = '[object Number]',
	    regexpTag = '[object RegExp]',
	    setTag = '[object Set]',
	    stringTag = '[object String]',
	    symbolTag = '[object Symbol]';
	
	var arrayBufferTag = '[object ArrayBuffer]',
	    dataViewTag = '[object DataView]';
	
	/** Used to convert symbols to primitives and strings. */
	var symbolProto = _Symbol ? _Symbol.prototype : undefined,
	    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;
	
	/**
	 * A specialized version of `baseIsEqualDeep` for comparing objects of
	 * the same `toStringTag`.
	 *
	 * **Note:** This function only supports comparing values with tags of
	 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {string} tag The `toStringTag` of the objects to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} stack Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
	  switch (tag) {
	    case dataViewTag:
	      if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
	        return false;
	      }
	      object = object.buffer;
	      other = other.buffer;
	
	    case arrayBufferTag:
	      if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
	        return false;
	      }
	      return true;
	
	    case boolTag:
	    case dateTag:
	    case numberTag:
	      // Coerce booleans to `1` or `0` and dates to milliseconds.
	      // Invalid dates are coerced to `NaN`.
	      return eq(+object, +other);
	
	    case errorTag:
	      return object.name == other.name && object.message == other.message;
	
	    case regexpTag:
	    case stringTag:
	      // Coerce regexes to strings and treat strings, primitives and objects,
	      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
	      // for more details.
	      return object == other + '';
	
	    case mapTag:
	      var convert = mapToArray;
	
	    case setTag:
	      var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
	      convert || (convert = setToArray);
	
	      if (object.size != other.size && !isPartial) {
	        return false;
	      }
	      // Assume cyclic values are equal.
	      var stacked = stack.get(object);
	      if (stacked) {
	        return stacked == other;
	      }
	      bitmask |= COMPARE_UNORDERED_FLAG;
	
	      // Recursively compare objects (susceptible to call stack limits).
	      stack.set(object, other);
	      var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
	      stack['delete'](object);
	      return result;
	
	    case symbolTag:
	      if (symbolValueOf) {
	        return symbolValueOf.call(object) == symbolValueOf.call(other);
	      }
	  }
	  return false;
	}
	
	module.exports = equalByTag;

/***/ },
/* 138 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var root = __webpack_require__(16);
	
	/** Built-in value references. */
	var Uint8Array = root.Uint8Array;
	
	module.exports = Uint8Array;

/***/ },
/* 139 */
/***/ function(module, exports) {

	"use strict";
	
	/**
	 * Converts `map` to its key-value pairs.
	 *
	 * @private
	 * @param {Object} map The map to convert.
	 * @returns {Array} Returns the key-value pairs.
	 */
	function mapToArray(map) {
	  var index = -1,
	      result = Array(map.size);
	
	  map.forEach(function (value, key) {
	    result[++index] = [key, value];
	  });
	  return result;
	}
	
	module.exports = mapToArray;

/***/ },
/* 140 */
/***/ function(module, exports) {

	"use strict";
	
	/**
	 * Converts `set` to an array of its values.
	 *
	 * @private
	 * @param {Object} set The set to convert.
	 * @returns {Array} Returns the values.
	 */
	function setToArray(set) {
	  var index = -1,
	      result = Array(set.size);
	
	  set.forEach(function (value) {
	    result[++index] = value;
	  });
	  return result;
	}
	
	module.exports = setToArray;

/***/ },
/* 141 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var getAllKeys = __webpack_require__(142);
	
	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1;
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * A specialized version of `baseIsEqualDeep` for objects with support for
	 * partial deep comparisons.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} stack Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
	  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
	      objProps = getAllKeys(object),
	      objLength = objProps.length,
	      othProps = getAllKeys(other),
	      othLength = othProps.length;
	
	  if (objLength != othLength && !isPartial) {
	    return false;
	  }
	  var index = objLength;
	  while (index--) {
	    var key = objProps[index];
	    if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
	      return false;
	    }
	  }
	  // Assume cyclic values are equal.
	  var stacked = stack.get(object);
	  if (stacked && stack.get(other)) {
	    return stacked == other;
	  }
	  var result = true;
	  stack.set(object, other);
	  stack.set(other, object);
	
	  var skipCtor = isPartial;
	  while (++index < objLength) {
	    key = objProps[index];
	    var objValue = object[key],
	        othValue = other[key];
	
	    if (customizer) {
	      var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
	    }
	    // Recursively compare objects (susceptible to call stack limits).
	    if (!(compared === undefined ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
	      result = false;
	      break;
	    }
	    skipCtor || (skipCtor = key == 'constructor');
	  }
	  if (result && !skipCtor) {
	    var objCtor = object.constructor,
	        othCtor = other.constructor;
	
	    // Non `Object` object instances with different constructors are not equal.
	    if (objCtor != othCtor && 'constructor' in object && 'constructor' in other && !(typeof objCtor == 'function' && objCtor instanceof objCtor && typeof othCtor == 'function' && othCtor instanceof othCtor)) {
	      result = false;
	    }
	  }
	  stack['delete'](object);
	  stack['delete'](other);
	  return result;
	}
	
	module.exports = equalObjects;

/***/ },
/* 142 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseGetAllKeys = __webpack_require__(143),
	    getSymbols = __webpack_require__(144),
	    keys = __webpack_require__(32);
	
	/**
	 * Creates an array of own enumerable property names and symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names and symbols.
	 */
	function getAllKeys(object) {
	  return baseGetAllKeys(object, keys, getSymbols);
	}
	
	module.exports = getAllKeys;

/***/ },
/* 143 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var arrayPush = __webpack_require__(102),
	    isArray = __webpack_require__(23);
	
	/**
	 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
	 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
	 * symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Function} keysFunc The function to get the keys of `object`.
	 * @param {Function} symbolsFunc The function to get the symbols of `object`.
	 * @returns {Array} Returns the array of property names and symbols.
	 */
	function baseGetAllKeys(object, keysFunc, symbolsFunc) {
	  var result = keysFunc(object);
	  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
	}
	
	module.exports = baseGetAllKeys;

/***/ },
/* 144 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var arrayFilter = __webpack_require__(113),
	    stubArray = __webpack_require__(145);
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/** Built-in value references. */
	var propertyIsEnumerable = objectProto.propertyIsEnumerable;
	
	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeGetSymbols = Object.getOwnPropertySymbols;
	
	/**
	 * Creates an array of the own enumerable symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of symbols.
	 */
	var getSymbols = !nativeGetSymbols ? stubArray : function (object) {
	  if (object == null) {
	    return [];
	  }
	  object = Object(object);
	  return arrayFilter(nativeGetSymbols(object), function (symbol) {
	    return propertyIsEnumerable.call(object, symbol);
	  });
	};
	
	module.exports = getSymbols;

/***/ },
/* 145 */
/***/ function(module, exports) {

	"use strict";
	
	/**
	 * This method returns a new empty array.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.13.0
	 * @category Util
	 * @returns {Array} Returns the new empty array.
	 * @example
	 *
	 * var arrays = _.times(2, _.stubArray);
	 *
	 * console.log(arrays);
	 * // => [[], []]
	 *
	 * console.log(arrays[0] === arrays[1]);
	 * // => false
	 */
	function stubArray() {
	  return [];
	}
	
	module.exports = stubArray;

/***/ },
/* 146 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var isStrictComparable = __webpack_require__(147),
	    keys = __webpack_require__(32);
	
	/**
	 * Gets the property names, values, and compare flags of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the match data of `object`.
	 */
	function getMatchData(object) {
	    var result = keys(object),
	        length = result.length;
	
	    while (length--) {
	        var key = result[length],
	            value = object[key];
	
	        result[length] = [key, value, isStrictComparable(value)];
	    }
	    return result;
	}
	
	module.exports = getMatchData;

/***/ },
/* 147 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var isObject = __webpack_require__(20);
	
	/**
	 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` if suitable for strict
	 *  equality comparisons, else `false`.
	 */
	function isStrictComparable(value) {
	  return value === value && !isObject(value);
	}
	
	module.exports = isStrictComparable;

/***/ },
/* 148 */
/***/ function(module, exports) {

	"use strict";
	
	/**
	 * A specialized version of `matchesProperty` for source values suitable
	 * for strict equality comparisons, i.e. `===`.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @param {*} srcValue The value to match.
	 * @returns {Function} Returns the new spec function.
	 */
	function matchesStrictComparable(key, srcValue) {
	  return function (object) {
	    if (object == null) {
	      return false;
	    }
	    return object[key] === srcValue && (srcValue !== undefined || key in Object(object));
	  };
	}
	
	module.exports = matchesStrictComparable;

/***/ },
/* 149 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseIsEqual = __webpack_require__(129),
	    get = __webpack_require__(67),
	    hasIn = __webpack_require__(150),
	    isKey = __webpack_require__(70),
	    isStrictComparable = __webpack_require__(147),
	    matchesStrictComparable = __webpack_require__(148),
	    toKey = __webpack_require__(99);
	
	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1,
	    COMPARE_UNORDERED_FLAG = 2;
	
	/**
	 * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
	 *
	 * @private
	 * @param {string} path The path of the property to get.
	 * @param {*} srcValue The value to match.
	 * @returns {Function} Returns the new spec function.
	 */
	function baseMatchesProperty(path, srcValue) {
	  if (isKey(path) && isStrictComparable(srcValue)) {
	    return matchesStrictComparable(toKey(path), srcValue);
	  }
	  return function (object) {
	    var objValue = get(object, path);
	    return objValue === undefined && objValue === srcValue ? hasIn(object, path) : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
	  };
	}
	
	module.exports = baseMatchesProperty;

/***/ },
/* 150 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseHasIn = __webpack_require__(151),
	    hasPath = __webpack_require__(152);
	
	/**
	 * Checks if `path` is a direct or inherited property of `object`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Object
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path to check.
	 * @returns {boolean} Returns `true` if `path` exists, else `false`.
	 * @example
	 *
	 * var object = _.create({ 'a': _.create({ 'b': 2 }) });
	 *
	 * _.hasIn(object, 'a');
	 * // => true
	 *
	 * _.hasIn(object, 'a.b');
	 * // => true
	 *
	 * _.hasIn(object, ['a', 'b']);
	 * // => true
	 *
	 * _.hasIn(object, 'b');
	 * // => false
	 */
	function hasIn(object, path) {
	  return object != null && hasPath(object, path, baseHasIn);
	}
	
	module.exports = hasIn;

/***/ },
/* 151 */
/***/ function(module, exports) {

	"use strict";
	
	/**
	 * The base implementation of `_.hasIn` without support for deep paths.
	 *
	 * @private
	 * @param {Object} [object] The object to query.
	 * @param {Array|string} key The key to check.
	 * @returns {boolean} Returns `true` if `key` exists, else `false`.
	 */
	function baseHasIn(object, key) {
	  return object != null && key in Object(object);
	}
	
	module.exports = baseHasIn;

/***/ },
/* 152 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var castPath = __webpack_require__(69),
	    isArguments = __webpack_require__(35),
	    isArray = __webpack_require__(23),
	    isIndex = __webpack_require__(40),
	    isLength = __webpack_require__(21),
	    toKey = __webpack_require__(99);
	
	/**
	 * Checks if `path` exists on `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path to check.
	 * @param {Function} hasFunc The function to check properties.
	 * @returns {boolean} Returns `true` if `path` exists, else `false`.
	 */
	function hasPath(object, path, hasFunc) {
	  path = castPath(path, object);
	
	  var index = -1,
	      length = path.length,
	      result = false;
	
	  while (++index < length) {
	    var key = toKey(path[index]);
	    if (!(result = object != null && hasFunc(object, key))) {
	      break;
	    }
	    object = object[key];
	  }
	  if (result || ++index != length) {
	    return result;
	  }
	  length = object == null ? 0 : object.length;
	  return !!length && isLength(length) && isIndex(key, length) && (isArray(object) || isArguments(object));
	}
	
	module.exports = hasPath;

/***/ },
/* 153 */
/***/ function(module, exports) {

	"use strict";
	
	/**
	 * This method returns the first argument it receives.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Util
	 * @param {*} value Any value.
	 * @returns {*} Returns `value`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 *
	 * console.log(_.identity(object) === object);
	 * // => true
	 */
	function identity(value) {
	  return value;
	}
	
	module.exports = identity;

/***/ },
/* 154 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseProperty = __webpack_require__(155),
	    basePropertyDeep = __webpack_require__(156),
	    isKey = __webpack_require__(70),
	    toKey = __webpack_require__(99);
	
	/**
	 * Creates a function that returns the value at `path` of a given object.
	 *
	 * @static
	 * @memberOf _
	 * @since 2.4.0
	 * @category Util
	 * @param {Array|string} path The path of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 * @example
	 *
	 * var objects = [
	 *   { 'a': { 'b': 2 } },
	 *   { 'a': { 'b': 1 } }
	 * ];
	 *
	 * _.map(objects, _.property('a.b'));
	 * // => [2, 1]
	 *
	 * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
	 * // => [1, 2]
	 */
	function property(path) {
	  return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
	}
	
	module.exports = property;

/***/ },
/* 155 */
/***/ function(module, exports) {

	"use strict";
	
	/**
	 * The base implementation of `_.property` without support for deep paths.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 */
	function baseProperty(key) {
	  return function (object) {
	    return object == null ? undefined : object[key];
	  };
	}
	
	module.exports = baseProperty;

/***/ },
/* 156 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseGet = __webpack_require__(68);
	
	/**
	 * A specialized version of `baseProperty` which supports deep paths.
	 *
	 * @private
	 * @param {Array|string} path The path of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 */
	function basePropertyDeep(path) {
	  return function (object) {
	    return baseGet(object, path);
	  };
	}
	
	module.exports = basePropertyDeep;

/***/ },
/* 157 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	Object.defineProperty(exports, "__esModule", { value: true });
	var isEmpty = __webpack_require__(49);
	var isNil = __webpack_require__(111);
	var isObject = __webpack_require__(20);
	var isArray = __webpack_require__(23);
	var size = __webpack_require__(158);
	var values = __webpack_require__(29);
	var keys = __webpack_require__(32);
	var first = __webpack_require__(163);
	var filter = __webpack_require__(112);
	var startsWith = __webpack_require__(104);
	var get = __webpack_require__(67);
	var has = __webpack_require__(164);
	var every = __webpack_require__(166);
	var compact = __webpack_require__(106);
	var isString = __webpack_require__(22);
	var helper_service_1 = __webpack_require__(109);
	var util_1 = __webpack_require__(170);
	function validateQueryStructure(query) {
	    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	
	    return new Promise(function (resolve, reject) {
	        var validationResult = [].concat(_toConsumableArray(validateDatasetStructure(query, options)), _toConsumableArray(validateFromStructure(query, options)), _toConsumableArray(validateSelectStructure(query, options)), _toConsumableArray(validateWhereStructure(query, options)), _toConsumableArray(validateLanguageStructure(query, options)), _toConsumableArray(validateJoinStructure(query, options)), _toConsumableArray(validateOrderByStructure(query, options)));
	        var isQueryValid = isEmpty(validationResult);
	        if (!isQueryValid) {
	            return reject("Too many query structure errors: \n* " + validationResult.join('\n* '));
	        }
	        return resolve();
	    });
	}
	exports.validateQueryStructure = validateQueryStructure;
	function validateDatasetStructure(query, options) {
	    var errorMessages = [];
	    var datasetClause = get(query, 'dataset');
	    var branchClause = get(query, 'branch');
	    var commitClause = get(query, 'commit');
	    if (!isNil(datasetClause) && !isString(datasetClause)) {
	        errorMessages.push("'dataset' clause must be string only");
	    }
	    if (!isNil(branchClause) && !isString(branchClause)) {
	        errorMessages.push("'branch' clause must be string only");
	    }
	    if (!isNil(commitClause) && !isString(commitClause)) {
	        errorMessages.push("'commit' clause must be string only");
	    }
	    return errorMessages;
	}
	function validateFromStructure(query, options) {
	    var errorMessages = [];
	    var clause = get(query, 'from', null);
	    if (isNil(clause)) {
	        errorMessages.push("'from' clause couldn't be empty");
	    }
	    if (!isString(clause)) {
	        errorMessages.push("'from' clause must be string only");
	    }
	    if (!helper_service_1.AVAILABLE_FROM_CLAUSE_VALUES.has(clause)) {
	        var listAvaliableValues = [].concat(_toConsumableArray(helper_service_1.AVAILABLE_FROM_CLAUSE_VALUES));
	        errorMessages.push("'from' clause must be one of the list: " + listAvaliableValues.join(', '));
	    }
	    return errorMessages;
	}
	function validateSelectStructure(query, options) {
	    var errorMessages = [];
	    var selectClause = get(query, 'select', null);
	    var fromClause = get(query, 'from', null);
	    var key = get(selectClause, 'key');
	    var value = get(selectClause, 'value');
	    switch (true) {
	        case helper_service_1.isSchemaQuery(query):
	            errorMessages.push(checkIfSelectIsEmpty(selectClause), checkIfSchemasSelectKeyHasInvalidStructure(fromClause, key), checkIfSelectValueHasInvalidStructure(fromClause, value));
	            break;
	        case helper_service_1.isEntitiesQuery(query):
	            errorMessages.push(checkIfSelectIsEmpty(selectClause), checkIfEntitiesOrConceptsSelectHasInvalidStructure(selectClause, key, value), checkIfSelectKeyHasInvalidStructure(fromClause, key), checkIfSelectValueHasInvalidStructure(fromClause, value));
	            break;
	        case helper_service_1.isConceptsQuery(query):
	            errorMessages.push(checkIfSelectIsEmpty(selectClause), checkIfEntitiesOrConceptsSelectHasInvalidStructure(selectClause, key, value), checkIfSelectKeyHasInvalidStructure(fromClause, key), checkIfSelectValueHasInvalidStructure(fromClause, value));
	            break;
	        case helper_service_1.isDatapointsQuery(query):
	            errorMessages.push(checkIfSelectIsEmpty(selectClause), checkIfSelectHasInvalidStructure(selectClause, key, value), checkIfDatapointsSelectKeyHasInvalidStructure(fromClause, key), checkIfDatapointsSelectValueHasInvalidStructure(fromClause, value));
	            break;
	        default:
	            errorMessages.push(checkIfSelectIsEmpty(selectClause));
	            break;
	    }
	    return compact(errorMessages);
	}
	function validateWhereStructure(query, options) {
	    var errorMessages = [];
	    var joinClause = get(query, 'join', null);
	    var whereClause = get(query, 'where', null);
	    var whereOperators = getWhereOperators(whereClause);
	    errorMessages.push(checkIfWhereHasInvalidStructure(whereClause), checkIfWhereHasUnknownOperators(joinClause, whereOperators));
	    return compact(errorMessages);
	}
	function validateLanguageStructure(query, options) {
	    var errorMessages = [];
	    var languageClause = get(query, 'language', null);
	    switch (true) {
	        case helper_service_1.isSchemaQuery(query):
	            errorMessages.push(checkIfSchemaLanguageIsPresent(query));
	            break;
	        case helper_service_1.isEntitiesQuery(query):
	        case helper_service_1.isConceptsQuery(query):
	        case helper_service_1.isDatapointsQuery(query):
	        default:
	            errorMessages.push(checkIfLanguageHasInvalidStructure(languageClause));
	            break;
	    }
	    return compact(errorMessages);
	}
	function validateJoinStructure(query, options) {
	    var errorMessages = [];
	    var joinClause = get(query, 'join', null);
	    switch (true) {
	        case helper_service_1.isSchemaQuery(query):
	            errorMessages.push(checkIfSchemaJoinIsPresent(query));
	            break;
	        case helper_service_1.isEntitiesQuery(query):
	        case helper_service_1.isConceptsQuery(query):
	        case helper_service_1.isDatapointsQuery(query):
	        default:
	            errorMessages.push(checkIfJoinHasInvalidStructure(joinClause));
	            break;
	    }
	    return compact(errorMessages);
	}
	function validateOrderByStructure(query, options) {
	    var errorMessages = [];
	    var orderByClause = get(query, 'order_by', null);
	    errorMessages.push(checkIfOrderByHasInvalidStructure(orderByClause));
	    return compact(errorMessages);
	}
	function checkIfSelectIsEmpty(selectClause) {
	    if (isNil(selectClause)) {
	        return "'select' clause couldn't be empty";
	    }
	}
	function checkIfSelectHasInvalidStructure(selectClause, key, value) {
	    if (!isObject(selectClause) || !isArray(key) || !isArray(value)) {
	        return "'select' clause must have next structure: { key: [...], value: [...] }";
	    }
	}
	function checkIfJoinHasInvalidStructure(joinClause) {
	    if (!isNil(joinClause) && !isStrictObject(joinClause)) {
	        return "'join' clause must be object only";
	    }
	}
	function checkIfLanguageHasInvalidStructure(languageClause) {
	    if (!isNil(languageClause) && !isString(languageClause)) {
	        return "'language' clause must be string only";
	    }
	}
	function checkIfWhereHasInvalidStructure(whereClause) {
	    if (!isNil(whereClause) && !isStrictObject(whereClause)) {
	        return "'where' clause must be object only";
	    }
	}
	function checkIfWhereHasUnknownOperators(joinClause, operators) {
	    var notAllowedOperators = filter(operators, function (operator) {
	        return !isAllowedOperator(joinClause, operator);
	    }).map(function (operator) {
	        return operator.name;
	    });
	    var allowedOperatorsByDataset = [].concat(_toConsumableArray(helper_service_1.AVAILABLE_QUERY_OPERATORS.values()), _toConsumableArray(keys(joinClause)));
	    if (!isEmpty(notAllowedOperators)) {
	        return "'where' clause has unknown operator(s) '" + notAllowedOperators.join(', ') + "', replace it with allowed operators: " + allowedOperatorsByDataset.join(', ');
	    }
	}
	function checkIfOrderByHasInvalidStructure(orderByClause) {
	    if (!isNil(orderByClause) && !isString(orderByClause) && !isArrayOfStrings(orderByClause) && !isArrayOfSpecialItems(orderByClause, isOrderBySubclause)) {
	        return "'order_by' clause must be string or array of strings || objects only";
	    }
	}
	function isStrictObject(clause) {
	    return isObject(clause) && !isArray(clause);
	}
	function isArrayOfStrings(clause) {
	    return isArray(clause) && every(clause, isString);
	}
	function isOrderBySubclause(subclause) {
	    return isString(subclause) || isStrictObject(subclause) && size(subclause) === 1 && helper_service_1.AVAILABLE_ORDER_BY_CLAUSE_VALUES.has(first(values(subclause)));
	}
	function isArrayOfSpecialItems(clause, isSpecialItem) {
	    return isArray(clause) && every(clause, isSpecialItem);
	}
	function isAllowedOperator(joinClause, operator) {
	    return isMongoLikeOperator(operator) || isJoinOperator(joinClause, operator);
	}
	function isMongoLikeOperator(operator) {
	    return !operator.isLeaf && helper_service_1.AVAILABLE_QUERY_OPERATORS.has(operator.name);
	}
	function isJoinOperator(joinClause, operator) {
	    return operator.isLeaf && startsWith(operator.name, '$') && has(joinClause, operator.name);
	}
	function getWhereOperators(whereClause) {
	    var operators = [];
	    for (var field in whereClause) {
	        if (startsWith(field, '$')) {
	            operators.push({ name: field, isLeaf: false });
	        }
	        if (util_1.isPrimitive(whereClause[field])) {
	            if (startsWith(whereClause[field], '$')) {
	                operators.push({ name: whereClause[field], isLeaf: true });
	            }
	        } else {
	            operators.push.apply(operators, _toConsumableArray(getWhereOperators(whereClause[field])));
	        }
	    }
	    return operators;
	}
	function checkIfDatapointsSelectKeyHasInvalidStructure(fromClause, key) {
	    if (size(key) < 2) {
	        return "'select.key' clause for '" + fromClause + "' queries must have at least 2 items";
	    }
	}
	function checkIfDatapointsSelectValueHasInvalidStructure(fromClause, value) {
	    if (size(value) < 1) {
	        return "'select.value' clause for '" + fromClause + "' queries must have at least 1 item";
	    }
	}
	function checkIfSchemasSelectKeyHasInvalidStructure(fromClause, key) {
	    if (!isArray(key) || size(key) !== 2) {
	        return "'select.key' clause for '" + fromClause + "' queries must have exactly 2 items: 'key', 'value'";
	    }
	}
	function checkIfSelectValueHasInvalidStructure(fromClause, value) {
	    if (!isArray(value) && !isNil(value)) {
	        return "'select.value' clause for '" + fromClause + "' queries should be array of strings or empty";
	    }
	}
	function checkIfSchemaJoinIsPresent(query) {
	    if (has(query, 'join')) {
	        return "'join' clause for '*.schema' queries shouldn't be present in query";
	    }
	}
	function checkIfSchemaLanguageIsPresent(query) {
	    if (has(query, 'language')) {
	        return "'language' clause for '*.schema' queries shouldn't be present in query";
	    }
	}
	function checkIfEntitiesOrConceptsSelectHasInvalidStructure(selectClause, key, value) {
	    if (!isObject(selectClause) || !isArray(key)) {
	        return "'select' clause must have next structure: { key: [...], value: [...] }";
	    }
	}
	function checkIfSelectKeyHasInvalidStructure(fromClause, key) {
	    if (!isArray(key) || size(key) !== 1) {
	        return "'select.key' clause for '" + fromClause + "' queries must have only 1 item";
	    }
	}
	//# sourceMappingURL=structure.service.js.map

/***/ },
/* 158 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseKeys = __webpack_require__(45),
	    getTag = __webpack_require__(50),
	    isArrayLike = __webpack_require__(12),
	    isString = __webpack_require__(22),
	    stringSize = __webpack_require__(159);
	
	/** `Object#toString` result references. */
	var mapTag = '[object Map]',
	    setTag = '[object Set]';
	
	/**
	 * Gets the size of `collection` by returning its length for array-like
	 * values or the number of own enumerable string keyed properties for objects.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Collection
	 * @param {Array|Object|string} collection The collection to inspect.
	 * @returns {number} Returns the collection size.
	 * @example
	 *
	 * _.size([1, 2, 3]);
	 * // => 3
	 *
	 * _.size({ 'a': 1, 'b': 2 });
	 * // => 2
	 *
	 * _.size('pebbles');
	 * // => 7
	 */
	function size(collection) {
	  if (collection == null) {
	    return 0;
	  }
	  if (isArrayLike(collection)) {
	    return isString(collection) ? stringSize(collection) : collection.length;
	  }
	  var tag = getTag(collection);
	  if (tag == mapTag || tag == setTag) {
	    return collection.size;
	  }
	  return baseKeys(collection).length;
	}
	
	module.exports = size;

/***/ },
/* 159 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var asciiSize = __webpack_require__(160),
	    hasUnicode = __webpack_require__(161),
	    unicodeSize = __webpack_require__(162);
	
	/**
	 * Gets the number of symbols in `string`.
	 *
	 * @private
	 * @param {string} string The string to inspect.
	 * @returns {number} Returns the string size.
	 */
	function stringSize(string) {
	    return hasUnicode(string) ? unicodeSize(string) : asciiSize(string);
	}
	
	module.exports = stringSize;

/***/ },
/* 160 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseProperty = __webpack_require__(155);
	
	/**
	 * Gets the size of an ASCII `string`.
	 *
	 * @private
	 * @param {string} string The string inspect.
	 * @returns {number} Returns the string size.
	 */
	var asciiSize = baseProperty('length');
	
	module.exports = asciiSize;

/***/ },
/* 161 */
/***/ function(module, exports) {

	'use strict';
	
	/** Used to compose unicode character classes. */
	var rsAstralRange = '\\ud800-\\udfff',
	    rsComboMarksRange = '\\u0300-\\u036f',
	    reComboHalfMarksRange = '\\ufe20-\\ufe2f',
	    rsComboSymbolsRange = '\\u20d0-\\u20ff',
	    rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange,
	    rsVarRange = '\\ufe0e\\ufe0f';
	
	/** Used to compose unicode capture groups. */
	var rsZWJ = '\\u200d';
	
	/** Used to detect strings with [zero-width joiners or code points from the astral planes](http://eev.ee/blog/2015/09/12/dark-corners-of-unicode/). */
	var reHasUnicode = RegExp('[' + rsZWJ + rsAstralRange + rsComboRange + rsVarRange + ']');
	
	/**
	 * Checks if `string` contains Unicode symbols.
	 *
	 * @private
	 * @param {string} string The string to inspect.
	 * @returns {boolean} Returns `true` if a symbol is found, else `false`.
	 */
	function hasUnicode(string) {
	  return reHasUnicode.test(string);
	}
	
	module.exports = hasUnicode;

/***/ },
/* 162 */
/***/ function(module, exports) {

	'use strict';
	
	/** Used to compose unicode character classes. */
	var rsAstralRange = '\\ud800-\\udfff',
	    rsComboMarksRange = '\\u0300-\\u036f',
	    reComboHalfMarksRange = '\\ufe20-\\ufe2f',
	    rsComboSymbolsRange = '\\u20d0-\\u20ff',
	    rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange,
	    rsVarRange = '\\ufe0e\\ufe0f';
	
	/** Used to compose unicode capture groups. */
	var rsAstral = '[' + rsAstralRange + ']',
	    rsCombo = '[' + rsComboRange + ']',
	    rsFitz = '\\ud83c[\\udffb-\\udfff]',
	    rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')',
	    rsNonAstral = '[^' + rsAstralRange + ']',
	    rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}',
	    rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]',
	    rsZWJ = '\\u200d';
	
	/** Used to compose unicode regexes. */
	var reOptMod = rsModifier + '?',
	    rsOptVar = '[' + rsVarRange + ']?',
	    rsOptJoin = '(?:' + rsZWJ + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*',
	    rsSeq = rsOptVar + reOptMod + rsOptJoin,
	    rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';
	
	/** Used to match [string symbols](https://mathiasbynens.be/notes/javascript-unicode). */
	var reUnicode = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');
	
	/**
	 * Gets the size of a Unicode `string`.
	 *
	 * @private
	 * @param {string} string The string inspect.
	 * @returns {number} Returns the string size.
	 */
	function unicodeSize(string) {
	    var result = reUnicode.lastIndex = 0;
	    while (reUnicode.test(string)) {
	        ++result;
	    }
	    return result;
	}
	
	module.exports = unicodeSize;

/***/ },
/* 163 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	module.exports = __webpack_require__(66);

/***/ },
/* 164 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseHas = __webpack_require__(165),
	    hasPath = __webpack_require__(152);
	
	/**
	 * Checks if `path` is a direct property of `object`.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path to check.
	 * @returns {boolean} Returns `true` if `path` exists, else `false`.
	 * @example
	 *
	 * var object = { 'a': { 'b': 2 } };
	 * var other = _.create({ 'a': _.create({ 'b': 2 }) });
	 *
	 * _.has(object, 'a');
	 * // => true
	 *
	 * _.has(object, 'a.b');
	 * // => true
	 *
	 * _.has(object, ['a', 'b']);
	 * // => true
	 *
	 * _.has(other, 'a');
	 * // => false
	 */
	function has(object, path) {
	  return object != null && hasPath(object, path, baseHas);
	}
	
	module.exports = has;

/***/ },
/* 165 */
/***/ function(module, exports) {

	"use strict";
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * The base implementation of `_.has` without support for deep paths.
	 *
	 * @private
	 * @param {Object} [object] The object to query.
	 * @param {Array|string} key The key to check.
	 * @returns {boolean} Returns `true` if `key` exists, else `false`.
	 */
	function baseHas(object, key) {
	  return object != null && hasOwnProperty.call(object, key);
	}
	
	module.exports = baseHas;

/***/ },
/* 166 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var arrayEvery = __webpack_require__(167),
	    baseEvery = __webpack_require__(168),
	    baseIteratee = __webpack_require__(120),
	    isArray = __webpack_require__(23),
	    isIterateeCall = __webpack_require__(169);
	
	/**
	 * Checks if `predicate` returns truthy for **all** elements of `collection`.
	 * Iteration is stopped once `predicate` returns falsey. The predicate is
	 * invoked with three arguments: (value, index|key, collection).
	 *
	 * **Note:** This method returns `true` for
	 * [empty collections](https://en.wikipedia.org/wiki/Empty_set) because
	 * [everything is true](https://en.wikipedia.org/wiki/Vacuous_truth) of
	 * elements of empty collections.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Collection
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} [predicate=_.identity] The function invoked per iteration.
	 * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
	 * @returns {boolean} Returns `true` if all elements pass the predicate check,
	 *  else `false`.
	 * @example
	 *
	 * _.every([true, 1, null, 'yes'], Boolean);
	 * // => false
	 *
	 * var users = [
	 *   { 'user': 'barney', 'age': 36, 'active': false },
	 *   { 'user': 'fred',   'age': 40, 'active': false }
	 * ];
	 *
	 * // The `_.matches` iteratee shorthand.
	 * _.every(users, { 'user': 'barney', 'active': false });
	 * // => false
	 *
	 * // The `_.matchesProperty` iteratee shorthand.
	 * _.every(users, ['active', false]);
	 * // => true
	 *
	 * // The `_.property` iteratee shorthand.
	 * _.every(users, 'active');
	 * // => false
	 */
	function every(collection, predicate, guard) {
	  var func = isArray(collection) ? arrayEvery : baseEvery;
	  if (guard && isIterateeCall(collection, predicate, guard)) {
	    predicate = undefined;
	  }
	  return func(collection, baseIteratee(predicate, 3));
	}
	
	module.exports = every;

/***/ },
/* 167 */
/***/ function(module, exports) {

	"use strict";
	
	/**
	 * A specialized version of `_.every` for arrays without support for
	 * iteratee shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {boolean} Returns `true` if all elements pass the predicate check,
	 *  else `false`.
	 */
	function arrayEvery(array, predicate) {
	  var index = -1,
	      length = array == null ? 0 : array.length;
	
	  while (++index < length) {
	    if (!predicate(array[index], index, array)) {
	      return false;
	    }
	  }
	  return true;
	}
	
	module.exports = arrayEvery;

/***/ },
/* 168 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseEach = __webpack_require__(115);
	
	/**
	 * The base implementation of `_.every` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {boolean} Returns `true` if all elements pass the predicate check,
	 *  else `false`
	 */
	function baseEvery(collection, predicate) {
	  var result = true;
	  baseEach(collection, function (value, index, collection) {
	    result = !!predicate(value, index, collection);
	    return result;
	  });
	  return result;
	}
	
	module.exports = baseEvery;

/***/ },
/* 169 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var eq = __webpack_require__(87),
	    isArrayLike = __webpack_require__(12),
	    isIndex = __webpack_require__(40),
	    isObject = __webpack_require__(20);
	
	/**
	 * Checks if the given arguments are from an iteratee call.
	 *
	 * @private
	 * @param {*} value The potential iteratee value argument.
	 * @param {*} index The potential iteratee index or key argument.
	 * @param {*} object The potential iteratee object argument.
	 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
	 *  else `false`.
	 */
	function isIterateeCall(value, index, object) {
	  if (!isObject(object)) {
	    return false;
	  }
	  var type = typeof index === 'undefined' ? 'undefined' : _typeof(index);
	  if (type == 'number' ? isArrayLike(object) && isIndex(index, object.length) : type == 'string' && index in object) {
	    return eq(object[index], value);
	  }
	  return false;
	}
	
	module.exports = isIterateeCall;

/***/ },
/* 170 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
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
	
	var formatRegExp = /%[sdj%]/g;
	exports.format = function (f) {
	  if (!isString(f)) {
	    var objects = [];
	    for (var i = 0; i < arguments.length; i++) {
	      objects.push(inspect(arguments[i]));
	    }
	    return objects.join(' ');
	  }
	
	  var i = 1;
	  var args = arguments;
	  var len = args.length;
	  var str = String(f).replace(formatRegExp, function (x) {
	    if (x === '%%') return '%';
	    if (i >= len) return x;
	    switch (x) {
	      case '%s':
	        return String(args[i++]);
	      case '%d':
	        return Number(args[i++]);
	      case '%j':
	        try {
	          return JSON.stringify(args[i++]);
	        } catch (_) {
	          return '[Circular]';
	        }
	      default:
	        return x;
	    }
	  });
	  for (var x = args[i]; i < len; x = args[++i]) {
	    if (isNull(x) || !isObject(x)) {
	      str += ' ' + x;
	    } else {
	      str += ' ' + inspect(x);
	    }
	  }
	  return str;
	};
	
	// Mark that a method should not be used.
	// Returns a modified function which warns once by default.
	// If --no-deprecation is set, then it is a no-op.
	exports.deprecate = function (fn, msg) {
	  // Allow for deprecating things in the process of starting up.
	  if (isUndefined(global.process)) {
	    return function () {
	      return exports.deprecate(fn, msg).apply(this, arguments);
	    };
	  }
	
	  if (process.noDeprecation === true) {
	    return fn;
	  }
	
	  var warned = false;
	  function deprecated() {
	    if (!warned) {
	      if (process.throwDeprecation) {
	        throw new Error(msg);
	      } else if (process.traceDeprecation) {
	        console.trace(msg);
	      } else {
	        console.error(msg);
	      }
	      warned = true;
	    }
	    return fn.apply(this, arguments);
	  }
	
	  return deprecated;
	};
	
	var debugs = {};
	var debugEnviron;
	exports.debuglog = function (set) {
	  if (isUndefined(debugEnviron)) debugEnviron = process.env.NODE_DEBUG || '';
	  set = set.toUpperCase();
	  if (!debugs[set]) {
	    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
	      var pid = process.pid;
	      debugs[set] = function () {
	        var msg = exports.format.apply(exports, arguments);
	        console.error('%s %d: %s', set, pid, msg);
	      };
	    } else {
	      debugs[set] = function () {};
	    }
	  }
	  return debugs[set];
	};
	
	/**
	 * Echos the value of a value. Trys to print the value out
	 * in the best way possible given the different types.
	 *
	 * @param {Object} obj The object to print out.
	 * @param {Object} opts Optional options object that alters the output.
	 */
	/* legacy: obj, showHidden, depth, colors*/
	function inspect(obj, opts) {
	  // default options
	  var ctx = {
	    seen: [],
	    stylize: stylizeNoColor
	  };
	  // legacy...
	  if (arguments.length >= 3) ctx.depth = arguments[2];
	  if (arguments.length >= 4) ctx.colors = arguments[3];
	  if (isBoolean(opts)) {
	    // legacy...
	    ctx.showHidden = opts;
	  } else if (opts) {
	    // got an "options" object
	    exports._extend(ctx, opts);
	  }
	  // set default options
	  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
	  if (isUndefined(ctx.depth)) ctx.depth = 2;
	  if (isUndefined(ctx.colors)) ctx.colors = false;
	  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
	  if (ctx.colors) ctx.stylize = stylizeWithColor;
	  return formatValue(ctx, obj, ctx.depth);
	}
	exports.inspect = inspect;
	
	// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
	inspect.colors = {
	  'bold': [1, 22],
	  'italic': [3, 23],
	  'underline': [4, 24],
	  'inverse': [7, 27],
	  'white': [37, 39],
	  'grey': [90, 39],
	  'black': [30, 39],
	  'blue': [34, 39],
	  'cyan': [36, 39],
	  'green': [32, 39],
	  'magenta': [35, 39],
	  'red': [31, 39],
	  'yellow': [33, 39]
	};
	
	// Don't use 'blue' not visible on cmd.exe
	inspect.styles = {
	  'special': 'cyan',
	  'number': 'yellow',
	  'boolean': 'yellow',
	  'undefined': 'grey',
	  'null': 'bold',
	  'string': 'green',
	  'date': 'magenta',
	  // "name": intentionally not styling
	  'regexp': 'red'
	};
	
	function stylizeWithColor(str, styleType) {
	  var style = inspect.styles[styleType];
	
	  if (style) {
	    return '\x1B[' + inspect.colors[style][0] + 'm' + str + '\x1B[' + inspect.colors[style][1] + 'm';
	  } else {
	    return str;
	  }
	}
	
	function stylizeNoColor(str, styleType) {
	  return str;
	}
	
	function arrayToHash(array) {
	  var hash = {};
	
	  array.forEach(function (val, idx) {
	    hash[val] = true;
	  });
	
	  return hash;
	}
	
	function formatValue(ctx, value, recurseTimes) {
	  // Provide a hook for user-specified inspect functions.
	  // Check that value is an object with an inspect function on it
	  if (ctx.customInspect && value && isFunction(value.inspect) &&
	  // Filter out the util module, it's inspect function is special
	  value.inspect !== exports.inspect &&
	  // Also filter out any prototype objects using the circular check.
	  !(value.constructor && value.constructor.prototype === value)) {
	    var ret = value.inspect(recurseTimes, ctx);
	    if (!isString(ret)) {
	      ret = formatValue(ctx, ret, recurseTimes);
	    }
	    return ret;
	  }
	
	  // Primitive types cannot have properties
	  var primitive = formatPrimitive(ctx, value);
	  if (primitive) {
	    return primitive;
	  }
	
	  // Look up the keys of the object.
	  var keys = Object.keys(value);
	  var visibleKeys = arrayToHash(keys);
	
	  if (ctx.showHidden) {
	    keys = Object.getOwnPropertyNames(value);
	  }
	
	  // IE doesn't make error fields non-enumerable
	  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
	  if (isError(value) && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
	    return formatError(value);
	  }
	
	  // Some type of object without properties can be shortcutted.
	  if (keys.length === 0) {
	    if (isFunction(value)) {
	      var name = value.name ? ': ' + value.name : '';
	      return ctx.stylize('[Function' + name + ']', 'special');
	    }
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    }
	    if (isDate(value)) {
	      return ctx.stylize(Date.prototype.toString.call(value), 'date');
	    }
	    if (isError(value)) {
	      return formatError(value);
	    }
	  }
	
	  var base = '',
	      array = false,
	      braces = ['{', '}'];
	
	  // Make Array say that they are Array
	  if (isArray(value)) {
	    array = true;
	    braces = ['[', ']'];
	  }
	
	  // Make functions say that they are functions
	  if (isFunction(value)) {
	    var n = value.name ? ': ' + value.name : '';
	    base = ' [Function' + n + ']';
	  }
	
	  // Make RegExps say that they are RegExps
	  if (isRegExp(value)) {
	    base = ' ' + RegExp.prototype.toString.call(value);
	  }
	
	  // Make dates with properties first say the date
	  if (isDate(value)) {
	    base = ' ' + Date.prototype.toUTCString.call(value);
	  }
	
	  // Make error with message first say the error
	  if (isError(value)) {
	    base = ' ' + formatError(value);
	  }
	
	  if (keys.length === 0 && (!array || value.length == 0)) {
	    return braces[0] + base + braces[1];
	  }
	
	  if (recurseTimes < 0) {
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    } else {
	      return ctx.stylize('[Object]', 'special');
	    }
	  }
	
	  ctx.seen.push(value);
	
	  var output;
	  if (array) {
	    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
	  } else {
	    output = keys.map(function (key) {
	      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
	    });
	  }
	
	  ctx.seen.pop();
	
	  return reduceToSingleString(output, base, braces);
	}
	
	function formatPrimitive(ctx, value) {
	  if (isUndefined(value)) return ctx.stylize('undefined', 'undefined');
	  if (isString(value)) {
	    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '').replace(/'/g, "\\'").replace(/\\"/g, '"') + '\'';
	    return ctx.stylize(simple, 'string');
	  }
	  if (isNumber(value)) return ctx.stylize('' + value, 'number');
	  if (isBoolean(value)) return ctx.stylize('' + value, 'boolean');
	  // For some reason typeof null is "object", so special case here.
	  if (isNull(value)) return ctx.stylize('null', 'null');
	}
	
	function formatError(value) {
	  return '[' + Error.prototype.toString.call(value) + ']';
	}
	
	function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
	  var output = [];
	  for (var i = 0, l = value.length; i < l; ++i) {
	    if (hasOwnProperty(value, String(i))) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, String(i), true));
	    } else {
	      output.push('');
	    }
	  }
	  keys.forEach(function (key) {
	    if (!key.match(/^\d+$/)) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, key, true));
	    }
	  });
	  return output;
	}
	
	function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
	  var name, str, desc;
	  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
	  if (desc.get) {
	    if (desc.set) {
	      str = ctx.stylize('[Getter/Setter]', 'special');
	    } else {
	      str = ctx.stylize('[Getter]', 'special');
	    }
	  } else {
	    if (desc.set) {
	      str = ctx.stylize('[Setter]', 'special');
	    }
	  }
	  if (!hasOwnProperty(visibleKeys, key)) {
	    name = '[' + key + ']';
	  }
	  if (!str) {
	    if (ctx.seen.indexOf(desc.value) < 0) {
	      if (isNull(recurseTimes)) {
	        str = formatValue(ctx, desc.value, null);
	      } else {
	        str = formatValue(ctx, desc.value, recurseTimes - 1);
	      }
	      if (str.indexOf('\n') > -1) {
	        if (array) {
	          str = str.split('\n').map(function (line) {
	            return '  ' + line;
	          }).join('\n').substr(2);
	        } else {
	          str = '\n' + str.split('\n').map(function (line) {
	            return '   ' + line;
	          }).join('\n');
	        }
	      }
	    } else {
	      str = ctx.stylize('[Circular]', 'special');
	    }
	  }
	  if (isUndefined(name)) {
	    if (array && key.match(/^\d+$/)) {
	      return str;
	    }
	    name = JSON.stringify('' + key);
	    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
	      name = name.substr(1, name.length - 2);
	      name = ctx.stylize(name, 'name');
	    } else {
	      name = name.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'");
	      name = ctx.stylize(name, 'string');
	    }
	  }
	
	  return name + ': ' + str;
	}
	
	function reduceToSingleString(output, base, braces) {
	  var numLinesEst = 0;
	  var length = output.reduce(function (prev, cur) {
	    numLinesEst++;
	    if (cur.indexOf('\n') >= 0) numLinesEst++;
	    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
	  }, 0);
	
	  if (length > 60) {
	    return braces[0] + (base === '' ? '' : base + '\n ') + ' ' + output.join(',\n  ') + ' ' + braces[1];
	  }
	
	  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
	}
	
	// NOTE: These type checking functions intentionally don't use `instanceof`
	// because it is fragile and can be easily faked with `Object.create()`.
	function isArray(ar) {
	  return Array.isArray(ar);
	}
	exports.isArray = isArray;
	
	function isBoolean(arg) {
	  return typeof arg === 'boolean';
	}
	exports.isBoolean = isBoolean;
	
	function isNull(arg) {
	  return arg === null;
	}
	exports.isNull = isNull;
	
	function isNullOrUndefined(arg) {
	  return arg == null;
	}
	exports.isNullOrUndefined = isNullOrUndefined;
	
	function isNumber(arg) {
	  return typeof arg === 'number';
	}
	exports.isNumber = isNumber;
	
	function isString(arg) {
	  return typeof arg === 'string';
	}
	exports.isString = isString;
	
	function isSymbol(arg) {
	  return (typeof arg === 'undefined' ? 'undefined' : _typeof(arg)) === 'symbol';
	}
	exports.isSymbol = isSymbol;
	
	function isUndefined(arg) {
	  return arg === void 0;
	}
	exports.isUndefined = isUndefined;
	
	function isRegExp(re) {
	  return isObject(re) && objectToString(re) === '[object RegExp]';
	}
	exports.isRegExp = isRegExp;
	
	function isObject(arg) {
	  return (typeof arg === 'undefined' ? 'undefined' : _typeof(arg)) === 'object' && arg !== null;
	}
	exports.isObject = isObject;
	
	function isDate(d) {
	  return isObject(d) && objectToString(d) === '[object Date]';
	}
	exports.isDate = isDate;
	
	function isError(e) {
	  return isObject(e) && (objectToString(e) === '[object Error]' || e instanceof Error);
	}
	exports.isError = isError;
	
	function isFunction(arg) {
	  return typeof arg === 'function';
	}
	exports.isFunction = isFunction;
	
	function isPrimitive(arg) {
	  return arg === null || typeof arg === 'boolean' || typeof arg === 'number' || typeof arg === 'string' || (typeof arg === 'undefined' ? 'undefined' : _typeof(arg)) === 'symbol' || // ES6 symbol
	  typeof arg === 'undefined';
	}
	exports.isPrimitive = isPrimitive;
	
	exports.isBuffer = __webpack_require__(171);
	
	function objectToString(o) {
	  return Object.prototype.toString.call(o);
	}
	
	function pad(n) {
	  return n < 10 ? '0' + n.toString(10) : n.toString(10);
	}
	
	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	
	// 26 Feb 16:19:34
	function timestamp() {
	  var d = new Date();
	  var time = [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(':');
	  return [d.getDate(), months[d.getMonth()], time].join(' ');
	}
	
	// log is just a thin wrapper to console.log that prepends a timestamp
	exports.log = function () {
	  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
	};
	
	/**
	 * Inherit the prototype methods from one constructor into another.
	 *
	 * The Function.prototype.inherits from lang.js rewritten as a standalone
	 * function (not on Function.prototype). NOTE: If this file is to be loaded
	 * during bootstrapping this function needs to be rewritten using some native
	 * functions as prototype setup using normal JavaScript does not work as
	 * expected during bootstrapping (see mirror.js in r114903).
	 *
	 * @param {function} ctor Constructor function which needs to inherit the
	 *     prototype.
	 * @param {function} superCtor Constructor function to inherit prototype from.
	 */
	exports.inherits = __webpack_require__(172);
	
	exports._extend = function (origin, add) {
	  // Don't do anything if add isn't an object
	  if (!add || !isObject(add)) return origin;
	
	  var keys = Object.keys(add);
	  var i = keys.length;
	  while (i--) {
	    origin[keys[i]] = add[keys[i]];
	  }
	  return origin;
	};
	
	function hasOwnProperty(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(65)))

/***/ },
/* 171 */
/***/ function(module, exports) {

	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	module.exports = function isBuffer(arg) {
	  return arg && (typeof arg === 'undefined' ? 'undefined' : _typeof(arg)) === 'object' && typeof arg.copy === 'function' && typeof arg.fill === 'function' && typeof arg.readUInt8 === 'function';
	};

/***/ },
/* 172 */
/***/ function(module, exports) {

	'use strict';
	
	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor;
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor;
	    var TempCtor = function TempCtor() {};
	    TempCtor.prototype = superCtor.prototype;
	    ctor.prototype = new TempCtor();
	    ctor.prototype.constructor = ctor;
	  };
	}

/***/ },
/* 173 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", { value: true });
	var get = __webpack_require__(67);
	var helper_service_1 = __webpack_require__(109);
	function getDatasetPath(basePath, queryParam) {
	    var dataset = queryParam.dataset,
	        branch = queryParam.branch,
	        commit = queryParam.commit;
	
	    return "" + basePath + dataset + "/" + branch + "-" + commit;
	}
	function getDatapackagePath(datasetPath) {
	    return datasetPath + '/datapackage.json';
	}
	function extendQueryParamWithDatasetProps(queryParam) {
	    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	
	    var dataset = get(queryParam, 'dataset', helper_service_1.DEFAULT_DATASET_NAME);
	    var branch = get(queryParam, 'branch', helper_service_1.DEFAULT_DATASET_BRANCH);
	    var commit = get(queryParam, 'commit', helper_service_1.DEFAULT_DATASET_COMMIT);
	    var basePath = get(options, 'basePath', helper_service_1.DEFAULT_DATASET_DIR);
	    var datasetName = dataset;
	    var datasetPath = getDatasetPath(basePath, { dataset: dataset, branch: branch, commit: commit });
	    var datapackagePath = getDatapackagePath(datasetPath);
	    Object.assign(queryParam, { dataset: dataset, branch: branch, commit: commit });
	    Object.assign(options, { datasetPath: datasetPath, datapackagePath: datapackagePath, datasetName: datasetName });
	    return queryParam;
	}
	exports.extendQueryParamWithDatasetProps = extendQueryParamWithDatasetProps;
	//# sourceMappingURL=extension.service.js.map

/***/ },
/* 174 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", { value: true });
	function validateQueryAvailability(queryParam) {
	    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	    var dataset = queryParam.dataset,
	        branch = queryParam.branch,
	        commit = queryParam.commit;
	
	    return new Promise(function (resolve, reject) {
	        return resolve();
	    });
	}
	exports.validateQueryAvailability = validateQueryAvailability;
	//# sourceMappingURL=availability.service.js.map

/***/ }
/******/ ]);
//# sourceMappingURL=vizabi-ddfcsv-reader.js.map