# class-inject
Class-based, async-supported, dependency injection for node.js.  Injectable modules must have a filename that ends in `.inject.js` and exports only a class with an `onInit` method.  Dependencies are injected into this method, as requested, as singleton class instances.  Specify `callback` as the final parameter if the `onInit` method needs to be async.

## Example Usage

### foo.inject.js
```
module.exports = class a {
    constructor() {

    }
    onInit(b, callback) {
        b.asyncMethod(callback);
    }
}
```

### bar.inject.js
```
module.exports = class b {
    constructor() {

    }
    onInit(logger) {
        logger.debug('Initializing b...');
    }
    asyncMethod(cb) {
        setTimeout(() => cb());
    }
}
```

### Initialization
```
const lib = require('class-di');

lib.init(function(){
    console.log('DONE!');
})
```
