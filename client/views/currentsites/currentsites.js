
currentSites = new Meteor.Collection('currentsites');

var selectedPoints = null;
var ozoneCursor = null;
	

Template.currentsites.onRendered(function (){
//Template.currentsites.onCreated(function (){
	//make collections, not vars, and populate from subscription
	site = new ReactiveVar();
	time2find = new ReactiveVar();
	site.set('481670571'); //neet to check about subscribe needing string
	time2find.set((new Date).getTime());//passing epoch as most recent?
	time2find.set('5196299900000');  //for testing
	var timeChosen = time2find.get() - (time2find.get()%36000000);
	var timeChosenStr = timeChosen.toString().replace(/0+$/,'');
 
 	Tracker.autorun(function () {
		
		Meteor.subscribe('livedata',site.get(),timeChosenStr);
		
		//Meteor.subscribe('livedata','481670571','5196276');
		pollutCursor = LiveData.find({}, {limit: 240});
		dataSets = new ReactiveDict();
		dataPacks = new ReactiveDict();
		dataIngraph = {};
	//data4graph.push({x:123,y:432});
		pollutCursor.forEach(function(line){
			for (metron in line.subTypes.metrons){
				if (!dataIngraph[metron]) { //metron is name of measuring quantity
					dataIngraph[metron] = {};
					dataIngraph[metron]['Flag'] = [];
				};
				for (i=0;i<line.subTypes.metrons[metron].length;i++){
					var metric = line.subTypes.metrons[metron][i].metric
					if (metric == 'Flag'){
						dataIngraph[metron]['Flag'].push({ 
							x: new Date(line.epoch*1000),
							y: line.subTypes.metrons[metron][i].val
						})
					}else{
						if (!dataIngraph[metron][metric]){
							dataIngraph[metron][metric] = [];
						}else{
							dataIngraph[metron][metric].push({
								x: new Date(line.epoch*1000),
								y: line.subTypes.metrons[metron][i].val
							})
						}
					}
				}
			}
			
			//console.log('dataIngraph',dataIngraph)
			// dataIngraph.push({ x: new Date(line.epoch*1000),
			// 				  y: line.subTypes.metrons.O3[0].val
			// });
		});
		var data4graph = {};
		for (metron in dataIngraph){
			data4graph[metron] = {};
			for (metric in dataIngraph[metron]){
				data4graph[metron].name = metric;
				data4graph[metron].color = '#8CB921'; //could choose from an indexed list??
				data4graph[metron].type = 'bubble';
				data4graph[metron].data = dataIngraph[metron][metric]
				//each needs name, color, type, and data
				//data4graph[metric] = dataIngraph[metron][metric]
			}
			//console.log('data4graph',data4graph)
			dataSets.set(metron,data4graph)
			//console.log(dataSets.get(metron))
			//console.log(metron,dataIngraph[metron]) 
			
			//console.log(metron,metric,dataIngraph[metron][metric])
		};
		// data4graph.data = //dataIngraph; //could make the others into objects, too -http://api.highcharts.com/highcharts#series<areaspline>
		// data4graph.name = 'Overall Graph';
		// data4graph.color = '#8CB921';
		// data4graph.type = 'bubble';
		// dataSets.set('data4graph',data4graph) //title .toString, then the graphdata stuff???
		// flag4graph = {};
		// flag4graph.data = flagIngraph;
		// flag4graph.color = 'pink'; //make opaque?
		// flag4graph.type = 'bar';
		var dataSeries = function(){
			//console.log(dataSets.keys)
			for (key in dataSets.keys){
//				console.log('data',dataSets.get(key)[key].data)
				console.log('key',key) //key is the name of the metric
				console.log(dataSets.get(key)[key].name)
				console.log(dataSets.get('O3')['O3'])
				//key is the metron, and should be used for higher on select
 				return {name: dataSets.get(key)[key].name,
						data: dataSets.get(key)[key].data, //dataSets.keys[key],
						color: dataSets.get(key)[key].color,
						type: dataSets.get(key)[key].type
				}
			}
		}
		
		console.log('dataSeries',dataSeries())
		//can we put five minute with box plots; other pollutants; delete, etc.
		var $report= $('#report');
		Highcharts.setOptions({
		    global: {
		        useUTC: false
		    }
		});

        $('.button')
  .popup({
    popup : $('.flowing.popup.top.left.transition.hidden'),
    on    : 'click'
  });

  $('.ui.checkbox').checkbox({
    toggle : 'click'
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
});//end autorun
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
=======
currentSites = new Meteor.Collection('currentsites');

var selectedPoints = null;
Template.currentsites.onCreated(function (){

});
Template.currentsites.onRendered(function (){
//    Tracker.autorun(function () {
            
		
//});//end autorun
	//var data4graphColl = new Meteor.Collection('dataInGraph');
}); //end of onRendered
>>>>>>> DrDanPrice/master

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

	//switch map to sites twice to show??
	selectKeys: function(){
		//console.log(selectData.get())
		return selectData.get()
	},
	selectPacks: function(){
		return dataPacks.get('O3')//thePack//.keys
	}
	
});
Template.currentsites.events({
    "change #timeselect": function(){
        dataSeriesVar.set(dataSeries('O3_conc'));
                        },
    "click #packselect": function(){
                        },
	"change #packselect": function(event){
		dataSeriesVar.set('O3_'+event.currentTarget.value) //should be the metron_metric combo
		 //Template.instance().ctrlMenus.set('collectName', event.currentTarget.value); if works in onCreated
	},
	"change #keyselect": function(event){
		dataSeriesVar.set(dataSeries(event.currentTarget.value))
		//dataSeriesVar.set(dataSeries(event.currentTarget.value)) //should be the metron_metric combo
		 //Template.instance().ctrlMenus.set('collectName', event.currentTarget.value); if works in onCreated
	},
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

