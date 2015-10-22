//required packages
var chokidar = Meteor.npmRequire('chokidar');
var csvmodule = Meteor.npmRequire('csv');
var fs = Meteor.npmRequire('fs');
var logger = Meteor.npmRequire('winston'); // this retrieves default logger which was configured in log.js

//insert live data into DB - serves as a cache for most recent day; _id is site_epoch
//obj has subTypes, epoch5min
var liveDataUpsert = Meteor.bindEnvironment(function (dir, obj) {
    var site = Monitors.findOne({
        incoming: dir
    });

    LiveData.upsert({
        _id: site.AQSID + '_' + obj.epoch
    }, {
        epoch5min: obj.epoch5min,
        subTypes: obj.subTypes
    });

});

var makeObj = function (keys) {
    var obj = {};
    obj.subTypes = {};
    obj.subTypes.metrons = {};
    var metron = [];
    for (var key in keys) {
        if (keys.hasOwnProperty(key)) {
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
    }

    return obj;
};

var write10Sec = function (dir, arr) {
    for (var k = 0; k < arr.length; k++) {
        var singleObj = makeObj(arr[k]);
        var epoch = (((arr[k].TheTime - 25569) * 86400) + 6) * 3600;
        singleObj.epoch = epoch - (epoch % 10000); //rounding down to 10 seconds
        singleObj.epoch5min = epoch - (epoch % 300000);
        liveDataUpsert(dir, singleObj);
    }
};

var readFile = function (path) {
    var pathArray = path.split('/');
    var parentDir = pathArray[pathArray.length - 2];

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
            write10Sec(parentDir, parsedLine);
        });
    });
};

var initialRead = function (directory) {
    fs.readdir(directory, function (err, files) {
        if (err) {
            return;
        }
        files.forEach(function (f) {
            var path = directory + f;
            logger.info('found: ', path);
            readFile(path);
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
        initialRead('/hnet/incoming/2015/UHCCH_DAQData/');
        logger.info('Initial scan for hnetincoming2015 complete. Ready for changes');
    });