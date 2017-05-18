/**
 * Returns levels of dependencies, relative to given root node
 */

function buildDependecyGraph(root, registry) {
    let graph = {};
    let addChild = (nodeName, path) => {
        let value = graph;
        if (path.every(function (nestedKey) {
            if (nestedKey === nodeName) {
                throw new Error(`Dependency cycle detected: ${nodeName} @ ${path}`);
            }
            value = value[nestedKey];
            return !!value;
        })) {
            value[nodeName] = {};
        }
        else {
            throw new Error(`Invalid dependency path: ${nodeName}`);
        }
    }
    let processNode = (node, path) => {
        let entry = registry.get(node);
        if (typeof entry === 'undefined') {
            throw new Error(`Injectable not found: ${node}`);
        }
        let dependencies = entry.dependencies || [];
        path = path.concat(node);
        //Add children to graph
        dependencies.forEach((dep) => {
            addChild(dep, path);
        });
        //Process child dependencies
        dependencies.forEach((dep) => {
            processNode(dep, path);
        });

    }
    //Add root to graph
    addChild(root, []);
    processNode(root, []);

    return graph;
}

function getInjectionLevels(graph) {
    let levels = [];
    //walk dep graph, grouping nodes at each level
    let processLevel = (levelObj, depth) => {
        let levelKeys = Object.keys(levelObj);
        if (levelKeys.length > 0) {
            if (!Array.isArray(levels[depth])) {
                levels[depth] = [];
            }
            levelKeys.forEach(key => {
                levels[depth].push(key);
            });
            depth++;
            levelKeys.forEach(key => {
                processLevel(levelObj[key], depth);
            });
        }
    }
    processLevel(graph, 0);
    return levels;
}
module.exports = (root, registry) => {
    let graph = buildDependecyGraph(root, registry);
    return getInjectionLevels(graph);
}