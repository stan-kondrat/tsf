import { IBindings } from './interfaces';
import nextFrame from './nextFrame';

const observerId = 0;

export default class ObservableStructure {

    private static isObject(obj) {
        return Object.prototype.toString.apply(obj) === '[object Object]';
    }

    private static isArray(obj) {
        return Object.prototype.toString.apply(obj) === '[object Array]';
    }

    private allWatchedObjects = new Map();

    private bindingsByAttr = {};
    private bindings;

    public observe(obj, bindings: IBindings, attrFullName: string = 'this.') {
        if (typeof obj !== 'object') { return; }

        let watchedBindings;
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

    private compileBinding(obj, attrFullName) {

        const bindings = this.allWatchedObjects.get(obj);
        nextFrame(() => {
            bindings.forEach((binding) => {
                let attr = attrFullName;
                let parentAttrPosition;
                do {
                    // 'this.a.b.c'
                    // 'this.a.b'
                    // 'this.a'
                    if (binding.expr.indexOf(attr) !== -1) {
                        binding.compile();
                    }
                    parentAttrPosition = attr.lastIndexOf('.');
                    attr = attrFullName.substr(0, parentAttrPosition);
                } while (parentAttrPosition !== 4); // 'this.'
            });
        });
    }

    private observeObject(obj, bindings, attrParent: string) {
        let $data = {};
        if ('$data' in obj) {
            $data = obj.$data;
        } else {
            Object.defineProperty(obj, '$data', {value: $data, writable: true});
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

    private observeArray(arr, bindings, attrParent: string) {
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
                this.compileBinding(arr, attrParent);
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

    private observeArrayDefineIndexProperty(arr, bindings, index, attrParent) {
        Object.defineProperty(arr, index, {
            configurable: true,
            enumerable: true,
            get: () => {
                return arr.$data[index];
            },
            set: (value) => {
                arr.$data[index] = value;
                this.observe(value, bindings, attrParent + '.' + index + '.');
                this.compileBinding(arr, attrParent);
            },
        });
    }
}
