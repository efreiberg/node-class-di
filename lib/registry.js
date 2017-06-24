const INEJCTED_METHOD = 'onInit';
const ASYNC_CALLBACK = 'callback';
const classRegistry = new Map();
const methodRegex = new RegExp(/\(([^\)]+)\)/);

/**
 * Parse dependecies from function string
 */
function parseDependecies(functionStr) {
    //Isolate everything before the opening curly brace
    let functionSigEnd = functionStr.indexOf('{');
    let isolatedFunctionStr = (functionStr.slice(0, functionSigEnd > -1 ? functionSigEnd : functionStr.length)).trim();
    let matches = methodRegex.exec(isolatedFunctionStr) || [];
    if (matches.length < 2) {
        return [];
    }
    return matches[1].split(',').map(entry => entry.trim());
}

/**
 * Get class name from definition
 */
function getClassName(classDef) {
    return classDef.name;
}

function getInjectedFunction(classDef) {
    if (typeof classDef.prototype[INEJCTED_METHOD] !== 'function') {
        throw new Error(`Class ${classDef.name} is missing injected method ${INEJCTED_METHOD}`);
    }
    return classDef.prototype[INEJCTED_METHOD];
}

function registerClass(classDefinition) {
    if (typeof classDefinition !== 'function' && typeof classDefinition.prototype !== 'undefined') {
        throw new Error('Invalid class definition');
    }
    let uid = getClassName(classDefinition);
    if (typeof uid !== 'string') {
        throw new Error(`Injectable class missing identifier`);
    }
    if (classRegistry.has(uid)) {
        throw new Error(`Injectable class already registered with name ${uid}`);
    }
    let targetMethod = getInjectedFunction(classDefinition);
    let dependencyList = parseDependecies(targetMethod.toString());
    let isAsync = dependencyList[dependencyList.length - 1] === ASYNC_CALLBACK;
    classRegistry.set(uid, {
        'dependencies': isAsync ? dependencyList.slice(0, -1) : dependencyList,
        'isAsync': isAsync,
        'ref': undefined,
        set instanceRef(val) {
            this.ref = new classDefinition(val);
        },
        get instanceRef() {
            return this.ref
        }
    });
}

module.exports = {
    registerClass,
    getRegistry: () => classRegistry,
    clearRegistry: () => { classRegistry.clear() }
}