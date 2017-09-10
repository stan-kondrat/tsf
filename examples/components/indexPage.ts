export default class IndexPage {
    public $template = `
        <h1>Hello world</h1>
        <hello></hello>
        <br>
        <toupper></toupper>
        <br>
        <timer></timer>
        <counter></counter>
        <br>
        Object: {{ JSON.stringify(this.data) }} should be {{ JSON.stringify(this.clone) }}
        <br>
        Array: {{ JSON.stringify(this.items) }} should be {{ JSON.stringify(this.cloneArray) }}
        <br>
    `;
    public data: any = { a: 'b' };
    public clone = {};
    public items: any = ['a'];
    public cloneArray = '';

    constructor() {
        // Object
        setTimeout(() => {
            this.data.a = { b: 'c' };
            this.clone = JSON.parse(JSON.stringify(this.data));
        }, 1000);

        setTimeout(() => {
            this.data.a.b = { c: 'd' };
            this.clone = JSON.parse(JSON.stringify(this.data));
        }, 2000);

        // Array
        setTimeout(() => {
            this.items.push('b');
            this.cloneArray = JSON.parse(JSON.stringify(this.items));
        }, 1000);

        setTimeout(() => {
            this.items[0] = 'A';
            this.items[1] = 'B';
            this.cloneArray = JSON.parse(JSON.stringify(this.items));
        }, 2000);

        setTimeout(() => {
            this.items.push({ c: 'c' });
            this.cloneArray = JSON.parse(JSON.stringify(this.items));
        }, 3000);

        setTimeout(() => {
            this.items[2].c = 'C';
            this.cloneArray = JSON.parse(JSON.stringify(this.items));
        }, 4000);
    }
}
