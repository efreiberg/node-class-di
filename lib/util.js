const asyncEachSeries = function (arrayOfParams, eachFn, callback) {
    if (!Array.isArray(arrayOfParams) || typeof eachFn !== 'function') {
        throw new Error('Invalid asyncSeries param');
    }
    let results = [];
    let runFn = function (idx) {
        //Done
        if (idx >= arrayOfParams.length) {
            return callback(null, results);
        }
        else {
            //Call fuction
            eachFn.apply(null, [arrayOfParams[idx], function (err, result) {
                if (err) { callback(err, null) }
                else {
                    results[idx] = result;
                    runFn(++idx);
                }
            }])
        }
    }
    runFn(0);
}

const asyncEachParallel = function (arrayOfParams, eachFn, callback) {
    if (!Array.isArray(arrayOfParams) || typeof eachFn !== 'function') {
        throw new Error('Invalid asyncParallel param');
    }
    let status = {};
    let isDone = function () {
        return Object.keys(status).length === arrayOfParams.length;
    }
    let getResults = function () {
        let results = [];
        arrayOfParams.forEach(function (fn, idx) {
            results[idx] = status[idx];
        });
        return results;
    }
    //Call given fn's
    if (arrayOfParams.length === 0) {
        callback(null, getResults());
    }
    else {
        arrayOfParams.forEach(function (entry, idx) {
            eachFn.apply(null, [entry, function (err, result) {
                if (err) { return callback(err, null); }
                status[idx] = result;
                if (isDone()) {
                    callback(null, getResults());
                }
            }])
        })
    }
}


module.exports = {
    asyncEachSeries,
    asyncEachParallel
}