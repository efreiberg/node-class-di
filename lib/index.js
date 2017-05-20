const each = require('./util').asyncEachSeries;
const eachParallel = require('./util').asyncEachParallel;
const discoverInjectables = require('./discovery');
const getDependecyOrder = require('./dependencies');
const registry = require('./registry');
const initDependency = require('./init');

function initDependencies(dependencies, registry, callback) {
    each(dependencies, function (levelArray, levelCb) {
        eachParallel(levelArray, function (entry, depCb) {
            initDependency(registry.get(entry), depCb);
        }, levelCb);
    }, callback);
}

module.exports = (callback) => {
    let moduleDependenciesInitArray = [];
    let modules = discoverInjectables(process.cwd());
    //Register each module
    modules.forEach((module) => {
        registry.registerClass(module);
    });
    let reg = registry.getRegistry();
    //Accumulate dependency injection orders
    reg.forEach(function (entry, key) {
        moduleDependenciesInitArray.push(getDependecyOrder(key, reg).reverse());
    });
    //Run init
    each(moduleDependenciesInitArray, function (dependencies, cb) {
        initDependencies(dependencies, reg, cb);
    }, callback);
}