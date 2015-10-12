Sites = new Mongo.Collection('sites');
Favorites = new Mongo.Collection('favorites');
LiveData = new Mongo.Collection('livedata');
AggrData = new Mongo.Collection('aggregatedata5min');
TCEQData = new Mongo.Collection('tceqdata');
Schemas = {};
//for AQSID, remove the _ as part of the validation?? make ID combination of others??
Schemas.Sites = new SimpleSchema({
	_id: {
		type: String,
		max: 60
	},
	AQSID: {
		type: String,
		max: 20
	},
	CAMSID: {
		type: String,
		max: 6
	},
	AlphaID: {
		type: String,
		max: 20
	},
	description: {
	  type: String,
	  autoform: {
	    rows: 5
	  }
	},
	createdAt: {
	  type: Date,
	  label: 'Date',
	  autoValue: function () {
	    if (this.isInsert) {
	      return new Date();
	    }
	  }
	},
	createdBy: {
	  type: String,
	  regEx: SimpleSchema.RegEx.Id,
	  autoValue: function () {
	    if (this.isInsert) {
	      return Meteor.userId();
	    }
	  },
	autoform: {
	  options: function () {
	    _.map(Meteor.users.find().fetch(), function (user) {
	      return {
	        label: user.emails[0].address,
	        value: user._id
	      };
	    });
	  }
	}
  }
});

Sites.attachSchema(Schemas.Sites)

Schemas.SensorRdgs = new SimpleSchema({
	sensor: {
	  type: Array,
	  optional: true
	},
	'sensor.$':{
	  type: Object,
	  optional: true
	},
	'sensor.$.name': {
	  type: String,
	  optional: true
  	},
	'sensor.$.rdgType': {
  	  type: String,
	  optional: true
  	},
  	'sensor.$.value': {
  	  type: Number,
	  optional: true
  	}
});
Schemas.AggrData = new SimpleSchema({
  siteId: {
    type: String
  },
  dateGMT: {
	  type: Date,
	  optional: true
  },
  timeGMT: {
	  type: String,
	  optional: true
  },
  period: {
	  type: String,
	  optional: true
  },
  BIT: {
  	  type: Boolean,
	  optional: true
  },
  sensors: {
	  type: Schemas.SensorRdgs,
	  optional: true
  }
});

AggrData.attachSchema(Schemas.AggrData)
