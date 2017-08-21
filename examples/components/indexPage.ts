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
    `;
    public data: any = { a: 'b' };
    public clone = {};

    constructor() {
        setTimeout(() => {
            this.data.a = { b: 'c' };
            this.clone = JSON.parse(JSON.stringify(this.data));
        }, 1000);

        setTimeout(() => {
            this.data.a.b = { c: 'd' };
            this.clone = JSON.parse(JSON.stringify(this.data));
        }, 2000);
    }
}
