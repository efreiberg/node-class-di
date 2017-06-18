const assert = require('chai').assert;
let discoveryList = require('../../../lib/discovery')({}, __dirname);

describe("Injectable Discovery Test", function () {
    it("Find injectable modules, duplicates included, proper modules ignored", function () {
        assert.deepEqual(discoveryList.map(module => module.name).sort(), ['Service', 'Test', 'Test'])
    });
});
