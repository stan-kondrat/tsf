import { IBindings, ObservableStructure } from './observer';

async function timeout(time = 10) {
    return (new Promise((resolve, reject) => window.setTimeout(() => resolve(), time)));
}

window.requestAnimationFrame = (cb) => window.setTimeout(cb, 5);

const prepareBindings = (component, expr) => {
    document.body.innerHTML = 'textNode';
    const bindings: IBindings = [
        {
            expr,
            component,
            customVarNames: [],
            customVarValues: [],
            textNode: window.document.body.firstChild,
            evalFunction: new Function('', 'return ' + expr),
            compile: function apply() {
                const data = this.evalFunction.apply(this.component);
                this.textNode.data = data;
                // this.textNode.data = this.evalFunction.apply(this.component);
            },
        },
    ];
    Object.keys(bindings).map((id) => bindings[id].compile());
    return bindings;
};

test('Observable primitives', async () => {
    expect.assertions(5);
    const component: { data: any } = { data: '' };
    const bindings = prepareBindings(component, 'this.data');
    const watcher = new ObservableStructure();
    watcher.observe(component, bindings);

    await timeout();
    expect(document.body.innerHTML).toEqual('');

    component.data = 'A';
    await timeout();
    expect(document.body.innerHTML).toEqual('A');

    component.data = 1;
    await timeout();
    expect(document.body.innerHTML).toEqual('1');

    component.data = undefined;
    await timeout();
    expect(document.body.innerHTML).toEqual('undefined');

    component.data = true;
    await timeout();
    expect(document.body.innerHTML).toEqual('true');
});

test('Observable Object', async () => {
    expect.assertions(6);
    const component: { data: any } = { data: '' };
    const bindings = prepareBindings(component, 'JSON.stringify(this.data)');
    const watcher = new ObservableStructure();
    watcher.observe(component, bindings);

    component.data = { a: 'a', b: 'b' };
    await timeout();
    expect(document.body.innerHTML).toEqual('{"a":"a","b":"b"}');

    component.data.a = 'updated';
    await timeout();
    expect(document.body.innerHTML).toEqual('{"a":"updated","b":"b"}');

    component.data.a = { inserted: 'inserted'};
    await timeout();
    expect(document.body.innerHTML).toEqual('{"a":{"inserted":"inserted"},"b":"b"}');

    component.data.b = component.data.a;
    await timeout();
    expect(document.body.innerHTML).toEqual('{"a":{"inserted":"inserted"},"b":{"inserted":"inserted"}}');

    component.data.a.inserted = 'updated1';
    await timeout();
    expect(document.body.innerHTML).toEqual('{"a":{"inserted":"updated1"},"b":{"inserted":"updated1"}}');

    component.data.b.inserted = 'updated2';
    await timeout();
    expect(document.body.innerHTML).toEqual('{"a":{"inserted":"updated2"},"b":{"inserted":"updated2"}}');
});

test('Observable Array', async () => {
    expect.assertions(2);
    const component: { data: any } = { data: ['a', 'b', 'c'] };
    const bindings = prepareBindings(component, 'JSON.stringify(this.data)');
    const watcher = new ObservableStructure();
    watcher.observe(component, bindings);

    await timeout();
    expect(document.body.innerHTML).toEqual('["a","b","c"]');

    component.data[0] = 'A';
    await timeout();
    expect(document.body.innerHTML).toEqual('["A","b","c"]');
});

test('Observable Array Push', async () => {
    expect.assertions(5);
    const component: { data: any } = { data: [] };
    const bindings = prepareBindings(component, 'JSON.stringify(this.data)');
    const watcher = new ObservableStructure();
    watcher.observe(component, bindings);

    await timeout();
    expect(document.body.innerHTML).toEqual('[]');

    component.data.push('a');
    await timeout();
    expect(document.body.innerHTML).toEqual('["a"]');

    const len = component.data.push('b', 'c');
    expect(len).toEqual(3);
    await timeout();
    expect(document.body.innerHTML).toEqual('["a","b","c"]');

    component.data[0] = 'A';
    await timeout();
    expect(document.body.innerHTML).toEqual('["A","b","c"]');
});

