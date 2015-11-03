currentSites = new Meteor.Collection('currentsites');

var selectedPoints = null;
Template.currentsites.onRendered(function (){
	//make collections, not vars, and populate from subscription
	//if you start autorun here, it reloads on refresh, but does all the calculations 4-8 times
		//can we put five minute with box plots; other pollutants; delete, etc.
        site = new ReactiveVar();
        time2find = new ReactiveVar();
        site.set('481670571'); //neet to check about subscribe needing string
        time2find.set((new Date).getTime());//passing epoch as most recent?
        time2find.set('1446444488');  //for testing 5196299900000 (uh)/5196294320000 /laptop
        timeChosen = time2find.get() - (time2find.get()%1000000);
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
//					if (metric == 'Flag'){
//						dataIngraph[metron]['Flag'].push({ 
//							x: new Date(line.epoch*1000),
//							y: line.subTypes.metrons[metron][i].val
//						})
//					}else{
						if (!dataIngraph[metron][metric]){
							dataIngraph[metron][metric] = [];
						}else{
							dataIngraph[metron][metric].push({
								x: new Date(line.epoch*1000),
								y: line.subTypes.metrons[metron][i].val
							})
						}
				//	}
				}
			}
		});
//	Tracker.autorun(function () {
		selectData = new ReactiveVar();
		var data4graph = {};
		for (metron in dataIngraph){
			var data4select = [];
			data4graph[metron] = {};
			for (metric in dataIngraph[metron]){
				data4graph[metron].name = metron+'_'+metric;
				data4graph[metron].color = '#8CB921'; //could choose from an indexed list??
				data4graph[metron].type = 'bubble';
				data4graph[metron].data = dataIngraph[metron][metric];
				dataSets.set(metron+'_'+metric,data4graph[metron]);
				data4select.push(metric);
			}
			dataPacks.set(metron,data4select);
			selectData.set(data4select);
		};
    Tracker.autorun(function () {
            
		dataSeriesVar = new ReactiveVar();
		dataSeries = function(metron){
			return dataSets.get(metron)
		};
		dataSeriesVar.set([]);//dataSeries('O3_conc');chart.series[0].setData([dataSeriesVar]);
		//or//chart.series[0].setData([dataSeries(metron)]);
		
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
					//click: function(){alert('dafdfs')},
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
		     //     name: "Ozone Concentration",
		     //     data: [],//dataSets.get('O3')['03'].data,//data4graph,
		     //     color: '#8CB921'
		     // }],
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
	"change #packselect": function(event){
		dataSeriesVar.set(dataSeries(event.currentTarget.value)) //should be the metron_metric combo
		 //Template.instance().ctrlMenus.set('collectName', event.currentTarget.value); if works in onCreated
	},
	"change #keyselect": function(event){
		alert('dfa')
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
