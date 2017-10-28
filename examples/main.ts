import TSF from '../src/tsf';

const app = new TSF('#app');
class Main {
    public $template = `<h1>{{ this.message }}</h1> {{ this.now }}`;
    public message = 'Hello World';
    public now = '';
}
const main = new Main();
app.run(main);

setInterval( () => main.now = Date(), 1000 );
