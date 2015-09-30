//required packages
var chokidar = Meteor.npmRequire('chokidar');
var csvmodule = Meteor.npmRequire('csv');
var fs = Meteor.npmRequire('fs');
var Future = Meteor.npmRequire('fibers/future');

//using winston.log instead of console log
var winston = Meteor.npmRequire('winston');

winston.add(winston.transports.DailyRotateFile, {
    filename: 'datamaps.log',
    dirname: '/var/log/meteor/'
});

//upsert TCEQ data in DB
var tceqDataUpsert = Meteor.bindEnvironment(function (obj) {
    var future = new Future();
    TCEQData.upsert({
        // Selector
        timeStamp: obj.timeStamp,
        siteRef: obj.siteRef,
        param: obj.param
    }, {
        // Modifier
        $set: {
            //timeStamp is in UTC, we convert to epoch
            epoch: moment.utc(obj.timeStamp, 'YYYYMMDDHHmmss').unix(),
            poc: obj.poc,
            method: obj.method,
            units: obj.units,
            slope: obj.slope,
            intercept: obj.intercept,
            sample: obj.samle
        },
        $push: {
            value: obj.value,
            flag: obj.flag,
            verified: obj.verified,
            fileName: obj.fileName
        }
    });

    return future.wait();
});

//starting watcher for TCEQ folder
var TCEQwatcher = chokidar.watch('/hnet/incoming/TCEQ', {
    ignored: /[\/\\]\./,
    ignoreInitial: true,
    usePolling: true,
    persistent: true
});

//parsing incoming TCEQ files
TCEQwatcher
    .on('add', function (path) {
        winston.log('info', 'File ', path, ' has been added.');
        var pathArray = path.split('/');
        var fileName = pathArray[pathArray.length - 1];
        fs.readFile(path, 'utf-8', function (err, output) {
            csvmodule.parse(output, {
                delimiter: '|',
                rowDelimiter: '\n',
                auto_parse: true,
                columns: ['siteRef', 'timeStamp', 'param', 'poc', 'method', 'units', 'value', 'flag', 'verified', 'slope', 'intercept', 'sample']
            }, function (err, siteInfo) {
                if (err) {
                    winston.log('error', err.message);
                }
                _.each(siteInfo, function (line) {
                    line.fileName = fileName;
                    tceqDataUpsert(line);
                });
            });
        });
    })
    .on('change', function (path) {
        winston.log('info', 'File ', path, ' has been changed.');
    })
    .on('addDir', function (path) {
        winston.log('info', 'Directory ', path, ' has been added.');
    })
    .on('error', function (error) {
        winston.log('error', 'Error happened', error);
    })
    .on('ready', function () {
        //Default
        winston.log('info', 'Initial scan complete. Ready for changes');
        //Upcert existing data, should only be used when moving in old data that should be added to the database
        var dir = Meteor.npmRequire('node-dir');
        //scan an existing directory
        dir.files('/hnet/incoming/TCEQ', function (err, files) {
            if (err) {
                throw err;
            }
            _.each(files, function (path) {
                var pathArray = path.split('/');
                var fileName = pathArray[pathArray.length - 1];
                fs.readFile(path, 'utf-8', function (err, output) {
                    csvmodule.parse(output, {
                        delimiter: '|',
                        rowDelimiter: '\n',
                        auto_parse: true,
                        columns: ['siteRef', 'timeStamp', 'param', 'poc', 'method', 'units', 'value', 'flag', 'verified', 'slope', 'intercept', 'sample']
                    }, function (err, siteInfo) {
                        if (err) {
                            winston.log('error', err.message);
                        }
                        _.each(siteInfo, function (line) {
                            line.fileName = fileName;
                            tceqDataUpsert(line);
                        });
                    });
                });
            });
        });
    });