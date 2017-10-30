var TSF =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
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
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var nextFrame = window.requestAnimationFrame || function (callback) {
  return window.setTimeout(callback, 0);
};
exports.default = nextFrame;
module.exports = exports["default"];

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _nextFrame = __webpack_require__(0);

var _nextFrame2 = _interopRequireDefault(_nextFrame);

var _observer = __webpack_require__(2);

var _observer2 = _interopRequireDefault(_observer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EVENTS = [];
for (var key in document) {
    if (key.startsWith('on')) {
        EVENTS.push(key);
    }
}

var TSF = function () {
    function TSF(selector) {
        _classCallCheck(this, TSF);

        this.initializedComponents = new Map();
        this.componentClasses = new Map();
        this.watcher = new _observer2.default();
        this.rootElement = document.querySelector(selector);
    }

    _createClass(TSF, [{
        key: 'register',
        value: function register(name, componentClass) {
            this.componentClasses.set(name, componentClass);
        }
    }, {
        key: 'component',
        value: function component(name, componentInstance) {
            this.initializedComponents.set(name, componentInstance);
        }
    }, {
        key: 'run',
        value: function run(component) {
            this.process(component, this.rootElement);
        }
    }, {
        key: 'process',
        value: function process(component, domElement) {
            var customTemplate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
            var customVarNames = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
            var customVarValues = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];

            domElement.innerHTML = TSF.prepareTemplate(customTemplate || component.$template);
            var dynamicBindingsIf = this.prepareDynamicIf(component, domElement);
            var dynamicBindingsFor = this.prepareDynamicFor(component, domElement);
            var textNodesBindings = this.processTextNodes(component, domElement, customVarNames, customVarValues);
            var bindings = dynamicBindingsIf.concat(dynamicBindingsFor).concat(textNodesBindings);
            this.watcher.observe(component, bindings);
            this.processEvents(component, domElement);
            this.processComponents(domElement);
            this.processDynamic(component, domElement, dynamicBindingsIf);
            this.processDynamic(component, domElement, dynamicBindingsFor);
        }
    }, {
        key: 'processTextNodes',
        value: function processTextNodes(component, domElement) {
            var customVarNames = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
            var customVarValues = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];

            var bindings = [];
            var matches = domElement.querySelectorAll('[\\$innerHTML]');
            [].forEach.call(matches, function (match) {
                var expr = match.getAttribute('$innerHTML');
                var textNode = document.createTextNode('');
                var evalFunction = new Function(customVarNames.join(','), 'return ' + expr);
                match.parentNode.replaceChild(textNode, match);
                var binding = {
                    expr: expr,
                    component: component,
                    customVarNames: customVarNames,
                    customVarValues: customVarValues,
                    textNode: textNode,
                    evalFunction: evalFunction,
                    compile: function compile() {
                        textNode.data = evalFunction.apply(component, customVarValues);
                    }
                };
                bindings.push(binding);
                binding.compile();
            });
            return bindings;
        }
    }, {
        key: 'processEvents',
        value: function processEvents(component, domElement) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                var _loop = function _loop() {
                    var event = _step.value;

                    var matches = domElement.querySelectorAll('[\\$' + event + ']');
                    [].forEach.call(matches, function (match) {
                        var listener = new Function('$event', match.getAttribute('$' + event));
                        match.removeAttribute('$' + event);
                        match.addEventListener(event.substring(2), function ($event) {
                            (0, _nextFrame2.default)(function () {
                                return listener.call(component, $event);
                            });
                        });
                    });
                };

                for (var _iterator = EVENTS[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    _loop();
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
        }
    }, {
        key: 'prepareDynamicIf',
        value: function prepareDynamicIf(component, domElement) {
            var _this = this;

            var bindings = [];
            var match = domElement.querySelector('[\\$if]');

            var _loop2 = function _loop2() {
                var expr = match.getAttribute('$if');
                match.removeAttribute('$if');
                var html = match.outerHTML;
                var textNode = document.createTextNode('');
                var evalFunction = new Function('', 'return ' + expr);
                match.parentNode.replaceChild(textNode, match);
                var genereatedElement = void 0;
                var binding = {
                    expr: expr,
                    component: component,
                    customVarNames: [],
                    customVarValues: [],
                    textNode: textNode,
                    evalFunction: evalFunction,
                    compile: function compile() {
                        if (evalFunction.apply(component)) {
                            genereatedElement = _this.newElement(html);
                            textNode.parentNode.insertBefore(genereatedElement, textNode);
                            _this.process(component, genereatedElement, genereatedElement.innerHTML);
                        } else {
                            if (genereatedElement) {
                                genereatedElement.remove();
                                genereatedElement = null;
                            }
                        }
                    }
                };
                bindings.push(binding);
                match = domElement.querySelector('[\\$if]');
            };

            while (match && match.getAttribute) {
                _loop2();
            }
            return bindings;
        }
    }, {
        key: 'prepareDynamicFor',
        value: function prepareDynamicFor(component, domElement) {
            var _this2 = this;

            var bindings = [];
            var match = domElement.querySelector('[\\$for]');

            var _loop3 = function _loop3() {
                var expr = match.getAttribute('$for');
                match.removeAttribute('$for');
                var html = match.outerHTML;
                var textNode = document.createTextNode('');
                var evalFunction = new Function('', 'return ' + expr);
                match.parentNode.replaceChild(textNode, match);
                var currentItems = [];
                var binding = {
                    expr: expr,
                    component: component,
                    customVarNames: [],
                    customVarValues: [],
                    textNode: textNode,
                    evalFunction: evalFunction,
                    compile: function compile(params) {
                        if (params && params.type === 'update') {
                            // do not re-render list, dom should be updated automatically
                        } else if (params && params.type === 'push') {
                            var items = evalFunction.apply(component);
                            for (var index = currentItems.length; index < items.length; index++) {
                                var newElement = _this2.newElement(html);
                                textNode.parentNode.insertBefore(newElement, textNode);
                                currentItems.push({ element: newElement });
                                _this2.process(component, newElement, newElement.innerHTML, ['$index'], [index]);
                            }
                        } else {
                            if (currentItems.length) {
                                currentItems.forEach(function (item, index) {
                                    item.element.remove();
                                });
                                currentItems.length = 0;
                            }
                            var _items = evalFunction.apply(component);
                            _items.forEach(function (item, index) {
                                var newElement = _this2.newElement(html);
                                textNode.parentNode.insertBefore(newElement, textNode);
                                currentItems.push({ element: newElement });
                                _this2.process(component, newElement, newElement.innerHTML, ['$index'], [index]);
                            });
                        }
                    }
                };
                bindings.push(binding);
                match = domElement.querySelector('[\\$for]');
            };

            while (match && match.getAttribute) {
                _loop3();
            }
            return bindings;
        }
    }, {
        key: 'processDynamic',
        value: function processDynamic(component, domElement, bindings) {
            bindings.forEach(function (binding) {
                return binding.compile();
            });
        }
    }, {
        key: 'processComponents',
        value: function processComponents(domElement) {
            var _this3 = this;

            this.initializedComponents.forEach(function (componentInstance, name) {
                var element = domElement.querySelector(name);
                if (element) {
                    _this3.process(componentInstance, element);
                }
            });
            this.componentClasses.forEach(function (componentClass, name) {
                var matches = domElement.querySelectorAll(name);
                [].forEach.call(matches, function (element) {
                    _this3.process(new componentClass(), element);
                });
            });
        }
    }, {
        key: 'newElement',
        value: function newElement(html) {
            var div = document.createElement('div');
            div.innerHTML = html;
            return div.firstChild;
        }
    }], [{
        key: 'prepareTemplate',
        value: function prepareTemplate(template) {
            // replace {{ this.something }} to <text $innerHTML="this.something"></text>
            template = template.replace(new RegExp('\{\{([^}]+)\}\}', 'g'), function (match, expr) {
                return '<text $innerHTML="' + expr + '"></text>';
            });
            return template;
        }
    }]);

    return TSF;
}();

