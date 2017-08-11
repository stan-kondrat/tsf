
const events = [];
for (const key in document) {
    if (key.startsWith('on')) {
        events.push(key);
    }
}

export default class TSF {
    private element;

    constructor(element) {
        this.element = element;
    }

    public add(component) {
        let template = component.$template;

        // add data bindings
        let bindId = 0;
        const bindings = {};
        template = template.replace(new RegExp('\{\{([^}]+)\}\}', 'g'), (match, expr) => {
            bindId++;
            bindings[bindId] = { expr };
            return `<div bind-id="${bindId}">bindId-${bindId}</div>`;
        });
        this.element.innerHTML = template;
        for (const id of Object.keys(bindings)) {
            bindings[id].func = new Function('', 'return ' + bindings[id].expr);
            bindings[id].node = document.createTextNode('');
            bindings[id].node.data = bindings[id].func.call(component);
            this.element.querySelector(`[bind-id='${id}']`).replaceWith(bindings[id].node);
        }

        // watch variables
        const dataStore = {};
        for (const attr in component) {
            if (attr === '$template' || !component.hasOwnProperty(attr)) { continue; }
            dataStore[attr] = component[attr];
            Object.defineProperty(component, attr, {
                get() {
                    return dataStore[attr];
                },
                set(value) {
                    dataStore[attr] = value;
                    const bindingsToUpdate: Array<{nodeId, nodeData}> = [];
                    for (const nodeId of Object.keys(bindings)) {
                        if (bindings[nodeId].expr.indexOf(attr) !== -1) {
                            const nodeData = bindings[nodeId].func.call(component);
                            bindingsToUpdate.push({nodeId, nodeData});
                        }
                    }
                    // update DOM asynchronously
                    requestAnimationFrame(() => {
                        while (bindingsToUpdate.length) {
                            const binding = bindingsToUpdate.pop();
                            bindings[binding.nodeId].node.data = binding.nodeData;
                        }
                    });
                },
            });
        }

        // add event liseners
        for (const event of events) {
            const matches = this.element.querySelectorAll('[\\$' + event + ']');
            [].forEach.call(matches, (match) => {
                const listener = new Function('$event', match.getAttribute('$' + event));
                match.addEventListener(event.substring(2), ($event) => {
                    requestAnimationFrame(() => listener.call(component, $event));
                });
            });
        }
    }
}
