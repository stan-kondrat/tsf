# TSF - TypeScript Web Framework
> An lightweight web framework for TypeScript :surfer: 1.8 kB (minified and gzipped),

[![Build Status](https://travis-ci.org/stan-kondrat/tsf.svg)](https://travis-ci.org/stan-kondrat/tsf)

Documentation and Examples - https://stan-kondrat.github.io/tsf

```typescript
const app = new TSF('#app');

class Main {
    public $template = `<button $onclick="this.plus()">Plus</button> {{ this.counter }}`;
    public counter = 0;
    
    plus() {
        this.counter++; // DOM will updated automatically
    }
}

const main = new Main();

app.run(main); // Render application root component

main.counter = 100; // DOM will updated automatically
```

## Installing / Getting started

```shell
npm install tsf-web
```

## Licensing

The TSF is open-sourced software licensed under the MIT.
