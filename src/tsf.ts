import { IBindings } from './interfaces';
import ObservableStructure from './observer';

const events = [];
for (const key in document) {
    if (key.startsWith('on')) {
        events.push(key);
    }
}

export default class TSF {
    private rootElement;
    private initializedComponents = new Map();
    private componentClasses = new Map();

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

    private process(component, domElement) {
        domElement.innerHTML = this.prepareTemplate(component.$template);
        const textNodesBindings = this.processTextNodes(component, domElement);
        const _ = new ObservableStructure(component, textNodesBindings);
        this.processEvents(component, domElement);
        this.processComponents(domElement);
    }

    private prepareTemplate(template) {
        // replace {{ this.something }} to <text $innerHTML="this.something"></text>
        template = template.replace(new RegExp('\{\{([^}]+)\}\}', 'g'), (match, expr) => {
            return `<text $innerHTML="${expr}"></text>`;
        });
        return template;
    }

    private processTextNodes(component, domElement, customVarNames = [], customVarValues = []) {
        let bindId = 0;
        const bindings: IBindings = {};
        const matches = domElement.querySelectorAll('[\\$innerHTML]');
        [].forEach.call(matches, (match) => {
            const expr = match.getAttribute('$innerHTML');
            const textNode = document.createTextNode('');
            match.replaceWith(textNode);
            bindId++;
            bindings[bindId] = {
                expr,
                component,
                customVarNames,
                customVarValues,
                textNode,
                evalFunction: new Function(customVarNames.join(','), 'return ' + expr),
                compile: function apply() {
                    this.textNode.data = this.evalFunction.apply(this.component, this.customVarValues);
                },
            };
            bindings[bindId].compile();
        });
        return bindings;
    }

    private processEvents(component, domElement) {
        for (const event of events) {
            const matches = domElement.querySelectorAll('[\\$' + event + ']');
            [].forEach.call(matches, (match) => {
                const listener = new Function('$event', match.getAttribute('$' + event));
                match.removeAttribute('$' + event);
                match.addEventListener(event.substring(2), ($event) => {
                    requestAnimationFrame(() => listener.call(component, $event));
                });
            });
        }
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