exports.default = TSF;
module.exports = exports['default'];

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _nextFrame = __webpack_require__(0);

var _nextFrame2 = _interopRequireDefault(_nextFrame);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var observerId = 0;

var ObservableStructure = function () {
    function ObservableStructure() {
        _classCallCheck(this, ObservableStructure);

        this.allWatchedObjects = new Map();
        this.bindingsByAttr = {};
    }

    _createClass(ObservableStructure, [{
        key: 'observe',
        value: function observe(obj, bindings) {
            var attrFullName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'this.';

            if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object') {
                return;
            }
            var watchedBindings = void 0;
            if (this.allWatchedObjects.has(obj)) {
                watchedBindings = this.allWatchedObjects.get(obj);
                watchedBindings = watchedBindings.concat(bindings);
            } else {
                watchedBindings = bindings;
            }
            this.allWatchedObjects.set(obj, watchedBindings);
            if (ObservableStructure.isObject(obj)) {
                this.observeObject(obj, bindings, attrFullName);
            }
            if (ObservableStructure.isArray(obj)) {
                this.observeArray(obj, bindings, attrFullName);
            }
        }
    }, {
        key: 'compileBinding',
        value: function compileBinding(obj, attrFullName) {
            var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

            var bindings = this.allWatchedObjects.get(obj);
            (0, _nextFrame2.default)(function () {
                bindings.forEach(function (binding) {
                    var attr = attrFullName;
                    var parentAttrPosition = void 0;
                    do {
                        // 'this.a.b.c'
                        // 'this.a.b'
                        // 'this.a'
                        if (binding.expr.indexOf(attr) !== -1) {
                            binding.compile(params);
                        }
                        parentAttrPosition = attr.lastIndexOf('.');
                        attr = attrFullName.substr(0, parentAttrPosition);
                    } while (parentAttrPosition !== 4); // 'this.'
                });
            });
        }
    }, {
        key: 'observeObject',
        value: function observeObject(obj, bindings, attrParent) {
            var _this = this;

            var $data = {};
            if ('$data' in obj) {
                $data = obj.$data;
            } else {
                Object.defineProperty(obj, '$data', { value: $data, writable: true });
            }

            var _loop = function _loop(attrName) {
                if (!obj.hasOwnProperty(attrName)) {
                    return 'continue';
                }
                if (attrName === '$template' || attrName === '$data') {
                    return 'continue';
                }
                var attrFullName = attrParent + attrName; // this.foo.bar.attrName
                $data[attrFullName] = obj[attrName];
                _this.observe(obj[attrName], bindings, attrFullName + '.');
                Object.defineProperty(obj, attrName, {
                    get: function get() {
                        return $data[attrFullName];
                    },
                    set: function set(value) {
                        $data[attrFullName] = value;
                        _this.observe(value, bindings, attrFullName + '.');
                        _this.compileBinding(obj, attrFullName);
                    }
                });
            };

            for (var attrName in obj) {
                var _ret = _loop(attrName);

                if (_ret === 'continue') continue;
            }
        }
    }, {
        key: 'observeArray',
        value: function observeArray(arr, bindings, attrParent) {
            var _this2 = this;

            if ('$data' in arr) {
                return;
            }
            var $data = [];
            Object.defineProperty(arr, '$data', { value: $data, writable: true });
            for (var i = 0; i < arr.length; i++) {
                $data[i] = arr[i];
                this.observeArrayDefineIndexProperty(arr, bindings, i, attrParent);
            }
            Object.defineProperty(arr, 'push', {
                configurable: false,
                enumerable: false,
                writable: false,
                value: function value() {
                    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                        args[_key] = arguments[_key];
                    }

                    var length = $data.length;
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = args[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var arg = _step.value;

                            $data[length] = arg;
                            _this2.observe(arg, bindings, attrParent + '.' + length + '.');
                            _this2.observeArrayDefineIndexProperty(arr, bindings, length, attrParent);
                            length++;
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

                    _this2.compileBinding(arr, attrParent, { type: 'push' });
                    return length;
                }
            });
            Object.defineProperty(arr, 'splice', {
                configurable: false,
                enumerable: false,
                writable: false,
                value: function value(start, deleteCount) {
                    for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
                        args[_key2 - 2] = arguments[_key2];
                    }

                    start = start == null ? 0 : start < 0 ? $data.length + start : start;
                    deleteCount = deleteCount == null ? $data.length - start : deleteCount > 0 ? deleteCount : 0;
                    var removed = [];
                    while (deleteCount--) {
                        removed.push($data.splice(start, 1)[0]);
                        arr.length = $data.length;
                    }
                    var _iteratorNormalCompletion2 = true;
                    var _didIteratorError2 = false;
                    var _iteratorError2 = undefined;

                    try {
                        for (var _iterator2 = args[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            var arg = _step2.value;

                            $data.splice(start, 0, arg);
                            _this2.observeArrayDefineIndexProperty(arr, bindings, $data.length - 1, attrParent);
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

                    _this2.compileBinding(arr, attrParent);
                    return removed;
                }
            });
            // TODO: pop, unshift, shift, length
        }
    }, {
        key: 'observeArrayDefineIndexProperty',
        value: function observeArrayDefineIndexProperty(arr, bindings, index, attrParent) {
            var _this3 = this;

            Object.defineProperty(arr, index, {
                configurable: true,
                enumerable: true,
                get: function get() {
                    return arr.$data[index];
                },
                set: function set(value) {
                    arr.$data[index] = value;
                    _this3.observe(value, bindings, attrParent + '.' + index + '.');
                    _this3.compileBinding(arr, attrParent, { type: 'update', value: index });
                }
            });
        }
    }], [{
        key: 'isObject',
        value: function isObject(obj) {
            return Object.prototype.toString.apply(obj) === '[object Object]';
        }
    }, {
        key: 'isArray',
        value: function isArray(obj) {
            return Object.prototype.toString.apply(obj) === '[object Array]';
        }
    }]);

    return ObservableStructure;
}();

exports.default = ObservableStructure;
module.exports = exports['default'];

/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZmNjODM1OTk4NWZhNzQxOTdjODgiLCJ3ZWJwYWNrOi8vLy4vc3JjL25leHRGcmFtZS50cyIsIndlYnBhY2s6Ly8vLi9zcmMvdHNmLnRzIiwid2VicGFjazovLy8uL3NyYy9vYnNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDN0RBLElBQWUsWUFBUyxPQUEwQixtQ0FBVTtBQUFULFNBQW9CLE9BQVcsV0FBUyxVQUMzRjs7a0JBQXlCOzs7Ozs7Ozs7Ozs7Ozs7O0FDQVc7Ozs7QUFDUzs7Ozs7Ozs7QUFFN0MsSUFBWSxTQUFNO0FBQ2QsS0FBQyxJQUFTLE9BQWEsVUFBRTtBQUN0QixRQUFJLElBQVcsV0FBTyxPQUFFO0FBQ2pCLGVBQUssS0FDZjtBQUNKO0FBRWM7OztBQWNWLGlCQUFvQjs7O0FBSlosYUFBcUIsd0JBQUcsSUFBVTtBQUNsQyxhQUFnQixtQkFBRyxJQUFVO0FBQzdCLGFBQU8sVUFBNkI7QUFHcEMsYUFBWSxjQUFXLFNBQWMsY0FDN0M7QUFBQzs7OztpQ0FFbUIsTUFBZ0I7QUFDNUIsaUJBQWlCLGlCQUFJLElBQUssTUFDbEM7QUFFZ0I7OztrQ0FBSyxNQUFtQjtBQUNoQyxpQkFBc0Isc0JBQUks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VUFBTyxNQUFPLFNBQUksR0FDeEU7QUFBQzs7Ozs7Ozs7Ozs7Ozs7OztBQUNHLDJCQUFlLGVBQUksS0FBYztBQUMvQiwyQkFDVjtBQUNEO0FBbkJrQztBQXFCekM7QUFFdUM7Ozt3REFBSSxLQUFVLFVBQU8sT0FBWTs7O0FBQzlELG1CQUFlLGVBQUksS0FBTztBQUNoQiw4QkFBTTtBQUNSLDRCQUFNO0FBQ2IscUJBQUU7QUFDSywyQkFBSSxJQUFNLE1BQ3BCO0FBQUM7QUFDRSxxQkFBRSxhQUFNO0FBQ0osd0JBQU0sTUFBTyxTQUFTO0FBQ3JCLDJCQUFRLFFBQU0sT0FBVSxVQUFZLGFBQU0sTUFBUSxRQUFRO0FBQzFELDJCQUFlLGVBQUksS0FBWSxZQUFFLEVBQU0sTUFBVSxVQUFPLE9BQ2hFO0FBRVI7QUFac0M7QUFhekM7OztpQ0E1SjhCO0FBQ2pCLG1CQUFPLE9BQVUsVUFBUyxTQUFNLE1BQUssU0FDL0M7QUFFc0I7OztnQ0FBSTtBQUNoQixtQkFBTyxPQUFVLFVBQVMsU0FBTSxNQUFLLFNBQy9DO0FBT2MiLCJmaWxlIjoidHNmLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gMSk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgZmNjODM1OTk4NWZhNzQxOTdjODgiLCJjb25zdCBuZXh0RnJhbWUgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8ICgoY2FsbGJhY2spID0+IHdpbmRvdy5zZXRUaW1lb3V0KGNhbGxiYWNrLCAwKSk7XG5leHBvcnQgZGVmYXVsdCBuZXh0RnJhbWU7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9ub2RlX21vZHVsZXMvdHNsaW50LWxvYWRlciEuL3NyYy9uZXh0RnJhbWUudHMiLCJpbXBvcnQgeyBJQmluZGluZ3MgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IG5leHRGcmFtZSBmcm9tICcuL25leHRGcmFtZSc7XG5pbXBvcnQgT2JzZXJ2YWJsZVN0cnVjdHVyZSBmcm9tICcuL29ic2VydmVyJztcblxuY29uc3QgRVZFTlRTID0gW107XG5mb3IgKGNvbnN0IGtleSBpbiBkb2N1bWVudCkge1xuICAgIGlmIChrZXkuc3RhcnRzV2l0aCgnb24nKSkge1xuICAgICAgICBFVkVOVFMucHVzaChrZXkpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVFNGIHtcbiAgICBwcml2YXRlIHN0YXRpYyBwcmVwYXJlVGVtcGxhdGUodGVtcGxhdGUpIHtcbiAgICAgICAgLy8gcmVwbGFjZSB7eyB0aGlzLnNvbWV0aGluZyB9fSB0byA8dGV4dCAkaW5uZXJIVE1MPVwidGhpcy5zb21ldGhpbmdcIj48L3RleHQ+XG4gICAgICAgIHRlbXBsYXRlID0gdGVtcGxhdGUucmVwbGFjZShuZXcgUmVnRXhwKCdcXHtcXHsoW159XSspXFx9XFx9JywgJ2cnKSwgKG1hdGNoLCBleHByKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYDx0ZXh0ICRpbm5lckhUTUw9XCIke2V4cHJ9XCI+PC90ZXh0PmA7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdGVtcGxhdGU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByb290RWxlbWVudDtcbiAgICBwcml2YXRlIGluaXRpYWxpemVkQ29tcG9uZW50cyA9IG5ldyBNYXAoKTtcbiAgICBwcml2YXRlIGNvbXBvbmVudENsYXNzZXMgPSBuZXcgTWFwKCk7XG4gICAgcHJpdmF0ZSB3YXRjaGVyID0gbmV3IE9ic2VydmFibGVTdHJ1Y3R1cmUoKTtcblxuICAgIGNvbnN0cnVjdG9yKHNlbGVjdG9yKSB7XG4gICAgICAgIHRoaXMucm9vdEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVnaXN0ZXIobmFtZSwgY29tcG9uZW50Q2xhc3MpIHtcbiAgICAgICAgdGhpcy5jb21wb25lbnRDbGFzc2VzLnNldChuYW1lLCBjb21wb25lbnRDbGFzcyk7XG4gICAgfVxuXG4gICAgcHVibGljIGNvbXBvbmVudChuYW1lLCBjb21wb25lbnRJbnN0YW5jZSkge1xuICAgICAgICB0aGlzLmluaXRpYWxpemVkQ29tcG9uZW50cy5zZXQobmFtZSwgY29tcG9uZW50SW5zdGFuY2UpO1xuICAgIH1cblxuICAgIHB1YmxpYyBydW4oY29tcG9uZW50KSB7XG4gICAgICAgIHRoaXMucHJvY2Vzcyhjb21wb25lbnQsIHRoaXMucm9vdEVsZW1lbnQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgcHJvY2Vzcyhjb21wb25lbnQsIGRvbUVsZW1lbnQsIGN1c3RvbVRlbXBsYXRlID0gJycsIGN1c3RvbVZhck5hbWVzID0gW10sIGN1c3RvbVZhclZhbHVlcyA9IFtdKSB7XG4gICAgICAgIGRvbUVsZW1lbnQuaW5uZXJIVE1MID0gVFNGLnByZXBhcmVUZW1wbGF0ZShjdXN0b21UZW1wbGF0ZSB8fCBjb21wb25lbnQuJHRlbXBsYXRlKTtcblxuICAgICAgICBjb25zdCBkeW5hbWljQmluZGluZ3NJZiA9IHRoaXMucHJlcGFyZUR5bmFtaWNJZihjb21wb25lbnQsIGRvbUVsZW1lbnQpO1xuICAgICAgICBjb25zdCBkeW5hbWljQmluZGluZ3NGb3IgPSB0aGlzLnByZXBhcmVEeW5hbWljRm9yKGNvbXBvbmVudCwgZG9tRWxlbWVudCk7XG4gICAgICAgIGNvbnN0IHRleHROb2Rlc0JpbmRpbmdzID0gdGhpcy5wcm9jZXNzVGV4dE5vZGVzKGNvbXBvbmVudCwgZG9tRWxlbWVudCwgY3VzdG9tVmFyTmFtZXMsIGN1c3RvbVZhclZhbHVlcyk7XG4gICAgICAgIGNvbnN0IGJpbmRpbmdzID0gZHluYW1pY0JpbmRpbmdzSWYuY29uY2F0KGR5bmFtaWNCaW5kaW5nc0ZvcikuY29uY2F0KHRleHROb2Rlc0JpbmRpbmdzKTtcblxuICAgICAgICB0aGlzLndhdGNoZXIub2JzZXJ2ZShjb21wb25lbnQsIGJpbmRpbmdzKTtcbiAgICAgICAgdGhpcy5wcm9jZXNzRXZlbnRzKGNvbXBvbmVudCwgZG9tRWxlbWVudCk7XG4gICAgICAgIHRoaXMucHJvY2Vzc0NvbXBvbmVudHMoZG9tRWxlbWVudCk7XG5cbiAgICAgICAgdGhpcy5wcm9jZXNzRHluYW1pYyhjb21wb25lbnQsIGRvbUVsZW1lbnQsIGR5bmFtaWNCaW5kaW5nc0lmKTtcbiAgICAgICAgdGhpcy5wcm9jZXNzRHluYW1pYyhjb21wb25lbnQsIGRvbUVsZW1lbnQsIGR5bmFtaWNCaW5kaW5nc0Zvcik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBwcm9jZXNzVGV4dE5vZGVzKGNvbXBvbmVudCwgZG9tRWxlbWVudCwgY3VzdG9tVmFyTmFtZXMgPSBbXSwgY3VzdG9tVmFyVmFsdWVzID0gW10pOiBJQmluZGluZ3Mge1xuICAgICAgICBjb25zdCBiaW5kaW5nczogSUJpbmRpbmdzID0gW107XG4gICAgICAgIGNvbnN0IG1hdGNoZXMgPSBkb21FbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tcXFxcJGlubmVySFRNTF0nKTtcbiAgICAgICAgW10uZm9yRWFjaC5jYWxsKG1hdGNoZXMsIChtYXRjaCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZXhwciA9IG1hdGNoLmdldEF0dHJpYnV0ZSgnJGlubmVySFRNTCcpO1xuICAgICAgICAgICAgY29uc3QgdGV4dE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJyk7XG4gICAgICAgICAgICBjb25zdCBldmFsRnVuY3Rpb24gPSBuZXcgRnVuY3Rpb24oY3VzdG9tVmFyTmFtZXMuam9pbignLCcpLCAncmV0dXJuICcgKyBleHByKTtcbiAgICAgICAgICAgIG1hdGNoLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKHRleHROb2RlLCBtYXRjaCk7XG4gICAgICAgICAgICBjb25zdCBiaW5kaW5nID0ge1xuICAgICAgICAgICAgICAgIGV4cHIsXG4gICAgICAgICAgICAgICAgY29tcG9uZW50LFxuICAgICAgICAgICAgICAgIGN1c3RvbVZhck5hbWVzLFxuICAgICAgICAgICAgICAgIGN1c3RvbVZhclZhbHVlcyxcbiAgICAgICAgICAgICAgICB0ZXh0Tm9kZSxcbiAgICAgICAgICAgICAgICBldmFsRnVuY3Rpb24sXG4gICAgICAgICAgICAgICAgY29tcGlsZTogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0ZXh0Tm9kZS5kYXRhID0gZXZhbEZ1bmN0aW9uLmFwcGx5KGNvbXBvbmVudCwgY3VzdG9tVmFyVmFsdWVzKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGJpbmRpbmdzLnB1c2goYmluZGluZyk7XG4gICAgICAgICAgICBiaW5kaW5nLmNvbXBpbGUoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGJpbmRpbmdzO1xuICAgIH1cblxuICAgIHByaXZhdGUgcHJvY2Vzc0V2ZW50cyhjb21wb25lbnQsIGRvbUVsZW1lbnQpIHtcbiAgICAgICAgZm9yIChjb25zdCBldmVudCBvZiBFVkVOVFMpIHtcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSBkb21FbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tcXFxcJCcgKyBldmVudCArICddJyk7XG4gICAgICAgICAgICBbXS5mb3JFYWNoLmNhbGwobWF0Y2hlcywgKG1hdGNoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbGlzdGVuZXIgPSBuZXcgRnVuY3Rpb24oJyRldmVudCcsIG1hdGNoLmdldEF0dHJpYnV0ZSgnJCcgKyBldmVudCkpO1xuICAgICAgICAgICAgICAgIG1hdGNoLnJlbW92ZUF0dHJpYnV0ZSgnJCcgKyBldmVudCk7XG4gICAgICAgICAgICAgICAgbWF0Y2guYWRkRXZlbnRMaXN0ZW5lcihldmVudC5zdWJzdHJpbmcoMiksICgkZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbmV4dEZyYW1lKCgpID0+IGxpc3RlbmVyLmNhbGwoY29tcG9uZW50LCAkZXZlbnQpKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBwcmVwYXJlRHluYW1pY0lmKGNvbXBvbmVudCwgZG9tRWxlbWVudCk6IElCaW5kaW5ncyB7XG4gICAgICAgIGNvbnN0IGJpbmRpbmdzOiBJQmluZGluZ3MgPSBbXTtcbiAgICAgICAgbGV0IG1hdGNoID0gZG9tRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdbXFxcXCRpZl0nKTtcbiAgICAgICAgd2hpbGUgKG1hdGNoICYmIG1hdGNoLmdldEF0dHJpYnV0ZSkge1xuICAgICAgICAgICAgY29uc3QgZXhwciA9IG1hdGNoLmdldEF0dHJpYnV0ZSgnJGlmJyk7XG4gICAgICAgICAgICBtYXRjaC5yZW1vdmVBdHRyaWJ1dGUoJyRpZicpO1xuICAgICAgICAgICAgY29uc3QgaHRtbCA9IG1hdGNoLm91dGVySFRNTDtcbiAgICAgICAgICAgIGNvbnN0IHRleHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJycpO1xuICAgICAgICAgICAgY29uc3QgZXZhbEZ1bmN0aW9uID0gbmV3IEZ1bmN0aW9uKCcnLCAncmV0dXJuICcgKyBleHByKTtcbiAgICAgICAgICAgIG1hdGNoLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKHRleHROb2RlLCBtYXRjaCk7XG4gICAgICAgICAgICBsZXQgZ2VuZXJlYXRlZEVsZW1lbnQ7XG4gICAgICAgICAgICBjb25zdCBiaW5kaW5nID0ge1xuICAgICAgICAgICAgICAgIGV4cHIsXG4gICAgICAgICAgICAgICAgY29tcG9uZW50LFxuICAgICAgICAgICAgICAgIGN1c3RvbVZhck5hbWVzOiBbXSxcbiAgICAgICAgICAgICAgICBjdXN0b21WYXJWYWx1ZXM6IFtdLFxuICAgICAgICAgICAgICAgIHRleHROb2RlLFxuICAgICAgICAgICAgICAgIGV2YWxGdW5jdGlvbixcbiAgICAgICAgICAgICAgICBjb21waWxlOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChldmFsRnVuY3Rpb24uYXBwbHkoY29tcG9uZW50KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2VuZXJlYXRlZEVsZW1lbnQgPSB0aGlzLm5ld0VsZW1lbnQoaHRtbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0Tm9kZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShnZW5lcmVhdGVkRWxlbWVudCwgdGV4dE5vZGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9jZXNzKGNvbXBvbmVudCwgZ2VuZXJlYXRlZEVsZW1lbnQsIGdlbmVyZWF0ZWRFbGVtZW50LmlubmVySFRNTCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ2VuZXJlYXRlZEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZW5lcmVhdGVkRWxlbWVudC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZW5lcmVhdGVkRWxlbWVudCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGJpbmRpbmdzLnB1c2goYmluZGluZyk7XG4gICAgICAgICAgICBtYXRjaCA9IGRvbUVsZW1lbnQucXVlcnlTZWxlY3RvcignW1xcXFwkaWZdJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJpbmRpbmdzO1xuICAgIH1cbiAgICBwcml2YXRlIHByZXBhcmVEeW5hbWljRm9yKGNvbXBvbmVudCwgZG9tRWxlbWVudCk6IElCaW5kaW5ncyB7XG4gICAgICAgIGNvbnN0IGJpbmRpbmdzOiBJQmluZGluZ3MgPSBbXTtcbiAgICAgICAgbGV0IG1hdGNoID0gZG9tRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdbXFxcXCRmb3JdJyk7XG4gICAgICAgIHdoaWxlIChtYXRjaCAmJiBtYXRjaC5nZXRBdHRyaWJ1dGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGV4cHIgPSBtYXRjaC5nZXRBdHRyaWJ1dGUoJyRmb3InKTtcbiAgICAgICAgICAgIG1hdGNoLnJlbW92ZUF0dHJpYnV0ZSgnJGZvcicpO1xuICAgICAgICAgICAgY29uc3QgaHRtbCA9IG1hdGNoLm91dGVySFRNTDtcbiAgICAgICAgICAgIGNvbnN0IHRleHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJycpO1xuICAgICAgICAgICAgY29uc3QgZXZhbEZ1bmN0aW9uID0gbmV3IEZ1bmN0aW9uKCcnLCAncmV0dXJuICcgKyBleHByKTtcbiAgICAgICAgICAgIG1hdGNoLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKHRleHROb2RlLCBtYXRjaCk7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50SXRlbXMgPSBbXTtcbiAgICAgICAgICAgIGNvbnN0IGJpbmRpbmcgPSB7XG4gICAgICAgICAgICAgICAgZXhwcixcbiAgICAgICAgICAgICAgICBjb21wb25lbnQsXG4gICAgICAgICAgICAgICAgY3VzdG9tVmFyTmFtZXM6IFtdLFxuICAgICAgICAgICAgICAgIGN1c3RvbVZhclZhbHVlczogW10sXG4gICAgICAgICAgICAgICAgdGV4dE5vZGUsXG4gICAgICAgICAgICAgICAgZXZhbEZ1bmN0aW9uLFxuICAgICAgICAgICAgICAgIGNvbXBpbGU6IChwYXJhbXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcmFtcyAmJiBwYXJhbXMudHlwZSA9PT0gJ3VwZGF0ZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGRvIG5vdCByZS1yZW5kZXIgbGlzdCwgZG9tIHNob3VsZCBiZSB1cGRhdGVkIGF1dG9tYXRpY2FsbHlcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwYXJhbXMgJiYgcGFyYW1zLnR5cGUgPT09ICdwdXNoJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaXRlbXMgPSBldmFsRnVuY3Rpb24uYXBwbHkoY29tcG9uZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGluZGV4ID0gY3VycmVudEl0ZW1zLmxlbmd0aDsgaW5kZXggPCBpdGVtcy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdFbGVtZW50ID0gdGhpcy5uZXdFbGVtZW50KGh0bWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHROb2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5ld0VsZW1lbnQsIHRleHROb2RlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50SXRlbXMucHVzaCh7IGVsZW1lbnQ6IG5ld0VsZW1lbnQgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9jZXNzKGNvbXBvbmVudCwgbmV3RWxlbWVudCwgbmV3RWxlbWVudC5pbm5lckhUTUwsIFsnJGluZGV4J10sIFtpbmRleF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRJdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50SXRlbXMuZm9yRWFjaCgoaXRlbSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5lbGVtZW50LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRJdGVtcy5sZW5ndGggPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaXRlbXMgPSBldmFsRnVuY3Rpb24uYXBwbHkoY29tcG9uZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zLmZvckVhY2goKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3RWxlbWVudCA9IHRoaXMubmV3RWxlbWVudChodG1sKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0Tm9kZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShuZXdFbGVtZW50LCB0ZXh0Tm9kZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudEl0ZW1zLnB1c2goeyBlbGVtZW50OiBuZXdFbGVtZW50IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvY2Vzcyhjb21wb25lbnQsIG5ld0VsZW1lbnQsIG5ld0VsZW1lbnQuaW5uZXJIVE1MLCBbJyRpbmRleCddLCBbaW5kZXhdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBiaW5kaW5ncy5wdXNoKGJpbmRpbmcpO1xuICAgICAgICAgICAgbWF0Y2ggPSBkb21FbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tcXFxcJGZvcl0nKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYmluZGluZ3M7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBwcm9jZXNzRHluYW1pYyhjb21wb25lbnQsIGRvbUVsZW1lbnQsIGJpbmRpbmdzKSB7XG4gICAgICAgIGJpbmRpbmdzLmZvckVhY2goKGJpbmRpbmcpID0+IGJpbmRpbmcuY29tcGlsZSgpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHByb2Nlc3NDb21wb25lbnRzKGRvbUVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5pbml0aWFsaXplZENvbXBvbmVudHMuZm9yRWFjaCgoY29tcG9uZW50SW5zdGFuY2UsIG5hbWUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb21FbGVtZW50LnF1ZXJ5U2VsZWN0b3IobmFtZSk7XG4gICAgICAgICAgICBpZiAoZWxlbWVudCkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvY2Vzcyhjb21wb25lbnRJbnN0YW5jZSwgZWxlbWVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNvbXBvbmVudENsYXNzZXMuZm9yRWFjaCgoY29tcG9uZW50Q2xhc3MsIG5hbWUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSBkb21FbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwobmFtZSk7XG4gICAgICAgICAgICBbXS5mb3JFYWNoLmNhbGwobWF0Y2hlcywgKGVsZW1lbnQpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3MobmV3IGNvbXBvbmVudENsYXNzKCksIGVsZW1lbnQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgbmV3RWxlbWVudChodG1sOiBzdHJpbmcpOiBIVE1MRWxlbWVudCB7XG4gICAgICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBkaXYuaW5uZXJIVE1MID0gaHRtbDtcbiAgICAgICAgcmV0dXJuIGRpdi5maXJzdENoaWxkIGFzIEhUTUxFbGVtZW50O1xuICAgIH1cbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL25vZGVfbW9kdWxlcy90c2xpbnQtbG9hZGVyIS4vc3JjL3RzZi50cyIsImltcG9ydCB7IElCaW5kaW5ncyB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgbmV4dEZyYW1lIGZyb20gJy4vbmV4dEZyYW1lJztcblxuY29uc3Qgb2JzZXJ2ZXJJZCA9IDA7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9ic2VydmFibGVTdHJ1Y3R1cmUge1xuXG4gICAgcHJpdmF0ZSBzdGF0aWMgaXNPYmplY3Qob2JqKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmFwcGx5KG9iaikgPT09ICdbb2JqZWN0IE9iamVjdF0nO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIGlzQXJyYXkob2JqKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmFwcGx5KG9iaikgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhbGxXYXRjaGVkT2JqZWN0cyA9IG5ldyBNYXAoKTtcblxuICAgIHByaXZhdGUgYmluZGluZ3NCeUF0dHIgPSB7fTtcbiAgICBwcml2YXRlIGJpbmRpbmdzO1xuXG4gICAgcHVibGljIG9ic2VydmUob2JqLCBiaW5kaW5nczogSUJpbmRpbmdzLCBhdHRyRnVsbE5hbWU6IHN0cmluZyA9ICd0aGlzLicpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBvYmogIT09ICdvYmplY3QnKSB7IHJldHVybjsgfVxuXG4gICAgICAgIGxldCB3YXRjaGVkQmluZGluZ3M7XG4gICAgICAgIGlmICh0aGlzLmFsbFdhdGNoZWRPYmplY3RzLmhhcyhvYmopKSB7XG4gICAgICAgICAgICB3YXRjaGVkQmluZGluZ3MgPSB0aGlzLmFsbFdhdGNoZWRPYmplY3RzLmdldChvYmopO1xuICAgICAgICAgICAgd2F0Y2hlZEJpbmRpbmdzID0gd2F0Y2hlZEJpbmRpbmdzLmNvbmNhdChiaW5kaW5ncyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3YXRjaGVkQmluZGluZ3MgPSBiaW5kaW5ncztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmFsbFdhdGNoZWRPYmplY3RzLnNldChvYmosIHdhdGNoZWRCaW5kaW5ncyk7XG5cbiAgICAgICAgaWYgKE9ic2VydmFibGVTdHJ1Y3R1cmUuaXNPYmplY3Qob2JqKSkge1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlT2JqZWN0KG9iaiwgYmluZGluZ3MsIGF0dHJGdWxsTmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKE9ic2VydmFibGVTdHJ1Y3R1cmUuaXNBcnJheShvYmopKSB7XG4gICAgICAgICAgICB0aGlzLm9ic2VydmVBcnJheShvYmosIGJpbmRpbmdzLCBhdHRyRnVsbE5hbWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjb21waWxlQmluZGluZyhvYmosIGF0dHJGdWxsTmFtZSwgcGFyYW1zID0ge30pIHtcblxuICAgICAgICBjb25zdCBiaW5kaW5ncyA9IHRoaXMuYWxsV2F0Y2hlZE9iamVjdHMuZ2V0KG9iaik7XG4gICAgICAgIG5leHRGcmFtZSgoKSA9PiB7XG4gICAgICAgICAgICBiaW5kaW5ncy5mb3JFYWNoKChiaW5kaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGF0dHIgPSBhdHRyRnVsbE5hbWU7XG4gICAgICAgICAgICAgICAgbGV0IHBhcmVudEF0dHJQb3NpdGlvbjtcbiAgICAgICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgICAgIC8vICd0aGlzLmEuYi5jJ1xuICAgICAgICAgICAgICAgICAgICAvLyAndGhpcy5hLmInXG4gICAgICAgICAgICAgICAgICAgIC8vICd0aGlzLmEnXG4gICAgICAgICAgICAgICAgICAgIGlmIChiaW5kaW5nLmV4cHIuaW5kZXhPZihhdHRyKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJpbmRpbmcuY29tcGlsZShwYXJhbXMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudEF0dHJQb3NpdGlvbiA9IGF0dHIubGFzdEluZGV4T2YoJy4nKTtcbiAgICAgICAgICAgICAgICAgICAgYXR0ciA9IGF0dHJGdWxsTmFtZS5zdWJzdHIoMCwgcGFyZW50QXR0clBvc2l0aW9uKTtcbiAgICAgICAgICAgICAgICB9IHdoaWxlIChwYXJlbnRBdHRyUG9zaXRpb24gIT09IDQpOyAvLyAndGhpcy4nXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvYnNlcnZlT2JqZWN0KG9iaiwgYmluZGluZ3MsIGF0dHJQYXJlbnQ6IHN0cmluZykge1xuICAgICAgICBsZXQgJGRhdGEgPSB7fTtcbiAgICAgICAgaWYgKCckZGF0YScgaW4gb2JqKSB7XG4gICAgICAgICAgICAkZGF0YSA9IG9iai4kZGF0YTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosICckZGF0YScsIHt2YWx1ZTogJGRhdGEsIHdyaXRhYmxlOiB0cnVlfSk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGNvbnN0IGF0dHJOYW1lIGluIG9iaikge1xuICAgICAgICAgICAgaWYgKCFvYmouaGFzT3duUHJvcGVydHkoYXR0ck5hbWUpKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChhdHRyTmFtZSA9PT0gJyR0ZW1wbGF0ZScgfHwgYXR0ck5hbWUgPT09ICckZGF0YScpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgYXR0ckZ1bGxOYW1lID0gYXR0clBhcmVudCArIGF0dHJOYW1lOyAvLyB0aGlzLmZvby5iYXIuYXR0ck5hbWVcbiAgICAgICAgICAgICRkYXRhW2F0dHJGdWxsTmFtZV0gPSBvYmpbYXR0ck5hbWVdO1xuXG4gICAgICAgICAgICB0aGlzLm9ic2VydmUob2JqW2F0dHJOYW1lXSwgYmluZGluZ3MsIGF0dHJGdWxsTmFtZSArICcuJyk7XG5cbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGF0dHJOYW1lLCB7XG4gICAgICAgICAgICAgICAgZ2V0OiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkZGF0YVthdHRyRnVsbE5hbWVdO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc2V0OiAodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgJGRhdGFbYXR0ckZ1bGxOYW1lXSA9IHZhbHVlO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub2JzZXJ2ZSh2YWx1ZSwgYmluZGluZ3MsIGF0dHJGdWxsTmFtZSArICcuJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29tcGlsZUJpbmRpbmcob2JqLCBhdHRyRnVsbE5hbWUpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb2JzZXJ2ZUFycmF5KGFyciwgYmluZGluZ3MsIGF0dHJQYXJlbnQ6IHN0cmluZykge1xuICAgICAgICBpZiAoJyRkYXRhJyBpbiBhcnIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0ICRkYXRhID0gW107XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShhcnIsICckZGF0YScsIHsgdmFsdWU6ICRkYXRhLCB3cml0YWJsZTogdHJ1ZSB9KTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICRkYXRhW2ldID0gYXJyW2ldO1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlQXJyYXlEZWZpbmVJbmRleFByb3BlcnR5KGFyciwgYmluZGluZ3MsIGksIGF0dHJQYXJlbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGFyciwgJ3B1c2gnLCB7XG4gICAgICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICB3cml0YWJsZTogZmFsc2UsXG4gICAgICAgICAgICB2YWx1ZTogKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgbGVuZ3RoID0gJGRhdGEubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgYXJnIG9mIGFyZ3MpIHtcbiAgICAgICAgICAgICAgICAgICAgJGRhdGFbbGVuZ3RoXSA9IGFyZztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vYnNlcnZlKGFyZywgYmluZGluZ3MsIGF0dHJQYXJlbnQgKyAnLicgKyBsZW5ndGggKyAnLicpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9ic2VydmVBcnJheURlZmluZUluZGV4UHJvcGVydHkoYXJyLCBiaW5kaW5ncywgbGVuZ3RoLCBhdHRyUGFyZW50KTtcbiAgICAgICAgICAgICAgICAgICAgbGVuZ3RoKys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuY29tcGlsZUJpbmRpbmcoYXJyLCBhdHRyUGFyZW50LCB7IHR5cGU6ICdwdXNoJyB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGVuZ3RoO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGFyciwgJ3NwbGljZScsIHtcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHZhbHVlOiAoc3RhcnQsIGRlbGV0ZUNvdW50LCAuLi5hcmdzKSA9PiB7XG4gICAgICAgICAgICAgICAgc3RhcnQgPSBzdGFydCA9PSBudWxsID8gMCA6IHN0YXJ0IDwgMCA/ICRkYXRhLmxlbmd0aCArIHN0YXJ0IDogc3RhcnQ7XG4gICAgICAgICAgICAgICAgZGVsZXRlQ291bnQgPSBkZWxldGVDb3VudCA9PSBudWxsID8gJGRhdGEubGVuZ3RoIC0gc3RhcnQgOiBkZWxldGVDb3VudCA+IDAgPyBkZWxldGVDb3VudCA6IDA7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVtb3ZlZCA9IFtdO1xuICAgICAgICAgICAgICAgIHdoaWxlIChkZWxldGVDb3VudC0tKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZWQucHVzaCgkZGF0YS5zcGxpY2Uoc3RhcnQsIDEpWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgYXJyLmxlbmd0aCA9ICRkYXRhLmxlbmd0aDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBhcmcgb2YgYXJncykge1xuICAgICAgICAgICAgICAgICAgICAkZGF0YS5zcGxpY2Uoc3RhcnQsIDAsIGFyZyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub2JzZXJ2ZUFycmF5RGVmaW5lSW5kZXhQcm9wZXJ0eShhcnIsIGJpbmRpbmdzLCAkZGF0YS5sZW5ndGggLSAxLCBhdHRyUGFyZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5jb21waWxlQmluZGluZyhhcnIsIGF0dHJQYXJlbnQpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZW1vdmVkO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIFRPRE86IHBvcCwgdW5zaGlmdCwgc2hpZnQsIGxlbmd0aFxuICAgIH1cblxuICAgIHByaXZhdGUgb2JzZXJ2ZUFycmF5RGVmaW5lSW5kZXhQcm9wZXJ0eShhcnIsIGJpbmRpbmdzLCBpbmRleCwgYXR0clBhcmVudCkge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoYXJyLCBpbmRleCwge1xuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGdldDogKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBhcnIuJGRhdGFbaW5kZXhdO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldDogKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgYXJyLiRkYXRhW2luZGV4XSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIHRoaXMub2JzZXJ2ZSh2YWx1ZSwgYmluZGluZ3MsIGF0dHJQYXJlbnQgKyAnLicgKyBpbmRleCArICcuJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5jb21waWxlQmluZGluZyhhcnIsIGF0dHJQYXJlbnQsIHsgdHlwZTogJ3VwZGF0ZScsIHZhbHVlOiBpbmRleCB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL25vZGVfbW9kdWxlcy90c2xpbnQtbG9hZGVyIS4vc3JjL29ic2VydmVyLnRzIl0sInNvdXJjZVJvb3QiOiIifQ==