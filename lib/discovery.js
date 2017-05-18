const fs = require('fs');
const path = require('path');
const fileregex = /.inject.js$/;

let discoverInjectables = function (dir, filelist = []) {
    let files = fs.readdirSync(dir);
    files.forEach(function (file) {
        let _path = path.join(dir, file);
        if (fs.statSync(_path).isDirectory()) {
            filelist = discoverInjectables(_path + '/', filelist);
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
module.exports = (dir) => {
    let filelist = discoverInjectables(dir);
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