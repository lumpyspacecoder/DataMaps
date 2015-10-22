//required packages
var chokidar = Meteor.npmRequire('chokidar');
var csvmodule = Meteor.npmRequire('csv');
var fs = Meteor.npmRequire('fs');
var Future = Meteor.npmRequire('fibers/future');
var logger = Meteor.npmRequire('winston'); // this retrieves default logger which was configured in log.js

//insert live data into DB - serves as a cache for most recent day; _id is site_sensor_epoch
//obj has site, sensor [rdgType], epoch5min, epoch10sec
var liveDataUpsert = Meteor.bindEnvironment(function (obj) {
    var future = new Future();
    LiveData.upsert({
        _id: obj.site + '_' + obj.epoch
    }, {
        epoch5min: obj.epoch5min,
        subTypes: obj.subTypes
    });
    return future.wait();
});



var makeObj = function (keys) { //pass newVal==true for preallocate
    var obj = {};
    obj.subTypes = {};
    obj.subTypes.metrons = {};
    var metron = [];
    for (var key in keys) {
        var subKeys = key.split('_');
        if (subKeys.length > 1) { //skipping 'TheTime'
            var alphaSite = subKeys[0] + '_' + subKeys[1];
            var metric = subKeys[subKeys.length - 1]; //i.e. conc., direction, etc.
            var metrized = key.replace(alphaSite + '_', '');
            metron = metrized.replace('_' + metric, ''); //wind, O3, etc.
            var val = keys[key];
            if (!obj.subTypes.metrons[metron]) {
                obj.subTypes.metrons[metron] = [{
                    metric: metric,
                    val: val
                }];
            } else {
                obj.subTypes.metrons[metron].push({
                    metric: metric,
                    val: val
                });
            }
        }
    }
    //needs to return shape from schema in data.js (which must be accessible client and server)
    return obj;
};

var write10Sec = function (siteInfo, arr) {
    for (var k = 0; k < arr.length; k++) {
        var singleObj = makeObj(arr[k]);
        var epoch = (((arr[k].TheTime - 25569) * 86400) + 6) * 3600;
        singleObj.epoch = epoch - (epoch % 10000); //rounding down to 10 seconds
        singleObj.epoch5min = epoch - (epoch % 300000);
        singleObj.site = siteInfo;
        liveDataUpsert(singleObj);
    }
};


// This function returns a future which resolves after a timeout. This
// demonstrates manually resolving futures.
function sleep(ms) {
    var future = new Future;
    setTimeout(function() {
        future.return();
    }, ms);
    return future;
}

// This is a function which automatically runs in their own fiber and
// return futures that resolve when the fiber returns (found at https://github.com/laverdet/node-fibers).
var calcTimerDelta = function(ms) {
    var start = new Date;
    sleep(ms).wait();
    return new Date - start;
}.future(); // <-- important!



var readFile = function (path) {
    var pathArray = path.split('/');
    var parentDir = pathArray[pathArray.length - 2];
    
    // And futures also include node-friendly callbacks if you don't want to use
// wait()
calcTimerDelta(2000).resolve(function(err, val) {
    console.log('Set timer for 2000ms, waited '+ val+ 'ms');
    
    var siteInfo = lookupSite(parentDir);
    logger.info('siteInfo: ', siteInfo);

    fs.readFile(path, 'utf-8', function (err, output) {
        csvmodule.parse(output, {
            delimiter: ',',
            rowDelimiter: '\r',
            auto_parse: true,
            columns: true
        }, function (err, parsedLine) {
            if (err) {
                logger.error(err);
            }
            logger.info('siteInfo2: ', siteInfo);
            write10Sec(siteInfo, parsedLine);
        });
    });
});
    
    
};

var liveWatcher = chokidar.watch('/hnet/incoming/2015', {
    ignored: /[\/\\]\./,
    ignoreInitial: true,
    usePolling: true,
    persistent: true
});

liveWatcher
    .on('add', function (path) {
        logger.info('File ', path, ' has been added.');
        readFile(path);
    })
    .on('change', function (path) {
        logger.info('File', path, 'has been changed');
        readFile(path);
    })
    .on('addDir', function (path) {
        logger.info('Directory', path, 'has been added');
    })
    .on('error', function (error) {
        logger.error('Error happened', error);
    })
    .on('ready', function () {
        logger.info('Initial scan for hnetincoming2015 complete. Ready for changes');
    });