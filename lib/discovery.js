const fs = require('fs');
const path = require('path');
const IGNORE_DIRS = require('./constants').IGNORE_DIRS;
const fileregex = /.inject.js$/;

let discoverInjectables = function (dir, ignoreDirs, filelist = []) {
    let files = fs.readdirSync(dir);
    files.forEach(function (file) {
        let _path = path.join(dir, file);
        if (fs.statSync(_path).isDirectory()) {
            //Ignore directories Ex. node_modules
            if (IGNORE_DIRS.some((ingorePathRegex) => { return ingorePathRegex.test(_path) })) {
                return;
            }
            else {
                filelist = discoverInjectables(_path + '/', ignoreDirs, filelist);
            }
        }
        else {
            filelist.push(_path);
        }
    });
    return filelist.filter(filepath => fileregex.test(filepath));
};

/**
 * Returns array of modules
 */
module.exports = (options, dir) => {
    console.log(options, dir, IGNORE_DIRS);
    let filelist = discoverInjectables(dir, options.ignoreDirs || IGNORE_DIRS);
    let modules = [];
    filelist.forEach(function (filepath) {
        try {
            //Require module
            modules.push(require(filepath));
        }
        catch (e) {
            console.error(e);
        }
    });
    return modules;
};