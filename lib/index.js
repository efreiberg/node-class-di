const each = require('./util').asyncEachSeries;
const eachParallel = require('./util').asyncEachParallel;
const discoverInjectables = require('./discovery');
const getDependecyOrder = require('./dependencies');
const registry = require('./registry');
const initDependency = require('./init');

function initDependencies(dependencies, registry, callback) {
    each(dependencies, function (levelArray, levelCb) {
        eachParallel(levelArray, function (entry, depCb) {
            initDependency(registry, entry, depCb);
        }, levelCb);
    }, callback);
}

module.exports = (options, callback) => {
    let hasEntry = (typeof options.entry === 'string');
    if (typeof options === 'function') {
        callback = options;
        options = {};
    }
    let moduleDependenciesInitArray = [];
    let modules = discoverInjectables(options, process.cwd());
    //Register each module
    modules.forEach((module) => {
        registry.registerClass(module);
    });
    let reg = registry.getRegistry();
    if (hasEntry) {
        if (!reg.has(options.entry)) {
            return setImmediate(() => {
                callback(`Entry class ${options.entry} not found`);
            });
        }
    }
    //Accumulate dependency injection orders
    reg.forEach(function (entry, key) {
        moduleDependenciesInitArray.push(getDependecyOrder(key, reg).reverse());
    });
    //Run init
    each(moduleDependenciesInitArray, function (dependencies, cb) {
        initDependencies(dependencies, reg, cb);
    }, (err) => {
        if (err) { return callback(err) }
        callback(null, hasEntry ? reg.get(options.entry).instanceRef : null);
    });
}