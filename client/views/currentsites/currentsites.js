currentSites = new Meteor.Collection('currentsites');

var selectedPoints = null;
Template.currentsites.onRendered(function (){
	//make collections, not vars, and populate from subscription
	Tracker.autorun(function () {
		//can we put five minute with box plots; other pollutants; delete, etc.
        site = new ReactiveVar();
        time2find = new ReactiveVar();
        site.set('481670571'); //neet to check about subscribe needing string
        time2find.set((new Date).getTime());//passing epoch as most recent?
        time2find.set('5196294320000');  //for testing
        timeChosen = time2find.get() - (time2find.get()%360000000);
        timeChosenStr = timeChosen.toString().replace(/0+$/,'');
        Meteor.subscribe('livedata',site.get(),timeChosenStr);
		pollutCursor = LiveData.find({}, {limit: 40});
		dataSets = new ReactiveDict();
		dataPacks = new ReactiveDict();
		dataIngraph = {};
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
		});
		var data4graph = {};
		for (metron in dataIngraph){
			data4graph[metron] = {};
			for (metric in dataIngraph[metron]){
				data4graph[metron].name = metron+'_'+metric;
				data4graph[metron].color = '#8CB921'; //could choose from an indexed list??
				data4graph[metron].type = 'bubble';
				data4graph[metron].data = dataIngraph[metron][metric]
				//dataSets.set(metron+'_'+metric,data4graph[metron]) //this gives only the flag
			}
			dataSets.set(metron,data4graph[metron]) //this gives only the conc in readout
		};
		
		dataSeriesVar = new ReactiveVar();
		dataSeries = function(){
			datname = 'really ugly';
			datdata = '';
			datcolor = '';
			dattype = 'bubble';
			dataSets.set('Temp','ugly');//as name implies, this drives me crazy
			for (key in dataSets.keys){
				if(dataSets.get(key)!='ugly'){
					// console.log('key',key)
// 					console.log(dataSets.get(key).name)
					if (dataSets.get(key).name){datname = dataSets.get(key).name};
					if (dataSets.get(key).data){datdata = dataSets.get(key).data};
					if (dataSets.get(key).color){datcolor = dataSets.get(key).color};
					if (dataSets.get(key).type){dattype = dataSets.get(key).type};
				// if (dataSets.get(key)[key].name){datname = dataSets.get(key)[key].name};
				// if (dataSets.get(key)[key].data){datdata = dataSets.get(key)[key].data};
				// if (dataSets.get(key)[key].color){datcolor = dataSets.get(key)[key].color};
				// if (dataSets.get(key)[key].type){dattype = dataSets.get(key)[key].type};
				}
				//key is the metron, and should be used for higher on select
 				return {name: datname,
						data: datdata,
						color: datcolor,
						type: dattype
				};
			}
		};
		dataSeriesVar = dataSeries();
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
			series: [dataSeriesVar],
		     // series: [{
// 		         name: "Ozone Concentration",
// 		         data: [],//dataSets.get('O3')['03'].data,//data4graph,
// 		         color: '#8CB921'
// 		     }],
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
