const assert = require('chai').assert;
let buildDeps = require('../../lib/dependencies');
//Setup test registry
let root = '1';
let testRegistry = new Map();
let addInjectable = function (uid, deps) {
    testRegistry.set(uid, {
        dependencies: deps
    });
}

addInjectable(root, ['2', '3']);
addInjectable('2', ['3']);
addInjectable('3', ['4']);
addInjectable('4', []);

describe("Dependency Graph Tests", () => {
    beforeEach(() => {
        testRegistry.clear();
    });
    it("Empty Deps", () => {
        addInjectable(root, []);
        let result = buildDeps(root, testRegistry);
        assert.deepEqual(result, [[root]]);
    })
    /**
     *   1-2-3-4 & 1-3-4  
     */
    it("Graph Levels 1", () => {
        addInjectable(root, ['2', '3']);
        addInjectable('2', ['3']);
        addInjectable('3', ['4']);
        addInjectable('4', []);
        let result = buildDeps(root, testRegistry);
        assert.deepEqual(result, [[root], ['2', '3'], ['3', '4'], ['4']]);
    })

    /**
     *   1-2-3-4-5
     *   1-3-4-5
     *   1-4-5
     */
    it("Graph Levels 2", () => {
        addInjectable(root, ['2', '3', '4']);
        addInjectable('2', ['3']);
        addInjectable('3', ['4']);
        addInjectable('4', ['5']);
        addInjectable('5', []);
        let result = buildDeps(root, testRegistry);
        assert.deepEqual(result, [[root], ['2', '3', '4'], ['3', '4', '5'], ['4', '5'], ['5']]);
    })

    it("Missing Dependency", () => {
        addInjectable(root, ['2', '3']);
        addInjectable('2', ['3']);
        addInjectable('3', ['4']);
        assert.throws(() => { buildDeps(root, testRegistry) });
    })

    it("Cycle 1", () => {
        addInjectable(root, ['2', '3']);
        addInjectable('2', ['3']);
        addInjectable('3', ['4']);
        addInjectable('4', ['2']);
        assert.throws(() => { buildDeps(root, testRegistry) });
    })

     it("Cycle 2", () => {
        addInjectable(root, ['2', '3', '5']);
        addInjectable('2', ['3', '4']);
        addInjectable('3', ['4']);
        addInjectable('4', ['5']);
        addInjectable('5', ['3']);
        assert.throws(() => { buildDeps(root, testRegistry) });
    })
})