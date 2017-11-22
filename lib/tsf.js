Object.defineProperty(exports, "__esModule", { value: true });
var observer_1 = require("./observer");
var EVENTS = [];
for (var key in document) {
    if (key.startsWith('on')) {
        EVENTS.push(key);
    }
}
var TSF = /** @class */ (function () {
    function TSF(selector) {
        this.initializedComponents = new Map();
        this.componentClasses = new Map();
        this.watcher = new observer_1.ObservableStructure();
        this.rootElement = document.querySelector(selector);
    }
    TSF.prepareTemplate = function (template) {
        // replace {{ this.something }} to <text $innerHTML="this.something"></text>
        template = template.replace(new RegExp('\{\{([^}]+)\}\}', 'g'), function (match, expr) {
            return "<text $innerHTML=\"" + expr + "\"></text>";
        });
        return template;
    };
    TSF.prototype.register = function (name, componentClass) {
        this.componentClasses.set(name, componentClass);
    };
    TSF.prototype.component = function (name, componentInstance) {
        this.initializedComponents.set(name, componentInstance);
    };
    TSF.prototype.run = function (component) {
        this.process(component, this.rootElement);
    };
    TSF.prototype.process = function (component, domElement, customTemplate, contextVars, contextValues) {
        if (customTemplate === void 0) { customTemplate = ''; }
        if (contextVars === void 0) { contextVars = []; }
        if (contextValues === void 0) { contextValues = []; }
        domElement.innerHTML = TSF.prepareTemplate(customTemplate || component.$template);
        var dynamicBindingsIf = this.prepareDynamicIf(component, domElement);
        var dynamicBindingsFor = this.prepareDynamicFor(component, domElement);
        var textNodesBindings = this.processTextNodes(component, domElement, contextVars, contextValues);
        var attrBindings = this.processAttributes(component, domElement, contextVars, contextValues);
        var bindings = dynamicBindingsIf.concat(dynamicBindingsFor).concat(textNodesBindings).concat(attrBindings);
        this.watcher.observe(component, bindings);
        this.processEvents(component, domElement, contextVars, contextValues);
        this.processComponents(domElement);
        this.processDynamic(component, domElement, dynamicBindingsIf);
        this.processDynamic(component, domElement, dynamicBindingsFor);
    };
    TSF.prototype.processTextNodes = function (component, domElement, contextVars, contextValues) {
        if (contextVars === void 0) { contextVars = []; }
        if (contextValues === void 0) { contextValues = []; }
        var bindings = [];
        var matches = domElement.querySelectorAll('[\\$innerHTML]');
        [].forEach.call(matches, function (match) {
            var expr = match.getAttribute('$innerHTML');
            var textNode = document.createTextNode('');
            var evalFunction = new Function(contextVars.join(','), 'return ' + expr);
            match.parentNode.replaceChild(textNode, match);
            var binding = {
                expr: expr,
                component: component,
                contextVars: contextVars,
                contextValues: contextValues,
                textNode: textNode,
                evalFunction: evalFunction,
                compile: function () {
                    textNode.data = evalFunction.apply(component, contextValues);
                },
            };
            bindings.push(binding);
            binding.compile();
        });
        return bindings;
    };
    TSF.prototype.processEvents = function (component, domElement, contextVars, contextValues) {
        if (contextVars === void 0) { contextVars = []; }
        if (contextValues === void 0) { contextValues = []; }
        var _loop_1 = function (event_1) {
            var matches = domElement.querySelectorAll('[\\$' + event_1 + ']');
            [].forEach.call(matches, function (match) {
                var listener = new Function(contextVars.concat('$event').join(','), match.getAttribute('$' + event_1));
                match.removeAttribute('$' + event_1);
                match.addEventListener(event_1.substring(2), function ($event) {
                    window.requestAnimationFrame(function () { return listener.apply(component, contextValues.concat($event)); });
                });
            });
        };
        for (var _i = 0, EVENTS_1 = EVENTS; _i < EVENTS_1.length; _i++) {
            var event_1 = EVENTS_1[_i];
            _loop_1(event_1);
        }
    };
    TSF.prototype.processAttributes = function (component, domElement, contextVars, contextValues) {
        if (contextVars === void 0) { contextVars = []; }
        if (contextValues === void 0) { contextValues = []; }
        var bindings = [];
        var matches = domElement.parentNode.querySelectorAll('[\\$attr]');
        [].forEach.call(matches, function (match) {
            var expr = match.getAttribute('$attr');
            var textNode = document.createTextNode('');
            var evalFunction = new Function(contextVars.join(','), 'return ' + expr);
            var binding = {
                expr: expr,
                component: component,
                contextVars: [],
                contextValues: [],
                textNode: textNode,
                evalFunction: evalFunction,
                compile: function () {
                    var attributes = evalFunction.apply(component, contextValues);
                    Object.keys(attributes).forEach(function (attr) {
                        if (attributes[attr] === null) {
                            match.removeAttribute(attr);
                        }
                        else {
                            match.setAttribute(attr, attributes[attr]);
                        }
                    });
                },
            };
            bindings.push(binding);
            binding.compile();
            match.removeAttribute('$attr');
        });
        return bindings;
    };
    TSF.prototype.prepareDynamicIf = function (component, domElement) {
        var _this = this;
        var bindings = [];
        var match = domElement.querySelector('[\\$if]');
        var _loop_2 = function () {
            var expr = match.getAttribute('$if');
            match.removeAttribute('$if');
            var html = match.outerHTML;
            var textNode = document.createTextNode('');
            var evalFunction = new Function('', 'return ' + expr);
            match.parentNode.replaceChild(textNode, match);
            var genereatedElement;
            var binding = {
                expr: expr,
                component: component,
                contextVars: [],
                contextValues: [],
                textNode: textNode,
                evalFunction: evalFunction,
                compile: function () {
                    if (genereatedElement) {
                        genereatedElement.remove();
                        genereatedElement = null;
                    }
                    if (evalFunction.apply(component)) {
                        genereatedElement = _this.newElement(html);
                        textNode.parentNode.insertBefore(genereatedElement, textNode);
                        _this.process(component, genereatedElement, genereatedElement.innerHTML);
                    }
                    else {
                        if (genereatedElement) {
                            genereatedElement.remove();
                            genereatedElement = null;
                        }
                    }
                },
            };
            bindings.push(binding);
            match = domElement.querySelector('[\\$if]');
        };
        while (match && match.getAttribute) {
            _loop_2();
        }
        return bindings;
    };
    TSF.prototype.prepareDynamicFor = function (component, domElement) {
        var _this = this;
        var bindings = [];
        var match = domElement.querySelector('[\\$for]');
        var _loop_3 = function () {
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
                contextVars: [],
                contextValues: [],
                textNode: textNode,
                evalFunction: evalFunction,
                compile: function (params) {
                    if (params && params.type === 'update') {
                        // do not re-render list, dom should be updated automatically
                    }
                    else if (params && params.type === 'push') {
                        var items = evalFunction.apply(component);
                        for (var index = currentItems.length; index < items.length; index++) {
                            var newElement = _this.newElement(html);
                            textNode.parentNode.insertBefore(newElement, textNode);
                            currentItems.push({ element: newElement });
                            _this.process(component, newElement, newElement.innerHTML, ['$index'], [index]);
                        }
                    }
                    else {
                        if (currentItems.length) {
                            currentItems.forEach(function (item, index) {
                                item.element.remove();
                            });
                            currentItems.length = 0;
                        }
                        var items = evalFunction.apply(component);
                        items.forEach(function (item, index) {
                            var newElement = _this.newElement(html);
                            textNode.parentNode.insertBefore(newElement, textNode);
                            currentItems.push({ element: newElement });
                            _this.process(component, newElement, newElement.innerHTML, ['$index'], [index]);
                        });
                    }
                },
            };
            bindings.push(binding);
            match = domElement.querySelector('[\\$for]');
        };
        while (match && match.getAttribute) {
            _loop_3();
        }
        return bindings;
    };
    TSF.prototype.processDynamic = function (component, domElement, bindings) {
        bindings.forEach(function (binding) { return binding.compile(); });
    };
    TSF.prototype.processComponents = function (domElement) {
        var _this = this;
        this.initializedComponents.forEach(function (componentInstance, name) {
            var element = domElement.querySelector(name);
            if (element) {
                _this.process(componentInstance, element);
            }
        });
        this.componentClasses.forEach(function (componentClass, name) {
            var matches = domElement.querySelectorAll(name);
            [].forEach.call(matches, function (element) {
                _this.process(new componentClass(), element);
            });
        });
    };
    TSF.prototype.newElement = function (html) {
        var div = document.createElement('div');
        div.innerHTML = html;
        return div.firstChild;
    };
    return TSF;
}());
exports.TSF = TSF;
