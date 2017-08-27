const jsdom = require('jsdom');
const { JSDOM } = jsdom;
import { IBindings } from './interfaces';
import ObservableStructure from './observer';

async function timeout(time = 50) {
    return (new Promise((resolve, reject) => window.setTimeout(() => resolve(), time)));
}

let window;
let component: any = {};
let bindings: IBindings = {};

beforeEach(() => {
    window = (new JSDOM(`<!DOCTYPE html>textNode`)).window;
    component = { data: '' };
    bindings = {
        0: {
            expr: 'this.data',
            component,
            customVarNames: [],
            customVarValues: [],
            textNode: window.document.body.firstChild,
            evalFunction: new Function('', 'return this.data'),
            compile: function apply() {
                this.textNode.data = this.evalFunction.apply(this.component);
            },
        },
    };
});

test('Observable primitives', async () => {
    expect.assertions(4);
    const _ = new ObservableStructure(component, bindings);
    component.data = 'A';
    await timeout();
    expect(window.document.body.innerHTML).toEqual('A');
    component.data = 1;
    await timeout();
    expect(window.document.body.innerHTML).toEqual('1');
    component.data = undefined;
    await timeout();
    expect(window.document.body.innerHTML).toEqual('undefined');
    component.data = true;
    await timeout();
    expect(window.document.body.innerHTML).toEqual('true');
});
