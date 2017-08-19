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
        domElement.innerHTML = component.$template;
        const textNodesBindings = this.processTextNodes(component, domElement);
        const _ = new ObservableStructure(component, textNodesBindings);
        this.processEvents(component, domElement);
        this.processComponents(domElement);
    }

    private processTextNodes(component, domElement) {
        let bindId = 0;
        const bindings = {};
        domElement.innerHTML = domElement.innerHTML.replace(new RegExp('\{\{([^}]+)\}\}', 'g'), (match, expr) => {
            bindId++;
            bindings[bindId] = { expr };
            return `<div bind-id="${bindId}">bindId-${bindId}</div>`;
        });
        for (const id of Object.keys(bindings)) {
            bindings[id].func = new Function('', 'return ' + bindings[id].expr);
            bindings[id].node = document.createTextNode('');
            bindings[id].node.data = bindings[id].func.call(component);
            domElement.querySelector(`[bind-id='${id}']`).replaceWith(bindings[id].node);
        }
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
