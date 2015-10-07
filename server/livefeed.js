//required packages
var chokidar = Meteor.npmRequire('chokidar');
var csvmodule = Meteor.npmRequire('csv');
var fs = Meteor.npmRequire('fs');
var Future = Meteor.npmRequire('fibers/future');

var logger = Meteor.npmRequire('winston'); // this retrieves default logger which was configured in log.js

//insert live data into DB
var liveDataInsert = Meteor.bindEnvironment(function (obj) {
    var future = new Future();
    LiveData.insert(obj);
    return future.wait();
});
var liveDataUpdate = Meteor.bindEnvironment(function (obj) {
    var future = new Future();
    LiveData.update(obj); //needs the right key???
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
var makeObj = function(arr){
	var obj = {};
	var sensor = [];
	var tmpVals = [];
	var tmpFlags = [];
	var tmpArr = [];
	for (var i=0;i<arr.length;i++){
		var line = arr[i];
		for (var n in line){
			var strng = 'HNET_CCH_HMP60_Temp';
			console.log(typeof(strng))
			console.log(strng.split('_')[0])
			console.log(line[n])
			console.log(line[n].length)
			if(line[n].length>0){
				var fieldsArr = line[n].split('_');
				if(fieldsArr){
					console.log('fieldsArr')
					console.log(fieldsArr)
				};
			}; 
			/*
			var fields = [n,fieldsArr[n]]
			if (fields[1] == "cor" || fields[1] == "conc"){ 
				tmpVals.push(fields[0],line[i][1]);
			}else if (fields[fields.length-1] == "Flag"){ 
				tmpFlags.push(field[0],line[i][1]);
			}else {
				tmpArr.push(fields[1],line[i][1]);
			};
			var num = 0;
			var tot = 0;
			for (m=0;m<tmpVals.length;m++){
				//for Time, keep last; 
				if (tmpVals[m][0] == tmpFlags[m][0] && tmpFlags[m][1]=='K'){
					num += 1;
					tot += tmpVals[m][1];
				};
				if (num>20){
					sensor.push[tmpVals[m][0],tot/num];
				};
			};
			*/
		};
		console.log(die)
	}
	};	
		//put everything in a new line, with flags checked, and values assigned, then calculate
		// if (fieldname[fieldname.length-1] == "value"){ //five minute avg. on wind dir is special
// 			tmpLine.push(fieldname[fieldname.length-2],arr[i][1]) //put all in, sort and give avgs;
// 			//if fieldname[fieldname.length-2] //create a tmpArr per sensor, with sensor then
// 		}else{
//
// 		}
// 			obj.sensor.name = fieldname[fieldname.length-2]; //this is the pollutant or wind type
// 			obj.sensor.value = arr[i][1]; //this is the value before avg
// 			//write value
// 		}
		//split string - if last = "value"
		// then 
// 	}
// }
var calculate5minData = function(arr){ //and less than 20 don't calculate
	var obj = makeObj(arr);
	console.log(obj);
	console.log(die);
	aggrDataUpsert(obj);
};
//starting watcher for live incoming data --/Users/dprice3/testHNET/
//var liveWatcher = chokidar.watch('/hnet/incoming/2015', {
var liveWatcher = chokidar.watch('/Users/dprice3/testHNET', {
    ignored: /[\/\\]\./,
    ignoreInitial: true,
    usePolling: true,
    persistent: true
});

liveWatcher
    .on('add', function (path) {
        logger.info('File ', path, ' has been added.');
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
                _.each(siteInfo, function (line) {
                    var epoch = parseInt((line.TheTime - 25569) * 86400) + 6 * 3600;
                    line.epoch = epoch;
                    line.siteRef = parentDir;
                    liveDataInsert(line);
                });
            });
        });
    })
	.on('change', function (path) {
	        logger.info('File', path, 'has been changed');
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
					var epochCnt = null;
	                _.each(siteInfo, function (line) {
	                    var epoch = parseInt((line.TheTime - 25569) * 86400) + 6 * 3600;
	                    line.epoch = epoch;
						if (!epochCnt){epochCnt=epoch}
	                    line.siteRef = parentDir;
	                    	//if (epoch % 300 == 0 && tempArray.length>0) {
						if ((epoch - epochCnt)>490){
	                        calculate5minData(tempArray);
	                        tempArray = [];
							epochCnt = epoch;
						};
	                    tempArray.push(line);
	                    //liveDataUpdate(line); //not sure what's the logic here
	                });
	            });
	        });
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

