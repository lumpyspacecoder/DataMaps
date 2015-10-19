//required packages
var chokidar = Meteor.npmRequire('chokidar');
var csvmodule = Meteor.npmRequire('csv');
var fs = Meteor.npmRequire('fs');
var Fiber = Meteor.npmRequire('fibers');
var logger = Meteor.npmRequire('winston'); // this retrieves default logger which was configured in log.js

//insert live data into DB
var liveDataUpsert = Meteor.bindEnvironment(function (obj) {
    LiveData.upsert({
        _id: obj.site + '_' + obj.epoch
    }, {
        epoch5min: obj.epoch5min,
        subTypes: obj.subTypes
    });
});

var writeAggreg = Meteor.bindEnvironment(function () {
    var showOne = LiveData.findOne();
    console.log(showOne);
    console.log(LiveData.find().count());

    var aggreg = LiveData.aggregate([
        {
            $group: {
                _id: null,
                resTime: {
                    $sum: '$subTypes.metrons.O3.conc'
                }
            }
        }
  ], {
        explain: true
    });
    console.log(aggreg);
    console.log('Explain Report: ', JSON.stringify(aggreg[0]), null, 2);
});


var findSite = Meteor.bindEnvironment(function (alpha) {    
    //logger.info('Found site: ', obj.site, ' for ', alpha);
    return Sites.findOne(alpha);
});

//create object structure
var makeObj = function (alpha, keys) { //pass newVal==true for preallocate
    var obj = {};
    obj.subTypes = {};
    obj.subTypes.metrons = {};
    var metron = [];
    
    for (var key in keys) {
        var subKeys = key.split('_');
        if (subKeys.length > 1) { //skipping 'TheTime'
            var alphaSite = subKeys[0]+'_'+subKeys[1];
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
            if (!obj.site) {
                obj.site = findSite(alpha);
            }
        }
    }
    //needs to return shape from schema in data.js (which must be accessible client and server)
    return obj;
};

var write10Sec = function (alpha, arr) {
    var singleObj = [];
    for (var k = 0; k < arr.length; k++) {
        singleObj = makeObj(alpha, arr[k]);
        var epoch = (((arr[k].TheTime - 25569) * 86400) + 6) * 3600;
        singleObj.epoch = epoch - (epoch % 10000); //rounding down to 10 seconds
        singleObj.epoch5min = epoch - (epoch % 300000);
        liveDataUpsert(singleObj);
    }
};

//read HNET style file (10s data)
var readFile = function (path) {
    var pathArray = path.split('/');
    var parentDir = pathArray[pathArray.length - 2];
    fs.readFile(path, 'utf-8', function (err, output) {
        csvmodule.parse(output, {
            delimiter: ',',
            rowDelimiter: '\r',
            auto_parse: true,
            columns: true
        }, function (err, siteInfo) {
            if (err) {
                logger.error(err);
            }
            write10Sec(parentDir, siteInfo);
        });
    });
};

//starting watcher for live incoming data
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
        logger.info('Initial scan for /hnet/incoming/2015 complete. Ready for changes');
    });