(function() {
var exports = {};
var __small$_1 = (function() {
var exports = {};
Object.defineProperty(exports, "__esModule", { value: true });
const nextFrame = window.requestAnimationFrame || ((callback) => window.setTimeout(callback, 0));
exports.default = nextFrame;

return exports;
})();
var __small$_2 = (function() {
var exports = {};
Object.defineProperty(exports, "__esModule", { value: true });
;
const observerId = 0;
class ObservableStructure {
    constructor() {
        this.allWatchedObjects = new Map();
        this.bindingsByAttr = {};
    }
    static isObject(obj) {
        return Object.prototype.toString.apply(obj) === '[object Object]';
    }
    static isArray(obj) {
        return Object.prototype.toString.apply(obj) === '[object Array]';
    }
    observe(obj, bindings, attrFullName = 'this.') {
        if (typeof obj !== 'object') {
            return;
        }
        let watchedBindings;
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
    }
    compileBinding(obj, attrFullName, params = {}) {
        const bindings = this.allWatchedObjects.get(obj);
        __small$_1.default(() => {
            bindings.forEach((binding) => {
                let attr = attrFullName;
                let parentAttrPosition;
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
    observeObject(obj, bindings, attrParent) {
        let $data = {};
        if ('$data' in obj) {
            $data = obj.$data;
        }
        else {
            Object.defineProperty(obj, '$data', { value: $data, writable: true });
        }
        for (const attrName in obj) {
            if (!obj.hasOwnProperty(attrName)) {
                continue;
            }
            if (attrName === '$template' || attrName === '$data') {
                continue;
            }
            const attrFullName = attrParent + attrName; // this.foo.bar.attrName
            $data[attrFullName] = obj[attrName];
            this.observe(obj[attrName], bindings, attrFullName + '.');
            Object.defineProperty(obj, attrName, {
                get: () => {
                    return $data[attrFullName];
                },
                set: (value) => {
                    $data[attrFullName] = value;
                    this.observe(value, bindings, attrFullName + '.');
                    this.compileBinding(obj, attrFullName);
                },
            });
        }
    }
    observeArray(arr, bindings, attrParent) {
        if ('$data' in arr) {
            return;
        }
        const $data = [];
        Object.defineProperty(arr, '$data', { value: $data, writable: true });
        for (let i = 0; i < arr.length; i++) {
            $data[i] = arr[i];
            this.observeArrayDefineIndexProperty(arr, bindings, i, attrParent);
        }
        Object.defineProperty(arr, 'push', {
            configurable: false,
            enumerable: false,
            writable: false,
            value: (...args) => {
                let length = $data.length;
                for (const arg of args) {
                    $data[length] = arg;
                    this.observe(arg, bindings, attrParent + '.' + length + '.');
                    this.observeArrayDefineIndexProperty(arr, bindings, length, attrParent);
                    length++;
                }
                this.compileBinding(arr, attrParent, { type: 'push' });
                return length;
            },
        });
        Object.defineProperty(arr, 'splice', {
            configurable: false,
            enumerable: false,
            writable: false,
            value: (start, deleteCount, ...args) => {
                start = start == null ? 0 : start < 0 ? $data.length + start : start;
                deleteCount = deleteCount == null ? $data.length - start : deleteCount > 0 ? deleteCount : 0;
                const removed = [];
                while (deleteCount--) {
                    removed.push($data.splice(start, 1)[0]);
                    arr.length = $data.length;
                }
                for (const arg of args) {
                    $data.splice(start, 0, arg);
                    this.observeArrayDefineIndexProperty(arr, bindings, $data.length - 1, attrParent);
                }
                this.compileBinding(arr, attrParent);
                return removed;
            },
        });
        // TODO: pop, unshift, shift, length
    }
    observeArrayDefineIndexProperty(arr, bindings, index, attrParent) {
        Object.defineProperty(arr, index, {
            configurable: true,
            enumerable: true,
            get: () => {
                return arr.$data[index];
            },
            set: (value) => {
                arr.$data[index] = value;
                this.observe(value, bindings, attrParent + '.' + index + '.');
                this.compileBinding(arr, attrParent, { type: 'update', value: index });
            },
        });
    }
}
exports.ObservableStructure = ObservableStructure;

return exports;
})();
Object.defineProperty(exports, "__esModule", { value: true });
;
;
const EVENTS = [];
for (const key in document) {
    if (key.startsWith('on')) {
        EVENTS.push(key);
    }
}
class TSF {
    constructor(selector) {
        this.initializedComponents = new Map();
        this.componentClasses = new Map();
        this.watcher = new __small$_2.ObservableStructure();
        this.rootElement = document.querySelector(selector);
    }
    static prepareTemplate(template) {
        // replace {{ this.something }} to <text $innerHTML="this.something"></text>
        template = template.replace(new RegExp('\{\{([^}]+)\}\}', 'g'), (match, expr) => {
            return `<text $innerHTML="${expr}"></text>`;
        });
        return template;
    }
    register(name, componentClass) {
        this.componentClasses.set(name, componentClass);
    }
    component(name, componentInstance) {
        this.initializedComponents.set(name, componentInstance);
    }
    run(component) {
        this.process(component, this.rootElement);
    }
    process(component, domElement, customTemplate = '', customVarNames = [], customVarValues = []) {
        domElement.innerHTML = TSF.prepareTemplate(customTemplate || component.$template);
        const dynamicBindingsIf = this.prepareDynamicIf(component, domElement);
        const dynamicBindingsFor = this.prepareDynamicFor(component, domElement);
        const textNodesBindings = this.processTextNodes(component, domElement, customVarNames, customVarValues);
        const bindings = dynamicBindingsIf.concat(dynamicBindingsFor).concat(textNodesBindings);
        this.watcher.observe(component, bindings);
        this.processEvents(component, domElement);
        this.processComponents(domElement);
        this.processDynamic(component, domElement, dynamicBindingsIf);
        this.processDynamic(component, domElement, dynamicBindingsFor);
    }
    processTextNodes(component, domElement, customVarNames = [], customVarValues = []) {
        const bindings = [];
        const matches = domElement.querySelectorAll('[\\$innerHTML]');
        [].forEach.call(matches, (match) => {
            const expr = match.getAttribute('$innerHTML');
            const textNode = document.createTextNode('');
            const evalFunction = new Function(customVarNames.join(','), 'return ' + expr);
            match.parentNode.replaceChild(textNode, match);
            const binding = {
                expr,
                component,
                customVarNames,
                customVarValues,
                textNode,
                evalFunction,
                compile: () => {
                    textNode.data = evalFunction.apply(component, customVarValues);
                },
            };
            bindings.push(binding);
            binding.compile();
        });
        return bindings;
    }
    processEvents(component, domElement) {
        for (const event of EVENTS) {
            const matches = domElement.querySelectorAll('[\\$' + event + ']');
            [].forEach.call(matches, (match) => {
                const listener = new Function('$event', match.getAttribute('$' + event));
                match.removeAttribute('$' + event);
                match.addEventListener(event.substring(2), ($event) => {
                    __small$_1.default(() => listener.call(component, $event));
                });
            });
        }
    }
    prepareDynamicIf(component, domElement) {
        const bindings = [];
        let match = domElement.querySelector('[\\$if]');
        while (match && match.getAttribute) {
            const expr = match.getAttribute('$if');
            match.removeAttribute('$if');
            const html = match.outerHTML;
            const textNode = document.createTextNode('');
            const evalFunction = new Function('', 'return ' + expr);
            match.parentNode.replaceChild(textNode, match);
            let genereatedElement;
            const binding = {
                expr,
                component,
                customVarNames: [],
                customVarValues: [],
                textNode,
                evalFunction,
                compile: () => {
                    if (evalFunction.apply(component)) {
                        genereatedElement = this.newElement(html);
                        textNode.parentNode.insertBefore(genereatedElement, textNode);
                        this.process(component, genereatedElement, genereatedElement.innerHTML);
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
        }
        return bindings;
    }
    prepareDynamicFor(component, domElement) {
        const bindings = [];
        let match = domElement.querySelector('[\\$for]');
        while (match && match.getAttribute) {
            const expr = match.getAttribute('$for');
            match.removeAttribute('$for');
            const html = match.outerHTML;
            const textNode = document.createTextNode('');
            const evalFunction = new Function('', 'return ' + expr);
            match.parentNode.replaceChild(textNode, match);
            const currentItems = [];
            const binding = {
                expr,
                component,
                customVarNames: [],
                customVarValues: [],
                textNode,
                evalFunction,
                compile: (params) => {
                    if (params && params.type === 'update') {
                        // do not re-render list, dom should be updated automatically
                    }
                    else if (params && params.type === 'push') {
                        const items = evalFunction.apply(component);
                        for (let index = currentItems.length; index < items.length; index++) {
                            const newElement = this.newElement(html);
                            textNode.parentNode.insertBefore(newElement, textNode);
                            currentItems.push({ element: newElement });
                            this.process(component, newElement, newElement.innerHTML, ['$index'], [index]);
                        }
                    }
                    else {
                        if (currentItems.length) {
                            currentItems.forEach((item, index) => {
                                item.element.remove();
                            });
                            currentItems.length = 0;
                        }
                        const items = evalFunction.apply(component);
                        items.forEach((item, index) => {
                            const newElement = this.newElement(html);
                            textNode.parentNode.insertBefore(newElement, textNode);
                            currentItems.push({ element: newElement });
                            this.process(component, newElement, newElement.innerHTML, ['$index'], [index]);
                        });
                    }
                },
            };
            bindings.push(binding);
            match = domElement.querySelector('[\\$for]');
        }
        return bindings;
    }
    processDynamic(component, domElement, bindings) {
        bindings.forEach((binding) => binding.compile());
    }
    processComponents(domElement) {
        this.initializedComponents.forEach((componentInstance, name) => {
            const element = domElement.querySelector(name);
            if (element) {
                this.process(componentInstance, element);
            }
        });
        this.componentClasses.forEach((componentClass, name) => {
            const matches = domElement.querySelectorAll(name);
            [].forEach.call(matches, (element) => {
                this.process(new componentClass(), element);
            });
        });
    }
    newElement(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.firstChild;
    }
}
exports.TSF = TSF;

return exports;
})();
//# sourceMappingURL=/Users/stan/research/tsf/lib/tsf.bundle.js.map
