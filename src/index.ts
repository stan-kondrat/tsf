import TSF from './framework/tsf';

// components
import Counter from './components/counter/counter';
import ToUpperCaseFrom from './components/toUpperCaseFrom';

// render application to DOM element
const rootElement = document.getElementById('app');
const app = new TSF(rootElement);

// initialized components
const counter = new Counter();
const toUpperCaseFrom = new ToUpperCaseFrom();

app.add(toUpperCaseFrom);

// custom logic
// setInterval( () => counter.value++, 1000 );
