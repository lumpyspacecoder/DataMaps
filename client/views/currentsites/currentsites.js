
var chart = null;

function reactiveArea() {
	  var site =  Session.get("selectedSite");
         var $report= $('#report');
        Meteor.subscribe('LiveData',site);
		var ozoneCursor = LiveFeedMonitors.find({siteRef:site}, {limit: 240});
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
    
  var chart = $('#container-chart-reactive').highcharts({
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
                            var selectedPoints = chart.getSelectedPoints();
                            selectedPoints.push(this);
                            $.each(selectedPoints, function(i, value) {
                    			selectedPointsStr += "<br>"+value.category;
		                    });
		                  
                            
                            $report.html(selectedPointsStr);
                            
                             // button handler
                            $('#button').click(function () {
                                var result = prompt("Enter the updated value for your selection:")
                                var num1 = parseInt(result);
                                  $.each(selectedPoints, function(i,value) {
                    			            this.update(num1);
                    			            
		                              });

                            });
                           $('#button2').click(function () {
                                  $.each(selectedPoints, function(i,value) {
                    			            this.remove();
                    			            
		                              });

                            });
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

