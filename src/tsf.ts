import { IBindings, ObservableStructure } from './observer';

const EVENTS = [];
for (const key in document) {
    if (key.startsWith('on')) {
        EVENTS.push(key);
    }
}

export class TSF {
    private static prepareTemplate(template) {
        // replace {{ this.something }} to <text $innerHTML="this.something"></text>
        template = template.replace(new RegExp('\{\{([^}]+)\}\}', 'g'), (match, expr) => {
            return `<text $innerHTML="${expr}"></text>`;
        });
        return template;
    }

    private rootElement;
    private initializedComponents = new Map();
    private componentClasses = new Map();
    private watcher = new ObservableStructure();

    constructor(selector) {
        this.rootElement = document.querySelector(selector);
    }

    public register(name, componentClass) {
        this.componentClasses.set(name, componentClass);
    }

    public component(name, componentInstance) {
        this.initializedComponents.set(name, componentInstance);
    }

    public run(component) {
        this.process(component, this.rootElement);
    }

    private process(component, domElement, customTemplate = '', contextVars = [], contextValues = []) {
        domElement.innerHTML = TSF.prepareTemplate(customTemplate || component.$template);

        const dynamicBindingsIf = this.prepareDynamicIf(component, domElement);
        const dynamicBindingsFor = this.prepareDynamicFor(component, domElement);
        const textNodesBindings = this.processTextNodes(component, domElement, contextVars, contextValues);
        const attrBindings = this.processAttributes(component, domElement, contextVars, contextValues);
        const bindings = dynamicBindingsIf.concat(dynamicBindingsFor).concat(textNodesBindings).concat(attrBindings);

        this.watcher.observe(component, bindings);
        this.processEvents(component, domElement, contextVars, contextValues);
        this.processComponents(domElement);

        this.processDynamic(component, domElement, dynamicBindingsIf);
        this.processDynamic(component, domElement, dynamicBindingsFor);
    }

    private processTextNodes(component, domElement, contextVars = [], contextValues = []): IBindings {
        const bindings: IBindings = [];
        const matches = domElement.querySelectorAll('[\\$innerHTML]');
        [].forEach.call(matches, (match) => {
            const expr = match.getAttribute('$innerHTML');
            const textNode = document.createTextNode('');
            const evalFunction = new Function(contextVars.join(','), 'return ' + expr);
            match.parentNode.replaceChild(textNode, match);
            const binding = {
                expr,
                component,
                contextVars,
                contextValues,
                textNode,
                evalFunction,
                compile: () => {
                    textNode.data = evalFunction.apply(component, contextValues);
                },
            };
            bindings.push(binding);
            binding.compile();
        });

        return bindings;
    }

    private processEvents(component, domElement, contextVars = [], contextValues = []) {
        for (const event of EVENTS) {
            const matches = domElement.querySelectorAll('[\\$' + event + ']');
            [].forEach.call(matches, (match) => {
                const listener = new Function(contextVars.concat('$event').join(','), match.getAttribute('$' + event));
                match.removeAttribute('$' + event);
                match.addEventListener(event.substring(2), ($event) => {
                    window.requestAnimationFrame(() => listener.apply(component, contextValues.concat($event)));
                });
            });
        }
    }

    private processAttributes(component, domElement, contextVars = [], contextValues = []) {
        const bindings: IBindings = [];
        const matches = domElement.parentNode.querySelectorAll('[\\$attr]');
        [].forEach.call(matches, (match) => {
            const expr = match.getAttribute('$attr');
            const textNode = document.createTextNode('');
            const evalFunction = new Function(contextVars.join(','), 'return ' + expr);
            const binding = {
                expr,
                component,
                contextVars: [],
                contextValues: [],
                textNode,
                evalFunction,
                compile: () => {
                    const attributes = evalFunction.apply(component, contextValues);
                    Object.keys(attributes).forEach((attr) => {
                        if (attributes[attr] === null) {
                            match.removeAttribute(attr);
                        } else {
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
    }

    private prepareDynamicIf(component, domElement): IBindings {
        const bindings: IBindings = [];
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
                contextVars: [],
                contextValues: [],
                textNode,
                evalFunction,
                compile: () => {
                    if (genereatedElement) {
                        genereatedElement.remove();
                        genereatedElement = null;
                    }
                    if (evalFunction.apply(component)) {
                        genereatedElement = this.newElement(html);
                        textNode.parentNode.insertBefore(genereatedElement, textNode);
                        this.process(component, genereatedElement, genereatedElement.innerHTML);
                    } else {
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
    private prepareDynamicFor(component, domElement): IBindings {
        const bindings: IBindings = [];
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
                contextVars: [],
                contextValues: [],
                textNode,
                evalFunction,
                compile: (params) => {
                    if (params && params.type === 'update') {
                        // do not re-render list, dom should be updated automatically
                    } else if (params && params.type === 'push') {
                        const items = evalFunction.apply(component);
                        for (let index = currentItems.length; index < items.length; index++) {
                            const newElement = this.newElement(html);
                            textNode.parentNode.insertBefore(newElement, textNode);
                            currentItems.push({ element: newElement });
                            this.process(component, newElement, newElement.innerHTML, ['$index'], [index]);
                        }
                    } else {
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

    private processDynamic(component, domElement, bindings) {
        bindings.forEach((binding) => binding.compile());
    }

    private processComponents(domElement) {
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

    private newElement(html: string): HTMLElement {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.firstChild as HTMLElement;
    }
}
