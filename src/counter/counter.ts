require('./counter.css');
const template = require('./counter.html');

export default class Counter {
    public template = template;
    public value = 0;

    public reset() {
        this.value = 0;
    }
}
