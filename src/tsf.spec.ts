/* tslint:disable:max-classes-per-file */

import TSF from './tsf';

async function timeout(time = 4) {
    return (new Promise((resolve, reject) => window.setTimeout(() => resolve(), time)));
}

test('Templates', async () => {
    expect.assertions(1);
    document.documentElement.innerHTML = '<div id="app"></div>';

    const app = new TSF('#app');
    class Main {
        public $template = `<h1>Hello World</h1>`;
    }
    app.run(new Main());

    await timeout();
    expect(document.querySelector('#app').innerHTML).toEqual('<h1>Hello World</h1>');
});

test('One-way data-binding', async () => {
    expect.assertions(2);
    document.documentElement.innerHTML = '<div id="app"></div>';

    const app = new TSF('#app');
    class Main {
        public $template = `<h1>{{ this.message }}</h1>`;
        public message = 'Hello World';
    }
    const main = new Main();
    app.run(main);

    await timeout();
    expect(document.body.innerHTML).toEqual('<div id=\"app\"><h1>Hello World</h1></div>');

    main.message = 'Hello Stranger';
    await timeout();
    expect(document.body.innerHTML).toEqual('<div id=\"app\"><h1>Hello Stranger</h1></div>');
});

test('Components', async () => {
    expect.assertions(1);
    document.documentElement.innerHTML = '<div id="app"></div>';

    const app = new TSF('#app');
    class Greeting {
        public $template = `<h2>Hello {{ this.name }}</h2>`;
        public name;
        constructor(name = 'Stranger') {
            this.name = name;
        }
    }
    app.register('greeting', Greeting);
    app.component('jon-snow', new Greeting('Jon Snow'));
    app.component('john-doe', new Greeting('John Doe'));
    class Main {
        public $template = '' +
            '<greeting></greeting>' +
            '<jon-snow></jon-snow>' +
            '<john-doe></john-doe>';
    }
    app.run(new Main());
    await timeout();
    expect(document.querySelector('#app').innerHTML).toEqual(
        '<greeting><h2>Hello Stranger</h2></greeting>' +
        '<jon-snow><h2>Hello Jon Snow</h2></jon-snow>' +
        '<john-doe><h2>Hello John Doe</h2></john-doe>');
});

test('Events', async () => {
    expect.assertions(2);
    document.documentElement.innerHTML = '<div id="app"></div>';

    const app = new TSF('#app');
    class Main {
        public $template = `<button $onclick="this.handler()">Click me</button>{{ this.clicked ? 'true' : 'false' }}`;
        public clicked = false;
        public handler() {
            this.clicked = true;
        }
    }
    app.run(new Main());
    await timeout();
    expect(document.querySelector('#app').innerHTML).toEqual('<button>Click me</button>false');
    await timeout();
    document.querySelector('button').click();
    await timeout();
    expect(document.querySelector('#app').innerHTML).toEqual('<button>Click me</button>true');
});

test('If', async () => {
    expect.assertions(2);
    document.documentElement.innerHTML = '<div id="app"></div>';

    const app = new TSF('#app');
    class Main {
        public $template = `<div $if="this.condition">A</div><div $if="!this.condition">B</div>`;
        public condition = true;
    }
    const main = new Main();
    app.run(main);
    await timeout();
    expect(document.querySelector('#app').innerHTML).toEqual('<div>A</div>');

    main.condition = false;
    await timeout();
    expect(document.querySelector('#app').innerHTML).toEqual('<div>B</div>');
});

test('If nested', async () => {
    expect.assertions(4);
    document.documentElement.innerHTML = '<div id="app"></div>';

    const app = new TSF('#app');
    class Main {
        public $template = `
            <div $if="this.conditionA">A
                <div $if="this.conditionB">B
                     <div $if="this.conditionC">C
                     </div>
                </div>
            </div>`;
        public conditionA = true;
        public conditionB = true;
        public conditionC = true;
    }
    const main = new Main();
    app.run(main);
    await timeout();
    expect(document.querySelector('#app').innerHTML.replace(/\s/g, '')).toEqual('<div>A<div>B<div>C</div></div></div>');

    main.conditionC = false;
    await timeout();
    expect(document.querySelector('#app').innerHTML.replace(/\s/g, '')).toEqual('<div>A<div>B</div></div>');

    main.conditionA = false;
    await timeout();
    expect(document.querySelector('#app').innerHTML.replace(/\s/g, '')).toEqual('');

    main.conditionA = true;
    await timeout();
    expect(document.querySelector('#app').innerHTML.replace(/\s/g, '')).toEqual('<div>A<div>B</div></div>');
});

test('For', async () => {
    expect.assertions(3);
    document.documentElement.innerHTML = '<div id="app"></div>';

    const app = new TSF('#app');
    class Main {
        public $template = `<div $for="this.items">{{ this.items[$index] }}</div>`;
        public items = ['a', 'b', '_'];
    }
    const main = new Main();
    app.run(main);
    await timeout();
    expect(document.querySelector('#app').innerHTML).toEqual('<div>a</div><div>b</div><div>_</div>');

    main.items[2] = 'c';
    await timeout();
    expect(document.querySelector('#app').innerHTML).toEqual('<div>a</div><div>b</div><div>c</div>');

    main.items.push('d');
    await timeout();
    expect(document.querySelector('#app').innerHTML).toEqual('<div>a</div><div>b</div><div>c</div><div>d</div>');
});
