Meteor.publish('LiveFeeds', function () {
    var now = new Date();
    var adayAgo = now.getTime() / 1000 - 24 * 3600;

    return LiveFeedMonitors.find({
        'epoch': {
            $gt: adayAgo
        },
        'type': 300
    }, {
        sort: {
            'epoch': -1
        }
    });
});

var chokidar = Meteor.npmRequire('chokidar');
//using winston.log instead of console log
var winston = Meteor.npmRequire('winston');
//parsing of csv files
var csvmodule = Meteor.npmRequire('csv');
var fs = Meteor.npmRequire('fs');
var Future = Meteor.npmRequire('fibers/future');

winston.add(winston.transports.DailyRotateFile, {
    filename: 'datamaps.log',
    dirname: '/var/log/meteor/'
});

//could have the grandparentDir be the collection name and have it created if not already
var data2insert = Meteor.bindEnvironment(function (obj) {
    var future = new Future();
    LiveFeedMonitors.insert(obj);
    return future.wait();
});

//starting watcher
var watcher = chokidar.watch('/hnet/incoming/2015/', {
    ignored: /[\/\\]\./,
    ignoreInitial: true,
    usePolling: true,
    persistent: true
});

watcher
    .on('add', function (path) {
        winston.log('info', 'File ', path, ' has been added.');
        var pathArray = path.split('/');
        var parentDir = pathArray[pathArray.length - 2];
        fs.readFile(path, 'utf-8', function (err, output) {
            var lineParser = new csvmodule.parse(output, {
                delimiter: ',',
                rowDelimiter: '\r',
                auto_parse: true,
                columns: true
            }, function (err, siteInfo) {
                if (err) {
                    winston.log('error', err);
                }
                _.each(siteInfo, function (line) {
                    var epoch = parseInt((line.TheTime - 25569) * 86400) + 6 * 3600;
                    line.epoch = epoch;
                    line.site = parentDir;
                    data2insert(line);
                });
            });
        });
    })
    .on('change', function (path) {
        winston.log('info', 'File', path, 'has been changed');

    })
    .on('addDir', function (path) {
        winston.log('info', 'Directory', path, 'has been added');
    })
    .on('error', function (error) {
        winston.log('error', 'Error happened', error);
    })
    .on('ready', function () {
        winston.log('info', 'Initial scan complete. Ready for changes');
    });




   