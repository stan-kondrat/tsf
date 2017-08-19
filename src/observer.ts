export default class ObservableStructure {
    private dataStore = {};

    constructor(obj, bindings) {
        this.observe(obj, bindings);
    }

    private observe(obj, bindings) {
        for (const attr in obj) {
            if (attr === '$template' || !obj.hasOwnProperty(attr)) {
                continue;
            }
            this.dataStore[attr] = obj[attr];
            Object.defineProperty(obj, attr, {
                get: () => {
                    return this.dataStore[attr];
                },
                set: (value) => {
                    this.dataStore[attr] = value;
                    const bindingsToUpdate: Array<{ nodeId, nodeData }> = [];
                    for (const nodeId of Object.keys(bindings)) {
                        if (bindings[nodeId].expr.indexOf(attr) !== -1) {
                            const nodeData = bindings[nodeId].func.call(obj);
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
    }
}
