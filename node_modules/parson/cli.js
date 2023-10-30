#!/usr/bin/env node
/* jshint node: true */

function arrIncludes(arr, val) {
    return arr.indexOf(val) > -1;
}

function onError(err, extraData) {
    console.error('ERROR:', err.message);
    
    if (extraData && typeof extraData === 'string') {
        console.error(extraData);
    }
    
    process.exit(1);
}

if (arrIncludes(process.argv, '-v') || arrIncludes(process.argv, '--version')) {
    var pkg = require('./package.json');
    console.log('v%s', pkg.version);
    process.exit(0);
}

var data = [];

process.stdin.on('data', function(chunk) {
    data.push(chunk);
});

process.stdin.on('end', function() {
    var str = Buffer.concat(data).toString();
    
    try {
        var jsonData = JSON.parse(str);
        var jsonStr = JSON.stringify(jsonData, void 0, 2);
        console.log(jsonStr);
    } catch(e) {
        return onError(e, '\n' + str);
    }
});

// just in case, also handle errors
process.stdin.on('error', onError);
