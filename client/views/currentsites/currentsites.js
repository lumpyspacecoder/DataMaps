
var chart = null;

function reactiveArea() {
	  var site =  Session.get("selectedSite");
        Meteor.subscribe('LiveData',site);
		var ozoneCursor = LiveFeedMonitors.find({limit: 240});
		var ozoneConDataforGraph = [];
		ozoneCursor.forEach(function(time) {
			ozoneConDataforGraph.push({ x: parseFloat(time.epoch),
									y: parseFloat(time.O3_conc),
									name: parseInt(time.epoch)/10});
		});
    
    chart = $('#container-chart-reactive').highcharts({
        
        
    chart: {
        type: 'area'
    },
    
    title: {
        text: 'Ozone Readings at' + site
    },
    
    credits: {
				href: "http://hnet.uh.edu",
				text: "UH-HNET"
    },
    
    xAxis: {
        allowDecimals: false,
        labels: {
            formatter: function () {
                return this.value; // clean, unformatted number for year
            }
        }
    },
        
    yAxis: {
        title: {
            text: 'O3 Reading'
        },
        labels: {
            formatter: function () {
                return this.value;
            }
        }
    },
    
    tooltip: {
        pointFormat: 'The {series.name} in this area was <b>{point.y:,.0f}</b><br/> at  {point.x}'
    },
    
    plotOptions: {
        area: {
            marker: {
                enabled: false,
                symbol: 'square',
                radius: 2,
                states: {
                    hover: {
                         enabled: true
                    }
                }
            }
        }
    },
        series: [
                {
                    
                    type: "scatter",
                    name: "Ozone Concentration",
                    data: ozoneConDataforGraph,
                    color: '#5CA221'
                }
            ]
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
