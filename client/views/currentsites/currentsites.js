

var selectedPoints = null;
var ozoneCursor = null;

function reactiveArea() {
	  var site =  Session.get("selectedSite");
         var $report= $('#report');
        Meteor.subscribe('LiveData',site);
    
		ozoneCursor = LiveFeedMonitors.find({siteRef:site}, {limit: 240});
		
		var ozoneConDataforGraph = [];
		ozoneCursor.forEach(function(time) {
			ozoneConDataforGraph.push({ x: new Date(time.epoch*1000),
									y: parseFloat(time.O3_conc), 	id: time._id});
		});
    
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
            zoomType: 'x'
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
//            labels: {
//                formatter: function () {
//                    return this.value;
//                }
//            }
        },
        
        series: [{
            name: "Ozone Concentration",
            data: ozoneConDataforGraph,
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
                        // update: function() {
                        //   if (!confirm('Do you want to set the point\'s value to ' + event.options + '?')) {
                        //         return false;
                        //   }
                        // }
                        
                    }
                }
            }
        }
    });
                         
   
	}
	


Template.currentsites.rendered = function () {
    
    Tracker.autorun(function () {
       reactiveArea();
    });
}

Template.currentsites.events({
  "click #button2": function(e){
    var points = selectedPoints;
			
			if (!points.length) alert ('No points selected. Click a point to select it. Control click to select multiple points');
			
			jQuery.each(points, function(i, point) {
				point.remove();
				LiveFeedMonitors.remove(point.id);
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
				  LiveFeedMonitors.update({_id: point.id}, {$set: {O3_conc : num1.toString()}});
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
