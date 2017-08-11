import TSF from './framework/tsf';

// components
import Counter from './components/counter/counter';
import IndexPage from './components/indexPage';
import ToUpperCaseFrom from './components/toUpperCaseFrom';

// render application to DOM element
const app = new TSF(document.getElementById('app'));

// register component classes
app.register('counter', Counter);
app.register('toupper', ToUpperCaseFrom);

// initialize custom components
const timer = new Counter();
const hello = new ToUpperCaseFrom();
app.component('timer', timer);
app.component('hello', hello);

// set root component
app.root(new IndexPage());

// run custom logic
hello.text = 'custom text';
setInterval( () => timer.value++, 1000 );
