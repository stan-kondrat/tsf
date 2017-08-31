import { JSDOM } from 'jsdom';
import { IBindings } from './interfaces';
import ObservableStructure from './observer';

async function timeout(time = 50) {
    return (new Promise((resolve, reject) => window.setTimeout(() => resolve(), time)));
}

const prepareBindings = (component, expr) => {
    const window = (new JSDOM(`<!DOCTYPE html>textNode`)).window;
    const bindings = {
        0: {
            expr,
            component,
            customVarNames: [],
            customVarValues: [],
            textNode: window.document.body.firstChild,
            evalFunction: new Function('', 'return ' + expr),
            compile: function apply() {
                this.textNode.data = this.evalFunction.apply(this.component);
            },
        },
    };
    return { window, bindings };
};

test('Observable primitives', async () => {
    expect.assertions(4);
    const component: { data: any } = { data: '' };
    const { window, bindings } = prepareBindings(component, 'this.data');
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

test('Observable Object', async () => {
    expect.assertions(6);
    const component: { data: any } = { data: '' };
    const { window, bindings } = prepareBindings(component, 'JSON.stringify(this.data)');
    const _ = new ObservableStructure(component, bindings);

    component.data = { a: 'a': b: 'b' };
    await timeout();
    expect(window.document.body.innerHTML).toEqual('{"a":"a","b":"b"}');

    component.data.a = 'updated';
    await timeout();
    expect(window.document.body.innerHTML).toEqual('{"a":"updated","b":"b"}');

    component.data.a = { inserted: 'inserted'};
    await timeout();
    expect(window.document.body.innerHTML).toEqual('{"a":{"inserted":"inserted"},"b":"b"}');

    component.data.b = component.data.a;
    await timeout();
    expect(window.document.body.innerHTML).toEqual('{"a":{"inserted":"inserted"},"b":{"inserted":"inserted"}}');

    component.data.a.inserted = 'updated1';
    await timeout();
    expect(window.document.body.innerHTML).toEqual('{"a":{"inserted":"updated1"},"b":{"inserted":"updated1"}}');

    component.data.b.inserted = 'updated2';
    await timeout();
    expect(window.document.body.innerHTML).toEqual('{"a":{"inserted":"updated2"},"b":{"inserted":"updated2"}}');
});

xtest('Observable Array', async () => {
    expect.assertions(2);
    const component: { data: any } = { data: [] };
    const { window, bindings } = prepareBindings(component, 'JSON.stringify(this.data)');
    const _ = new ObservableStructure(component, bindings);

    await timeout();
    expect(window.document.body.innerHTML).toEqual('[]');

    component.data.push('a');
    await timeout();
    expect(window.document.body.innerHTML).toEqual('["a"]');
});