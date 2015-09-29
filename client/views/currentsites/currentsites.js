
var chart = null;

function reactiveArea() {
	  var site =  Session.get("selectedSite");
        Meteor.subscribe('LiveData',site);
		var ozoneCursor = LiveFeedMonitors.find({siteRef:site}, {limit: 240}, {sort: {epoch: 1} });
		var ozoneConDataforGraph = [];
		ozoneCursor.forEach(function(time) {
			ozoneConDataforGraph.push({ x: new Date(time.epoch*1000),
									y: parseFloat(time.O3_conc)});
		});
    
    Highcharts.setOptions({
        global: {
            useUTC: false
        }
    });
    
    chart = $('#container-chart-reactive').highcharts('StockChart', {
        
          rangeSelector : {
                selected : 2,
              inputEditDateFormat: "%Y-%m-%d-%M-%s",
              inputDateFormat: "%Y-%m-%d-%M-%s"
            },
        title: {
            text: 'Ozone Readings at ' + site
        },
        
        credits: {
            text: "UH-HNET",
            href: "http://hnet.uh.edu"
            
        },
        xAxis: {
            type: 'datetime',
            ordinal: false
        },
        
        yAxis: {
            title: {
                text: 'Ozone Concentration'
            },
            labels: {
                formatter: function () {
                    return this.value;
                }
            }
        },
        
        series: [{
            name: "Ozone Concentration",
            data: ozoneConDataforGraph,
            color: '#8CB921',
            lineWidth : 0,
            marker : {
                enabled : true,
                radius : 2
            },
            tooltip: {
                valueDecimals: 2
            }
        }]
    });

	}

Template.currentsites.rendered = function () {
    
    Tracker.autorun(function () {
       reactiveArea();
    });
}

Template.currentsites.events({
    // depending on which site the user clicks to learn more about, session variable will be changed and passed to currentsites.js
    'change #siteselect': function(e) {
        var newValue = $(e.target).val();
        Session.set("selectedSite", newValue);
    }
});

Template.currentsites.onCreated( function() {
    // creation of reactive var which will be a mongo query for the menu of live data monitors
    var self = this;
    self.autorun(function () {
    self.subscribe('LiveMenu');
  });
});

Template.currentsites.helpers({
      currentSites: function () {
        var data = LiveFeedMonitors.find().fetch();
         var distinctData = _.uniq(data, false, function(d) {return d.siteRef});
         return _.pluck(distinctData, "siteRef");
}
});
