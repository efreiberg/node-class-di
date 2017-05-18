const async = require('async');
const discoverInjectables = require('./discovery');
const getDependecyOrder = require('./dependencies');
const registry = require('./registry');
const initDependency = require('./injector');

function initDependencies(dependencies, registry, callback) {
    async.eachSeries(dependencies, (levelArray, cb) => {
        async.each(levelArray, (dependency, depCb) => {
            let registryEntry = registry.get(dependency);
            //Class not init yet
            if (typeof registryEntry.instanceRef === 'undefined') {
                registryEntry.instanceRef = {};
                let refDependencies = registryEntry.dependencies.map(function (rdep) {
                    return rdep.instanceRef;
                })
                let initFn = registryEntry.instanceRef.onInit;
                let initThisRef = registryEntry.instanceRef;
                if (registryEntry.isAsync) {
                    initFn.apply(initThisRef, refDependencies.concat(depCb));
                }
                else {
                    initFn.apply(initThisRef, refDependencies);
                    process.nextTick(depCb.bind(null));
                }
            }
            //Already init
            else {
                setImmediate(depCb.bind(null, registryEntry.instanceRef));
            }
        }, cb);
    }, callback);
}

module.exports = (callback) => {
    let moduleDependencies = new Map();
    let modules = discoverInjectables(process.cwd());
    //Register each module
    modules.forEach((module) => {
        registry.registerClass(module);
    });
    let reg = registry.getRegistry();
    //Accumulate dependency injection orders
    reg.forEach(function (entry, key) {
        moduleDependencies.set(key, getDependecyOrder(key, reg));
    });
    async.eachSeries(moduleDependencies.keys(), (key, cb) => {
        initDependencies(moduleDependencies.get(key).reverse(), reg, cb);
    }, callback);
}