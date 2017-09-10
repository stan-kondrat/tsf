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

    constructor(obj, bindings: IBindings) {
        this.observeObject(obj, bindings, 'this.');
    }

    private observe(obj, bindings, attrFullName) {
        if (ObservableStructure.isObject(obj)) {
            this.observeObject(obj, bindings, attrFullName);
        }
        if (ObservableStructure.isArray(obj)) {
            this.observeArray(obj, bindings, attrFullName);
        }
    }

    private compileBinding(attrFullName) {
        // update DOM asynchronously
        nextFrame(() => {
            let attr = attrFullName;
            let parentAttrPosition;
            do {
                for (const binding of this.bindingsByAttr[attr]) {
                    binding.compile();
                }
                parentAttrPosition = attr.lastIndexOf('.');
                attr = attrFullName.substr(0, parentAttrPosition);
            } while (parentAttrPosition !== 4); // 'this.'
        });
    }

    private observeObject(obj, bindings, attrParent: string) {
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
            for (const bindId of Object.keys(bindings)) {
                if (bindings[bindId].expr.indexOf(attrFullName) !== -1) {
                    this.bindingsByAttr[attrFullName].push(bindings[bindId]);
                }
            }

            $data[attrFullName] = obj[attrName];

            this.observe(obj[attrName], bindings, attrFullName + '.');

            Object.defineProperty(obj, attrName, {
                get: () => {
                    return $data[attrFullName];
                },
                set: (value) => {
                    $data[attrFullName] = value;

                    this.observe(value, bindings, attrFullName + '.');
                    this.compileBinding(attrFullName);
                },
            });
        }
    }

    private observeArray(arr, bindings, attrParent: string) {
        // TODO
    }
}
