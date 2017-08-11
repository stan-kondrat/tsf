import Counter from './counter/counter';
import TSF from './framework/tsf';

const rootElement = document.getElementById('app');

const app = new TSF(rootElement);

const counter = new Counter();

app.add(counter);

setInterval( () => counter.value++, 1000 );
