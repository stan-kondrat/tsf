import { IBindings } from './interfaces';
import nextFrame from './nextFrame';

export default class ObservableStructure {

    private static isObject(obj) {
        return Object.prototype.toString.apply(obj) === '[object Object]';
    }

    private static isArray(obj) {
        return Object.prototype.toString.apply(obj) === '[object Array]';
    }

    private bindingsByAttr = {};
    private bindings;

    constructor(obj, bindings: IBindings) {
        this.bindings = bindings;
        this.observeObject(obj, 'this.');
    }

    private observe(obj, attrFullName) {
        if (ObservableStructure.isObject(obj)) {
            this.observeObject(obj, attrFullName);
        }
        if (ObservableStructure.isArray(obj)) {
            this.observeArray(obj, attrFullName);
        }
    }

    private compileBinding(attrFullName) {
        // update DOM asynchronously
        nextFrame(() => {
            let attr = attrFullName;
            let parentAttrPosition;
            do {
                if (this.bindingsByAttr[attr]) { // TODO: why it can be undefined?
                    this.bindingsByAttr[attr].map((binding) => binding.compile());
                }
                parentAttrPosition = attr.lastIndexOf('.');
                attr = attrFullName.substr(0, parentAttrPosition);
            } while (parentAttrPosition !== 4); // 'this.'
        });
    }

    private observeObject(obj, attrParent: string) {
        const $data = {};
        Object.defineProperty(obj, '$data', {value: $data, writable: true});

        for (const attrName in obj) {
            if (!obj.hasOwnProperty(attrName)) {
                continue;
            }

            if (attrName === '$template' || attrName === '$data') {
                continue;
            }

            const attrFullName = attrParent + attrName; // this.foo.bar.attrName

            this.bindingsByAttr[attrFullName] = [];
            for (const bindId of Object.keys(this.bindings)) {
                if (this.bindings[bindId].expr.indexOf(attrFullName) !== -1) {
                    this.bindingsByAttr[attrFullName].push(this.bindings[bindId]);
                }
            }

            $data[attrFullName] = obj[attrName];

            this.observe(obj[attrName], attrFullName + '.');

            Object.defineProperty(obj, attrName, {
                get: () => {
                    return $data[attrFullName];
                },
                set: (value) => {
                    $data[attrFullName] = value;

                    this.observe(value, attrFullName + '.');
                    this.compileBinding(attrFullName);
                },
            });
        }
    }

    private observeArray(arr, attrParent: string) {
        const $data = [];
        Object.defineProperty(arr, '$data', { value: $data, writable: true });
        for (let i = 0; i < arr.length; i++) {
            $data[i] = arr[i];
            this.observeArrayDefineIndexProperty(arr, i, attrParent);
        }
        Object.defineProperty(arr, 'push', {
            configurable: false,
            enumerable: false,
            writable: false,
            value: (...args) => {
                let length = $data.length;
                for (const arg of args) {
                    $data[length] = arg;
                    this.observe(arg, attrParent + '.' + length + '.');
                    this.observeArrayDefineIndexProperty(arr, length, attrParent);
                    length++;
                }
                this.compileBinding(attrParent);
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
                    delete arr[$data.length];
                }
                for (const arg of args) {
                    $data.splice(start, 0, arg);
                    this.observeArrayDefineIndexProperty(arr, $data.length - 1, attrParent);
                }
                return removed;
            },
        });
        // TODO: pop, unshift, shift, length
    }

    private observeArrayDefineIndexProperty(arr, index, attrParent) {
        Object.defineProperty(arr, index, {
            configurable: true,
            enumerable: true,
            get: () => {
                return arr.$data[index];
            },
            set: (value) => {
                arr.$data[index] = value;
                this.observe(value, attrParent + '.' + index + '.');
                this.compileBinding(attrParent);
            },
        });
    }
}
