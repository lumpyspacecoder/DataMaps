Monitors = new Mongo.Collection('monitors');
Favorites = new Mongo.Collection('favorites');
LiveData = new Mongo.Collection('livedata');
AggrData = new Mongo.Collection('aggregatedata5min');
TCEQData = new Mongo.Collection('tceqdata');

Schemas = {};

Schemas.Monitors = new SimpleSchema({

    AQSID: {
        type: String,
        max: 15
    },
    updatesParameters: {
        type: [Object],
        optional: true,
        autoValue: function () {
            var parameter = this.field("parameter name");
            if (parameter.isSet) {
                if (this.isInsert) {
                    return [{
                        parameter: parameter.value
            }];
                } else {
                    return {
                        $push: {
                            parameter: parameter.value
                        }
                    };
                }
            } else {
                this.unset();
            }
        }
    },
    siteCode: {
        type: String,
        max: 10
    },
    siteName: {
        type: String,
        max: 50
    },
    active: {
        type: String,
        max: 10
    },
    agencyId: {
        type: String,
        max: 5
    },
    agencyName: {
        type: String,
        max: 200
    },
    EPARegion: {
        type: String,
        max: 50
    },
//    loc: {
//        type: "Point",
//        coordinates: [MonitorData[monitor]['longitude'] / 1.0 || -5.3698,
//                MonitorData[monitor]['latitude'] / 1.0] || 29.7604
//    },
//    elevation: {
//        type: double
//    },
//    GMToffset: {
//        type: int
//    },
//    countryCode: {
//        type: String,
//        max: 10
//    },
//    CMSACode: {
//        type: String,
//        max: 10
//    },
//    CMSAName: {
//        type: String,
//        max: 10
//    },
//    MSACode: {
//        type: String,
//        max: 10
//    },
//    MSAName: {
//        type: String,
//        max: 10
//    },
//    stateCode: {
//        type: String,
//        max: 10
//    },
//    stateName: {
//        type: String,
//        max: 10
//    },
//    countyCode: {
//        type: String,
//        max: 10
//    },
//    countyName: {
//        type: String,
//        max: 10
//    },
//    cityCode: {
//        type: String,
//        max: 10
//    },
//    cityName: {
//        type: String,
//        max: 10
//    }
});

Monitors.attachSchema(Schemas.Monitors);