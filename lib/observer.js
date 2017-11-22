Object.defineProperty(exports, "__esModule", { value: true });
var observerId = 0;
var ObservableStructure = /** @class */ (function () {
    function ObservableStructure() {
        this.allWatchedObjects = new Map();
        this.bindingsByAttr = {};
    }
    ObservableStructure.isObject = function (obj) {
        return Object.prototype.toString.apply(obj) === '[object Object]';
    };
    ObservableStructure.isArray = function (obj) {
        return Object.prototype.toString.apply(obj) === '[object Array]';
    };
    ObservableStructure.prototype.observe = function (obj, bindings, attrFullName) {
        if (attrFullName === void 0) { attrFullName = 'this.'; }
        if (typeof obj !== 'object') {
            return;
        }
        var watchedBindings;
        if (this.allWatchedObjects.has(obj)) {
            watchedBindings = this.allWatchedObjects.get(obj);
            watchedBindings = watchedBindings.concat(bindings);
        }
        else {
            watchedBindings = bindings;
        }
        this.allWatchedObjects.set(obj, watchedBindings);
        if (ObservableStructure.isObject(obj)) {
            this.observeObject(obj, bindings, attrFullName);
        }
        if (ObservableStructure.isArray(obj)) {
            this.observeArray(obj, bindings, attrFullName);
        }
    };
    ObservableStructure.prototype.compileBinding = function (obj, attrFullName, params) {
        if (params === void 0) { params = {}; }
        var bindings = this.allWatchedObjects.get(obj);
        window.requestAnimationFrame(function () {
            bindings.forEach(function (binding) {
                var attr = attrFullName;
                var parentAttrPosition;
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
    };
    ObservableStructure.prototype.observeObject = function (obj, bindings, attrParent) {
        var _this = this;
        var $data = {};
        if ('$data' in obj) {
            $data = obj.$data;
        }
        else {
            Object.defineProperty(obj, '$data', { value: $data, writable: true });
        }
        var _loop_1 = function (attrName) {
            if (!obj.hasOwnProperty(attrName)) {
                return "continue";
            }
            if (attrName === '$template' || attrName === '$data') {
                return "continue";
            }
            var attrFullName = attrParent + attrName; // this.foo.bar.attrName
            $data[attrFullName] = obj[attrName];
            this_1.observe(obj[attrName], bindings, attrFullName + '.');
            Object.defineProperty(obj, attrName, {
                get: function () {
                    return $data[attrFullName];
                },
                set: function (value) {
                    $data[attrFullName] = value;
                    _this.observe(value, bindings, attrFullName + '.');
                    _this.compileBinding(obj, attrFullName);
                },
            });
        };
        var this_1 = this;
        for (var attrName in obj) {
            _loop_1(attrName);
        }
    };
    ObservableStructure.prototype.observeArray = function (arr, bindings, attrParent) {
        var _this = this;
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
            value: function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var length = $data.length;
                for (var _a = 0, args_1 = args; _a < args_1.length; _a++) {
                    var arg = args_1[_a];
                    $data[length] = arg;
                    _this.observe(arg, bindings, attrParent + '.' + length + '.');
                    _this.observeArrayDefineIndexProperty(arr, bindings, length, attrParent);
                    length++;
                }
                _this.compileBinding(arr, attrParent, { type: 'push' });
                return length;
            },
        });
        Object.defineProperty(arr, 'splice', {
            configurable: false,
            enumerable: false,
            writable: false,
            value: function (start, deleteCount) {
                var args = [];
                for (var _i = 2; _i < arguments.length; _i++) {
                    args[_i - 2] = arguments[_i];
                }
                start = start == null ? 0 : start < 0 ? $data.length + start : start;
                deleteCount = deleteCount == null ? $data.length - start : deleteCount > 0 ? deleteCount : 0;
                var removed = [];
                while (deleteCount--) {
                    removed.push($data.splice(start, 1)[0]);
                    arr.length = $data.length;
                }
                for (var _a = 0, args_2 = args; _a < args_2.length; _a++) {
                    var arg = args_2[_a];
                    $data.splice(start, 0, arg);
                    _this.observeArrayDefineIndexProperty(arr, bindings, $data.length - 1, attrParent);
                }
                _this.compileBinding(arr, attrParent);
                return removed;
            },
        });
        // TODO: pop, unshift, shift, length
    };
    ObservableStructure.prototype.observeArrayDefineIndexProperty = function (arr, bindings, index, attrParent) {
        var _this = this;
        Object.defineProperty(arr, index, {
            configurable: true,
            enumerable: true,
            get: function () {
                return arr.$data[index];
            },
            set: function (value) {
                arr.$data[index] = value;
                _this.observe(value, bindings, attrParent + '.' + index + '.');
                _this.compileBinding(arr, attrParent, { type: 'update', value: index });
            },
        });
    };
    return ObservableStructure;
}());
exports.ObservableStructure = ObservableStructure;
