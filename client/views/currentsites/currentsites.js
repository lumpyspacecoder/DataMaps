

Template.currentsites.helpers({
    theSiteRef: function() {
//        return Session.get("selectedSite");
//        Session.set("selectedSite","UHCLH_DAQData");

        return Session.get("selectedSite");
    },
   
    
	chartObj : function() {
	  var site =  Session.get("selectedSite");
	  console.log(site);
    Meteor.subscribe('LiveData',site);
		var ozoneCursor = LiveFeedMonitors.find({limit: 240});
		var ozoneConDataforGraph = [];
		ozoneCursor.forEach(function(time) {
			ozoneConDataforGraph.push({ x: parseFloat(time.epoch),
									y: parseFloat(time.O3_conc),
									name: parseInt(time.epoch)/10});
		});

		
		return {
			title: {
				text: 'Ozone Concentration and Temperature for the last 24h'
			},
			credits: {
				href: "http://hnet.uh.edu",
				text: "UH-HNET"
			},
			legend: {
				layout: 'vertical',
				align: "left",
                verticalAlign: "top",
                floating: true,
                x: 100,
                y: 50,
                borderWidth: 1
			},
            plotOptions: {
                turboThreshold : 10000
            },
			series: [
                {
                    
                    type: "scatter",
                    name: "Ozone Concentration",
                    data: ozoneConDataforGraph,
                    color: '#5CA221'
                }
            ]
		}
	}
});

