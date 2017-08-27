import { IBindings } from './interfaces';

const nextFrame = window.requestAnimationFrame || ((callback) => window.setTimeout(callback, 0));

export default class ObservableStructure {
    private dataStore = {};
    private bindingsByAttr = {};

    constructor(obj, bindings: IBindings) {
        this.observe(obj, bindings, 'this.');
    }

    private observe(obj, bindings, attrParent: string) {
        for (const attrName in obj) {
            if (attrName === '$template' || !obj.hasOwnProperty(attrName)) { continue; }

            const attrFullName = attrParent + attrName; // this.foo.bar.attrName

            this.bindingsByAttr[attrFullName] = [];
            for (const bindId of Object.keys(bindings)) {
                if (bindings[bindId].expr.indexOf(attrFullName) !== -1) {
                    this.bindingsByAttr[attrFullName].push(bindings[bindId]);
                }
            }

            this.dataStore[attrFullName] = obj[attrName];

            if (this.isObject(obj[attrName])) {
                this.observe(obj[attrName], bindings, attrFullName + '.');
            }

            Object.defineProperty(obj, attrName, {
                get: () => {
                    return this.dataStore[attrFullName];
                },
                set: (value) => {
                    this.dataStore[attrFullName] = value;

                    if (this.isObject(value)) {
                        this.observe(value, bindings, attrFullName + '.');
                    }

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
                },
            });
        }
    }

    private isObject(obj) {
        return {}.toString.apply(obj) === '[object Object]';
    }
}