test('Observable Array Splice - 1', async () => {
    expect.assertions(6);
    const component: { data: any } = {data: []};
    const bindings = prepareBindings(component, 'JSON.stringify(this.data)');
    const watcher = new ObservableStructure();
    watcher.observe(component, bindings);
    let removed;

    // Remove 0 elements from index 2, and insert "drum"
    component.data = ['angel', 'clown', 'mandarin', 'sturgeon'];
    removed = component.data.splice(2, 0, 'drum');
    expect(removed).toEqual([]);
    await timeout();
    expect(document.body.innerHTML).toEqual('["angel","clown","drum","mandarin","sturgeon"]');

    // Remove 1 element from index 3
    component.data = ['angel', 'clown', 'drum', 'mandarin', 'sturgeon'];
    removed = component.data.splice(3, 1);
    expect(removed).toEqual(['mandarin']);
    await timeout();
    expect(document.body.innerHTML).toEqual('["angel","clown","drum","sturgeon"]');

    // Remove 1 element from index 2, and insert "trumpet"
    component.data = ['angel', 'clown', 'drum', 'sturgeon'];
    removed = component.data.splice(2, 1, 'trumpet');
    expect(removed).toEqual(['drum']);
    await timeout();
    expect(document.body.innerHTML).toEqual('["angel","clown","trumpet","sturgeon"]');
});

xtest('Observable Array Splice - 2', async () => {
    expect.assertions(1);
    const component: { data: any } = {data: []};
    const bindings = prepareBindings(component, 'JSON.stringify(this.data)');
    const watcher = new ObservableStructure();
    watcher.observe(component, bindings);
    let removed;

    // Remove 2 elements from index 0, and insert "parrot", "anemone" and "blue"
    component.data = ['angel', 'clown', 'trumpet', 'sturgeon'];
    removed = component.data.splice(0, 2, 'parrot', 'anemone', 'blue');
    expect(removed).toEqual(['angel', 'clown']);
    await timeout();
    expect(document.body.innerHTML).toEqual('["parrot","anemone","blue","trumpet","sturgeon"]');
});

test('Observable Array Splice - 3', async () => {
    expect.assertions(6);
    const component: { data: any } = {data: []};
    const bindings = prepareBindings(component, 'JSON.stringify(this.data)');
    const watcher = new ObservableStructure();
    watcher.observe(component, bindings);
    let removed;

    // Remove 2 elements from index 2
    component.data = ['parrot', 'anemone', 'blue', 'trumpet', 'sturgeon'];
    removed = component.data.splice(component.data.length - 3, 2);
    expect(removed).toEqual(['blue', 'trumpet']);
    await timeout();
    expect(document.body.innerHTML).toEqual('["parrot","anemone","sturgeon"]');

    // Remove 1 element from index -2
    component.data = ['angel', 'clown', 'mandarin', 'sturgeon'];
    removed = component.data.splice(-2, 1);
    expect(removed).toEqual(['mandarin']);
    await timeout();
    expect(document.body.innerHTML).toEqual('["angel","clown","sturgeon"]');

    // Remove all elements after index 2 (incl.)
    component.data = ['angel', 'clown', 'mandarin', 'sturgeon'];
    removed = component.data.splice(2);
    expect(removed).toEqual(['mandarin', 'sturgeon']);
    await timeout();
    expect(document.body.innerHTML).toEqual('["angel","clown"]');
});

test('Observable Array Of Objects', async () => {
    expect.assertions(3);
    const component: { data: any } = { data: [] };
    const bindings = prepareBindings(component, 'JSON.stringify(this.data)');
    const watcher = new ObservableStructure();
    watcher.observe(component, bindings);

    await timeout();
    expect(document.body.innerHTML).toEqual('[]');

    component.data.push({a: 'a'});
    await timeout();
    expect(document.body.innerHTML).toEqual('[{"a":"a"}]');

    component.data[0].a = 'A';
    await timeout();
    expect(document.body.innerHTML).toEqual('[{"a":"A"}]');
});
