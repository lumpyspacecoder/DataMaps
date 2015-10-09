//place in /server folder; watch the right folder

//issues - right now it reloads everything on restart and inserts the new ones below
   

    Meteor.publish("LiveMenu", function () {
        return LiveFeedMonitors.find({});
    });

    Meteor.publish("LiveData", function (site) {
        return LiveFeedMonitors.find({siteRef: site}, {limit: 240}, {sort: {'epoch': -1} });
    });

//console.log(LiveFeedMonitors.find({site: '2015'}).count())
//	//the npmRequire may need to be Npm.require, depending on how the node functions are called
//	var chokidar = Meteor.npmRequire('chokidar');
//	var fs = Meteor.npmRequire('fs')//.readFile;//Sync;
//	var csvmodule = Meteor.npmRequire('csv');
//	var Future = Meteor.npmRequire('fibers/future')
//	var watcher = chokidar.watch('Users/nbhossai/2015', {
//      ignoreInitial: true, //false if you want to load existing folders in path
//	  ignored: /[\/\\]\./,
//      usePolling: true,
//	  persistent: false
//	}); //dasfds
//	//could have the grandparentDir be the collection name and have it created if not already
//	var data2insert = Meteor.bindEnvironment(function(obj){
//		var future = new Future;
//		LiveFeedMonitors.insert(obj);
//		return future.wait();
//    });
//	var log = console.log.bind(console);
//	log(LiveFeedMonitors.find().count())
//    //perhaps make ignored include everything? move file after processing??
//	watcher //everything in the 'add' will be done when folder first added
//	  .on('add', function(path) {
//          log('added file')
//		var pathArray = path.split('/');
//		var parentDir = pathArray[pathArray.length-2];
//        var file2read = fs.readFile(path, "utf-8", function(err,output){
//		var lineParser = new csvmodule.parse(output,{delimiter:',', rowDelimiter:'\r', auto_parse: true, columns: true},function(err,siteInfo){
//			  if(err){log(err)};
//              _.each(siteInfo, function(line){
//                  var epoch = parseInt((line.TheTime - 25569) * 86400) + 6*3600;
//                  line.epoch = epoch;
//                  line.site = parentDir;
//                  data2insert( line );
//                  });
//              });
//            });
//	  })
//    .on('raw', function(event, path, details) { log('Raw event info:', event, path, details); })
//    .on('error', function(error) { log('Error happened', error); })
//    .on('ready', function() { log('Initial scan complete. Ready for changes.'); })
//    //.on('addDir', function(path) { log('Directory', path, 'has been added'); }) for new Collections?
//
//
//