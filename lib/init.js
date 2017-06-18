/**
 * Init a given dependency
 */
module.exports = function initDependency(registry, registryEntryName, callback) {
    let registryEntry = registry.get(registryEntryName);
    //Class not init yet
    if (typeof registryEntry.instanceRef === 'undefined') {
        registryEntry.instanceRef = {};
        let refDependencies = registryEntry.dependencies.map(function (rdep) {
            return registry.get(rdep).instanceRef;
        })
        let initFn = registryEntry.instanceRef.onInit;
        let initThisRef = registryEntry.instanceRef;
        if (registryEntry.isAsync) {
            initFn.apply(initThisRef, refDependencies.concat(callback));
        }
        else {
            initFn.apply(initThisRef, refDependencies);
            process.nextTick(callback.bind(null));
        }
    }
    //Already init
    else {
        setImmediate(callback.bind(null, registryEntry.instanceRef));
    }
}