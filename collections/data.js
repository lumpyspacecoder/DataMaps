Sites = new Mongo.Collection('sites');
Favorites = new Mongo.Collection('favorites');
LiveData = new Mongo.Collection('livedata');
AggrData = new Mongo.Collection('aggregatedata5min');
TCEQData = new Mongo.Collection('tceqdata');
//console.log(TCEQData.simpleSchema()); //to read if there is any schema; I think you might have to reload
Schemas = {};

Schemas.Sites = new SimpleSchema({
  name: {
    type: String,
    max: 60
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

Schemas.AggrData = new SimpleSchema({
  siteId: {
    type: String
  },
  dateGMT: {
    type: Date
  },
  timeGMT: {
    type: String
  },
  BIT: {
  	  type: Boolean
  },
  o3_channel: {
  	  type: Number
  },
  o3_flag:{
  	  type: String
  },
  o3_value: {
  	  type: Number
  },
  QCref_channel: {
  	  type: Number
  },
  QCref_flag: {
  	  type: String
  },
  QCref_value: {
  	  type: Number
  },
  QCStatus_channel: {
  	  type: Number
  },
  QCStatus_flag: {
  	  type: String
  },
  QCStatus_value: {
  	  type: Number
  }
});

AggrData.attachSchema(Schemas.AggrData)
