import { IBindings } from './interfaces';
import nextFrame from './nextFrame';
import ObservableStructure from './observer';

const EVENTS = [];
for (const key in document) {
    if (key.startsWith('on')) {
        EVENTS.push(key);
    }
}

export default class TSF {
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

    private process(component, domElement, customTemplate = '') {
        domElement.innerHTML = TSF.prepareTemplate(customTemplate || component.$template);

        const dynamicBindings = this.prepareDynamic(component, domElement);
        const textNodesBindings = this.processTextNodes(component, domElement);
        const bindings = dynamicBindings.concat(textNodesBindings);

        this.watcher.observe(component, bindings);
        this.processEvents(component, domElement);
        this.processComponents(domElement);

        this.processDynamic(component, domElement, dynamicBindings);
    }

    private processTextNodes(component, domElement, customVarNames = [], customVarValues = []): IBindings {
        const bindings: IBindings = [];
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

    private processEvents(component, domElement) {
        for (const event of EVENTS) {
            const matches = domElement.querySelectorAll('[\\$' + event + ']');
            [].forEach.call(matches, (match) => {
                const listener = new Function('$event', match.getAttribute('$' + event));
                match.removeAttribute('$' + event);
                match.addEventListener(event.substring(2), ($event) => {
                    nextFrame(() => listener.call(component, $event));
                });
            });
        }
    }

    private prepareDynamic(component, domElement): IBindings {
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
                customVarNames: [],
                customVarValues: [],
                textNode,
                evalFunction,
                compile: () => {
                    if (evalFunction.apply(component)) {
                        const div = document.createElement('div');
                        div.innerHTML = html;
                        genereatedElement = div.firstChild;
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

    private processDynamic(component, domElement, bindings) {
        bindings.forEach((binding) => binding.compile());
    }

    private processComponents(domElement) {
        for (const [name, componentInstance] of this.initializedComponents) {
            const element = domElement.querySelector(name);
            if (element) {
                this.process(componentInstance, element);
            }
        }
        for (const [name, componentClass] of this.componentClasses) {
            const matches = domElement.querySelectorAll(name);
            [].forEach.call(matches, (element) => {
                this.process(new componentClass(), element);
            });
        }
    }
}
