currentSites = new Meteor.Collection('currentsites');

var selectedPoints = null;
var ozoneCursor = null;


Template.currentsites.onRendered(function (){
//Template.currentsites.onCreated(function (){
	//make collections, not vars, and populate from subscription
 //	Tracker.autorun(function () {
		//can we put five minute with box plots; other pollutants; delete, etc.
		var $report= $('#report');
		Highcharts.setOptions({
		    global: {
		        useUTC: false
		    }
		});
		var chart = $('#container-chart-reactive').highcharts({
		    exporting: {
		        chartOptions: { // specific options for the exported image
		            plotOptions: {
		                series: {
		                    dataLabels: {
		                        enabled: true
		                    }
		                }
		            }
		        },
		        scale: 3,
		        fallbackToExportServer: false
		    },
		    chart:{
				events: {
					//click: function(){testIt()},
					selection: function(event) {
						for (var i = 0; i < this.series[0].data.length; i++) {
							var point = this.series[0].data[i];
							if (point.x > event.xAxis[0].min &&
								point.x < event.xAxis[0].max &&
								point.y > event.yAxis[0].min &&
								point.y < event.yAxis[0].max) {
									point.select(true, true);
								}
                			
						}
						return false;
					}
				},
				zoomType: 'xy'
		    },
		    title: {
		        text: 'Ozone Readings at ' + site
		    },
		    credits: {
		        text: "UH-HNET",
		        href: "http://hnet.uh.edu"
		
		    },
		    xAxis: {
		        type: 'datetime'
		    },
		    yAxis: {
		        title: {
		            text: 'Ozone Concentration'
		        }
		    },
//			series: [dataSeries()],
		     series: [{
		         name: "Ozone Concentration",
		         data: [],//dataSets.get('O3')['03'].data,//data4graph,
		         color: '#8CB921'
		     }],
		    plotOptions: {
		        series: {
		            allowPointSelect: true,
		            point: {
		                events: {
		                    select: function() {
		                        var selectedPointsStr = "";
		                        // when is the chart object updated? after this function finshes?
		                        var chart = this.series.chart;
		                        selectedPoints = chart.getSelectedPoints();
		                        selectedPoints.push(this);
		                        $.each(selectedPoints, function(i, value) {
		                			selectedPointsStr += "<br>"+value.category;
				                    });
		                        $report.html(selectedPointsStr);
		                    }
		                }
		            }
		        }
		    }
	}); //end of chart
//});//end autorun
	//var data4graphColl = new Meteor.Collection('dataInGraph');
}); //end of onRendered
/*
			events:{
				selection: function(event) {
					event.preventDefault();
					// log the min and max of the primary, datetime x-axis
					console.log(
						Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', event.xAxis[0].min),
						Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', event.xAxis[0].max)
					);
					// log the min and max of the y axis
					console.log(event.yAxis[0].min, event.yAxis[0].max);
				}
			},
function selectPointsByDrag(e) {

    // Select points
    Highcharts.each(this.series, function (series) {
        Highcharts.each(series.points, function (point) {
            if (point.x >= e.xAxis[0].min && point.x <= e.xAxis[0].max &&
                    point.y >= e.yAxis[0].min && point.y <= e.yAxis[0].max) {
                point.select(true, true);
            }
        });
    });

    // Fire a custom event
    HighchartsAdapter.fireEvent(this, 'selectedpoints', { points: this.getSelectedPoints() });

    return false; // Don't zoom
}

function selectedPoints(e) {
    // Show a label
    toast(this, '<b>' + e.points.length + ' points selected.</b>' +
        '<br>Click on empty space to deselect.');
}

function unselectByClick() {
    var points = this.getSelectedPoints();
    if (points.length > 0) {
        Highcharts.each(points, function (point) {
            point.select(false);
        });
    }
}

$('#container').highcharts({

    title: {
        text: 'Select points by click-drag'
    },

    chart: {
        type: 'scatter',
        events: {
            selection: selectPointsByDrag,
            selectedpoints: selectedPoints,
            click: unselectByClick
        },
        zoomType: 'xy'
    },
	*/
Template.currentsites.helpers({
});
Template.currentsites.events({
  "click #button2": function(e){
    var points = selectedPoints;
			
			if (!points.length) alert ('No points selected. Click a point to select it. Control click to select multiple points');
			
			jQuery.each(points, function(i, point) {
				point.remove();
				LiveData.remove(point.id);
				console.log('removed!');
				
			});
			
  },
  "click #button": function(e){
    var points = selectedPoints;
			
			if (!points.length) alert ('No points selected. Click a point to select it. Control click to select multiple points');
			var result = prompt("Enter the updated value for your selection:")
      var num1 = parseFloat(result);
      jQuery.each(points, function(i, point) {
          point.update(num1);
				  LiveData.update({_id: point.id}, {$set: {O3_conc : num1.toString()}});
				  console.log('updated!');
            
       });
			
			
  },
  "click #export": function(e){
        var chart = $('#container-chart-reactive').highcharts();
        chart.exportChart({
            type: 'application/pdf',
            filename: 'my-pdf'
        });
    }

});

Template.menu.events({
    // depending on which site the user clicks to learn more about, session variable will be changed and passed to currentsites.js
    'change #siteselect': function(e) {
        var newValue = $(e.target).val();
        Session.set("selectedSite", newValue);
    }
});

Template.menu.onCreated( function() {
    // creation of reactive var which will be a mongo query for the menu of live data monitors
    var self = this;
    self.autorun(function () {
    self.subscribe('LiveMenu');
  });
});

Template.menu.helpers({
      currentSites: function () {
        var data = LiveData.find().fetch();
         var distinctData = _.uniq(data, false, function(d) {return d.siteRef});
         return _.pluck(distinctData, "siteRef");
}
});
