//This works, and should make it easier/faster but I wasn't using the functions
//Meteor.publish('livedata', function (site,timeChosen) {
//	var self = this; //because 'this' is different inside of added
//	var siteTimeChosen = new RegExp('^'+site+'_'+timeChosen);
//	var live2show = LiveData.find({_id: {$regex:siteTimeChosen}}).observeChanges({
//		added: function (id, fields) {
//			self.added("livedata", id, fields);
//			// self.added("dataInGraph",id, {
//			// x: new Date(fields.epoch*1000),
//			// y: fields.subTypes.metrons.O3[0].val
//			// 	});
//		//	console.log('added', id, fields)
//		//	console.log('LiveDatacount',LiveData.find().count())
//		},
//		changed: function(id, fields) {
//		  self.changed("livedata", id, fields);
//		  //can't quite tell if it automatically calls an update to the db
//		},
//		removed: function (id) {
//			console.log('removed')
//			console.log('LiveDatacount',LiveData.find().count())
//		  self.removed("livedata", id);
//		}
//	});
//	// self.added("currentsites", id, site);
//	// self.added("dataInGraph", id, {x: "testdata", Count: count});
//	self.ready();
////	console.log(this.connection) //curious about who is connecting? could log, I guess...
//	self.onStop(function () {
//		live2show.stop();
//	});
//	//return LiveData.find({_id: {$regex:siteTimeChosen}});
//});
Meteor.publish('livedata', function (site,timeChosen) {
    console.log(timeChosen);
	var siteTimeChosen = new RegExp('^'+site+'_'+timeChosen);
	return LiveData.find({_id: {$regex:siteTimeChosen}});
});
Meteor.publish('aggregatedata5min', function (site,timeChosen) {
	var siteTimeChosen = new RegExp('^'+timeChosen);
	return AggrData.find({});
});
Meteor.publish('tceqData', function () {
    var now = new Date();
    var adayAgo = now.getTime() / 1000 - 24 * 3600;

    return TCEQData.find({
        'epoch': {
            $gt: adayAgo
        }
    }, {
        sort: {
            'epoch': -1
        }
    });
});

Meteor.publish('siteData', function(latLng) {
    return Sites.find({'location': {
      $near:  {
        $geometry: {
          type: 'Point',
          coordinates: [latLng.lng, latLng.lat]
        }, 
        $maxDistance: 50000000
      }
    }
  });
});

Meteor.publish('userData', function () {
  if (this.userId) {
    return Meteor.users.find({_id: this.userId},
                             {fields: {'other': 1, 'things': 1}});
  } else {
    this.ready();
  }
});

Meteor.publish('favorites', function () {
    return Favorites.find({ owner: this.userId});
});