# node-class-di
Class-based, async-supported, dependency injection.  Services are discovered by modules in which their filenames end in `.inject.js` and that module exports a class with an `onInit` method.  Dependencies are injected into this method, as requested, as singleton class instances.

## Example Usage
```
module.exports = class a {
    constructor() {

    }
    onInit(b, callback) {
        b.fooAsync(callback);
    }
}
```

```
module.exports = class b {
    constructor() {

    }
    onInit(logger) {
        logger.debug('Initializing b...');
    }
    fooAsync(cb) {
        setTimeout(() => cb());
    }
}
```
