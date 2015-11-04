

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
    
    $('.ui.button')
  .popup({
    popup : $('.flowing.popup.top.left.transition.hidden'),
    on    : 'click'
  });

  $('.ui.checkbox').checkbox({
    toggle : 'click'
});
  $('.ui.fluid.search.selection.dropdown').dropdown('show');
  
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
			
	var update = document.getElementById('ozone-val').value;
      var num1 = parseFloat(update);
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
    },



});
