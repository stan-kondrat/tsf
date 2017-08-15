# TSF - TypeScript Web Framework
> An lightweight web framework for TypeScript :surfer: 1.8 kB (minified and gzipped),

Documentation and Examples - https://stan-kondrat.github.io/tsf

```typescript
const app = new TSF('#app');

class Main {
    public $template = `<button $onclick="this.handler()">Click me</button>`;
    
    handler() {
    	alert('Clicked!');
    }
}

app.run(new Main());
```

## Installing / Getting started

```shell
npm install tsf-web
```

## Licensing

The TSF is open-sourced software licensed under the MIT.
