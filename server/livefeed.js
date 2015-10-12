//required packages
var chokidar = Meteor.npmRequire('chokidar');
var csvmodule = Meteor.npmRequire('csv');
var fs = Meteor.npmRequire('fs');
var Future = Meteor.npmRequire('fibers/future');

var logger = Meteor.npmRequire('winston'); // this retrieves default logger which was configured in log.js
// Meteor.startup(function(){
// 	LiveData.createIndex({"subTypes.key": 1, "subTypes.value": 1});
// });
//insert live data into DB - serves as a cache for most recent day; _id is site_sensor_epoch
//obj has site, sensor [rdgType], epoch5min, epoch10sec
var liveDataUpsert = Meteor.bindEnvironment(function (obj) {
    var future = new Future();
	LiveData.upsert({
		//_id : obj.site+'_'+obj.sensor+'_'+obj.epoch5min,
		_id : obj.site+'_'+obj.epoch
	},{
		epoch : obj.epoch,
		site : obj.site,
		subTypes : obj.subTypes
	})
    return future.wait();
	//needs to trigger new empty five minute data; aggregation for avg, etc.??
});
var liveDataUpdate = Meteor.bindEnvironment(function (obj) {
    var future = new Future();
    LiveData.update(obj); 
    return future.wait();
});

//overwrite 5 minute data in DB
var aggrDataUpsert = Meteor.bindEnvironment(function (obj) {
    var future = new Future();
    // AggrData.upsert({
//         // Selector
//         timeStamp: obj.theTime,
//         siteRef: obj.siteRef,
//         param: obj.param
//     }, {
//         // Modifier
//         $push: {
//             flag: obj.flag,
//             overwriteTimeStamp: moment()
//         }
//     });
    return future.wait();
});
var writeAggreg = Meteor.bindEnvironment(function(epoch){
	var future = new Future();
	var showOne = LiveData.findOne();
	// console.log('findOne')
	console.log(showOne)
	console.log(LiveData.find().count())
	// console.log(showOne.subTypes.metrons)
	var epoch5 = showOne.epoch;
	var aggreg = LiveData.aggregate( [
		{$group: {_id : { $gt : [epoch - 500000, epoch - (epoch%300000)]}}}
		// { $group: { _id : { $regex: /^'$site+_'/ }
	// //	{ $group: { _id : { site : "$site", epoch : "$epoch5min" }
	//	}}
	//	
	//    	 	{ $match: { totalPop: { $gte: 10*1000*1000 } } }
	 ] )
	 console.log(aggreg)
	var future = new Future();
});
writeAggreg('epoch');
//LiveData.remove({});
var write10Sec = function(arr){
	for (var k=0;k<arr.length;k++){
		var singleObj = makeObj(arr[k]);
		var epoch = (((arr[k].TheTime - 25569) * 86400) + 6) * 3600;
		singleObj.epoch = epoch - (epoch%10000); //rounding down to 10 seconds
		//singleObj.epoch5min = epoch - (epoch%300000);
		liveDataUpsert(singleObj);
	};
	writeAggreg(singleObj.epoch);
};
var siteTableAlpha = function(alpha){
	//have it return from the sites db
	//var sites = 
	//return sites[alpha]
	return '481670571'
};
var makeObj = function(keys){ //pass newVal==true for preallocate
	var obj = {};
	obj.subTypes = {};
	obj.subTypes['metrons'] = {}; 
	var metron = [];
	for (var key in keys){
		var subKeys = key.split('_');
		if (subKeys.length > 1){  //skipping 'TheTime'
			var alphaSite = subKeys[0]+'_'+subKeys[1];
			var metric = subKeys[subKeys.length-1]; //i.e. conc., direction, etc.
			var metrized = key.replace(alphaSite+'_','');
			var metron = metrized.replace('_'+metric,''); //wind, O3, etc.
			val = keys[key]
			if (!obj.subTypes.metrons[metron]){
				obj.subTypes.metrons[metron] = [{metric:metric,val:val}];
			} else {
				obj.subTypes.metrons[metron].push({metric:metric,val:val});
			}
			if (!obj.site){
				obj.site = siteTableAlpha(alphaSite);
			}
		};
	};
//needs to return shape from schema in data.js (which must be accessible client and server)
	return obj
};	
/*
{ subTypes: { metrons: { O3: 
									[ { metric: 'conc', val: 20.78 }, 
										{ metric: 'Flag', val: 1 } 
									], 
						RMY_Wind: [ { metric: 'Direction', val: 'test' },
									{ metric: 'Flag', val: '' },
									{ metric: 'Speed', val: '' } 
								], 
						HMP60: [{ metric: 'Flag', val: '' },
								 { metric: 'RH', val: '' },
								 { metric: 'Temp', val: '' }
								] 
} },
  site: '481670571',
  epoch10sec: 5196234320000 }

		// console.log(singleObj)
// 		console.log(singleObj.subTypes)
// 		console.log(singleObj.subTypes.metrons)
// 		console.log(singleObj.subTypes.metrons.O3)
// 		console.log(singleObj.subTypes.metrons.O3[1])
//console.log(singleObj.subTypes.metrons.O3[1].metric)
		// singleObj.epoch10sec = epoch - (epoch%10000);
		// obj.epoch5min = epoch - (epoch%300000);
		// obj.epoch1hr = epoch - (epoch%3600000);
		// obj.epoch1day = epoch - (epoch%86400000);


FOR SEARCHING ON OBJ SUBTYPES http://learnmongodbthehardway.com/schema/chapter5/
var col = db.getSisterDB("supershot").images;
col.find({ metadata: { $all: [
            { "$elemMatch" : { key : "MIME type", value: "image/jpeg" } },
            { "$elemMatch" : { key: "Flash", value: "No, auto" } }
          ]}
       }).toArray();
*/

var rdFile = function(path){
    var pathArray = path.split('/');
    var parentDir = pathArray[pathArray.length - 2];
    var tempArray = [];
    fs.readFile(path, 'utf-8', function (err, output) {
        csvmodule.parse(output, {
            delimiter: ',',
            rowDelimiter: '\r',
            auto_parse: true,
            columns: true
        }, function (err, siteInfo) {
            if (err) {
                logger.error(err);
            };
			write10Sec(siteInfo);
		});
	});
};
var liveWatcher = chokidar.watch('/Users/dprice3/testHNET', {
    ignored: /[\/\\]\./,
    ignoreInitial: true,
    usePolling: true,
    persistent: true
});

liveWatcher
    .on('add', function (path) {
        logger.info('File ', path, ' has been added.');
		rdFile(path);
    })
	.on('change', function (path) {
		logger.info('File', path, 'has been changed');
		rdFile(path);
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

