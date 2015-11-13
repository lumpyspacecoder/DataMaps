
var chart = null;
var chart2 = null;
var selectedPoints = null;
var ozoneCursor = null;

function reactiveArea() {
	  var site =  Session.get("selectedSite");
         var $report= $('#report');
        Meteor.subscribe('LiveData',"481670571");
    
		ozoneCursor = LiveFeedMonitors.find({site:"481670571"}, {limit: 240});
		
		var ozoneConDataforGraph = [];
		ozoneCursor.forEach(function(time) {
			ozoneConDataforGraph.push({ x: new Date(time.epoch*1000), y: parseFloat(time.O3.avg), 	id: time._id, flag: time.O3.Flag});
		});

        var oflagDataforGraph = [];
        ozoneCursor.forEach(function(time) {
            oflagDataforGraph.push({ x: new Date(time.epoch*1000), y: time.O3.Flag,     id: time._id});
        });

        var windDataforGraph = [];
        ozoneCursor.forEach(function(time) {
            windDataforGraph.push({ x: new Date(time.epoch*1000), y: parseFloat(time.RMY_Wind.avg),   id: time._id, flag: time.RMY_Wind.Flag});
        });

        var wflagDataforGraph = [];
        ozoneCursor.forEach(function(time) {
            wflagDataforGraph.push({ x: new Date(time.epoch*1000), y: time.RMY_Wind.Flag,     id: time._id});
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
  
  chart = $('#container-chart-reactive').highcharts({
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
            },
            redraw: function(event){
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
        
        series: [
        {
            name: "Ozone Concentration",
            data: ozoneConDataforGraph,
            color: '#8CB921'
        },
        {
            type: "line",
            name: "OzoneFlags",
            data: oflagDataforGraph,
            color: '#FF0000',
            allowPointSelect: false
        },
        ],
        plotOptions: {
            series: {
                marker: {
                    enabled: true
                },
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
                            
                            
                        },

                        update: function() {
                       
                            
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

    chart2 = $('#container-chart-reactive2').highcharts({
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
            },
            redraw: function(event){
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
                text: 'RMY Wind Values'
            }
//            labels: {
//                formatter: function () {
//                    return this.value;
//                }
//            }
        },
        
        series: [
        
        {
            type: "scatter",
            name: "RMY-Wind Concentration",
            data: windDataforGraph,
            color: '#8CB921'
        },
        {
            type: "scatter",
            name: "RMY-Wind Flags",
            data: wflagDataforGraph,
            color: '#FF0000',
            allowPointSelect: false
        },
        ],
        plotOptions: {
            series: {
                marker: {
                    enabled: true
                },
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
                            
                            
                        },

                        update: function() {
                       
                            
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

  "click #button1": function(e){
    var points = selectedPoints;
			
	// var update = document.getElementById('ozone-val').value;
 //      var num1 = parseFloat(update);
      jQuery.each(points, function(i, point) {
      //     point.update(num1);
				  // LiveFeedMonitors.update({_id: point.id}, {$set: {O3_conc : num1.toString()}});
				  // console.log('updated!');
        
            LiveFeedMonitors.update({_id: point.id}, {$set: {"O3.Flag": 0}});
       

        
                 
       });
			
			
  },

  "click #button2": function(e){
    var points = selectedPoints;
            
    // var update = document.getElementById('ozone-val').value;
 //      var num1 = parseFloat(update);
      jQuery.each(points, function(i, point) {
      //     point.update(num1);
                  // LiveFeedMonitors.update({_id: point.id}, {$set: {O3_conc : num1.toString()}});
                  // console.log('updated!');
        
            LiveFeedMonitors.update({_id: point.id}, {$set: {"RMY_Wind.Flag": 0}});
       

        
                 
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
