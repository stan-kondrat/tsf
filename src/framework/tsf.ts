
export default class TSF {
    private element;

    constructor(element) {
        this.element = element;
    }

    public add(component) {
        let template = component.template;

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
            if (attr === 'template' || !component.hasOwnProperty(attr)) { continue; }
            dataStore[attr] = component[attr];
            Object.defineProperty(component, attr, {
                get() {
                    return dataStore[attr];
                },
                set(value) {
                    for (const id of Object.keys(bindings)) {
                        if (bindings[id].expr.indexOf(attr) !== -1) {
                            bindings[id].node.data = bindings[id].func.call(component);
                        }
                    }
                    dataStore[attr] = value;
                },
            });
        }

        // add event liseners
        const matches = this.element.querySelectorAll('[\\$onclick]');
        [].forEach.call(matches, (match) => {
            const listener = new Function('$event', match.getAttribute('$onclick'));
            match.addEventListener('click', (event) => listener.call(component, event));
        });
    }
}
