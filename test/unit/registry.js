const assert = require('chai').assert;
let registerClass = require('../../lib/registry').registerClass;
let getRegistry = require('../../lib/registry').getRegistry;

describe("Register Class Tests", function () {
    beforeEach(() => {
        require('../../lib/registry').clearRegistry();
    })
    it("Register Invalid Type", function () {
        assert.throws(function () {
            registerClass(function namedFunction() { })
        });
    });
    it("Register Missing Lifecycle Methods", function () {
        assert.throws(function () {
            let c = class Tester {
                constructor() { }
            }
            registerClass(c)
        });
    });
    it("Register OK - No Deps", function () {
        let c = class Tester {
            constructor() { }
            onInit() { }
        }
        registerClass(c);
        assert.equal(getRegistry().size, 1);
        assert.isOk(getRegistry().get('Tester'));
        assert.deepEqual(getRegistry().get('Tester').dependencies, []);
    });
    it("Register Fail - Dup UID", function () {
        let c = class Tester {
            constructor() { }
            onInit() { }
        }
        registerClass(c)
        assert.throws(function () {
            registerClass(c)
        });
    });
    it("Register OK - Has Sync Deps", function () {
        let c = class Tester {
            constructor() { }
            onInit(i1, i2, i3) { }
        }
        registerClass(c);
        assert.equal(getRegistry().size, 1);
        assert.isOk(getRegistry().get('Tester'));
        assert.deepEqual(getRegistry().get('Tester').dependencies, ['i1', 'i2', 'i3']);
        assert.isFalse(getRegistry().get('Tester').isAsync);
    });
    it("Register OK - Has Async Deps", function () {
        let c = class Tester {
            constructor() { }
            onInit(i1, i2, i3, callback) { }
        }
        registerClass(c);
        assert.equal(getRegistry().size, 1);
        assert.isOk(getRegistry().get('Tester'));
        assert.deepEqual(getRegistry().get('Tester').dependencies, ['i1', 'i2', 'i3']);
        assert.isTrue(getRegistry().get('Tester').isAsync);
    });
    it("Register Multiple", function () {
        let c1 = class Tester1 {
            constructor() { }
            onInit(i1, i2, i3, callback) { }
        }
        let c2 = class Tester2 {
            constructor() { }
            onInit(i1, i2, i3, callback) { }
        }
        registerClass(c1);
        registerClass(c2);
        assert.equal(getRegistry().size, 2);
        assert.isOk(getRegistry().get('Tester1'));
        assert.isOk(getRegistry().get('Tester2'));
    });
});
