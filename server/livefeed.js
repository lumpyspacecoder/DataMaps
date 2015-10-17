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
		epoch5min : obj.epoch5min,
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
	AggrData.upsert(obj)
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

var siteId = '481670571'
var timeChosen = '519626' //first part of relevant epoch lookup
var siteChosen = new RegExp('^'+siteId+'_'+timeChosen)
var pipeline = [
	{$match: {_id: {$regex:siteChosen}}},
	{$project: {epoch5min:1,epoch:1,site:1,'subTypes.metrons':1}}, 
	{$group: {_id:'$epoch5min',site:{$last:"$site"},nuisance:{$push:"$subTypes.metrons"}}}
    ];
/*
can we use this for no matter the time period??	
	perhaps pick up standard deviation, and variance at same tim
average = function(a) {
  var r = {mean: 0, variance: 0, deviation: 0}, t = a.length;
  for(var m, s = 0, l = t; l--; s += a[l]);
  for(m = r.mean = s / t, l = t, s = 0; l--; s += Math.pow(a[l] - m, 2));
  return r.deviation = Math.sqrt(r.variance = s / t), r;
}
	*/
LiveData.aggregate(pipeline,
	Meteor.bindEnvironment(
		function(err,result){
			_.each(result,function(e){
				var subObj = {}
				subObj._id = e._id;
				subObj.site = e.site;
				metrons = e.nuisance; 
				for (i=0;i<metrons.length;i++){
					for ( var newkey in metrons[i]){
						if(metrons[i][newkey][1]['metric']=="Flag" && metrons[i][newkey][1]['val']==1){
							if(!subObj[newkey]){
								subObj[newkey]={'sum':metrons[i][newkey][0]['val'],'avg':metrons[i][newkey][0]['val'],'variance':0.0,'stdDev':0.0,'numValid':parseInt(1),'Flag':1};
							}else{
								subObj[newkey]['numValid'] += 1;
								subObj[newkey]['sum']+=metrons[i][newkey][0]['val'];  //holds sum until end
								subObj[newkey]['avg'] = subObj[newkey]['sum']/subObj[newkey]['numValid'];
								subObj[newkey]['variance'] += Math.pow((metrons[i][newkey][0]['val']- subObj[newkey]['avg']), 2);
							};
							subObj[newkey]['stdDev']=Math.sqrt(subObj[newkey]['variance']);
							if ((subObj[newkey]['numValid']/i)<.75){ 
								subObj[newkey]['Flag']=0;//should discuss how to use
							};
						};
 					};
				};
				//aggrDataUpsert(subObj); //have to wait to do validation in schema
			});
			
		},
		function(error) {
			Meteor._debug("error during aggregation: "+error);
		}
	)
);

var write10Sec = function(arr){
	for (var k=0;k<arr.length;k++){
		var singleObj = makeObj(arr[k]);
		var epoch = (((arr[k].TheTime - 25569) * 86400) + 6) * 3600;
		singleObj.epoch = epoch - (epoch%10000); //rounding down to 10 seconds
		singleObj.epoch5min = epoch - (epoch%300000);
		liveDataUpsert(singleObj);
	};
	//writeAggreg(singleObj.epoch);
};
var siteTableAlpha = function(alpha){
	//Meteor.bindEnvironment(function(alpha){
	//	var future = new Future();
	//	var testLoop = LiveData.findOne();
	//have it return from the sites db
	//var sites = 
	//return sites[alpha]
	return '481670571'
	//return future.wait(); 
	
	//return testLoop
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
				obj.site = siteTableAlpha(alphaSite) || '481670571';
			}
		};
	};
//	console.log(obj)
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

		// singleObj.epoch10sec = epoch - (epoch%10000);
		// obj.epoch5min = epoch - (epoch%300000);
		// obj.epoch1hr = epoch - (epoch%3600000);
		// obj.epoch1day = epoch - (epoch%86400000);

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

