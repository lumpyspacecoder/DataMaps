Router.configure({
    layoutTemplate: 'Frame',
	loadingTemplate: 'loading',
    notFoundTemplate: 'pageNotFound',
	yieldTemplates: {
		nav: {to: 'nav'}
	    }
});
Router.route('/',{
	name: 'map',
	template:'map',
	action: function () {
		this.render();
	}
});
Router.route('/currentsites', {
	name:'currentsites',
	template:'currentsites',
    waitOn: function(){
        site = new ReactiveVar();
        time2find = new ReactiveVar();
        site.set('481670571'); //neet to check about subscribe needing string
        //time2find.set((new Date).getTime() - (epoch % 1));//passing epoch as most recent?
        var nowEpoch = '1446444488'; //testing
        var nowDown = nowEpoch - (nowEpoch % 1);
        var fiveDown = nowDown - (nowDown % 300);
        var hourDown = nowDown - (nowDown % 3600);
        //var dayDown = (nowDown - 86400) - ((nowDown - 86400) % 3600);
        time2find.set(hourDown);  //for testing 5196299900000 (uh)/5196294320000 /laptop
        timeChosen = time2find.get();
        timeChosenStr = timeChosen.toString().replace(/0+$/,'');
        Meteor.subscribe('livedata',site.get(),timeChosenStr);
		pollutCursor = LiveData.find({}, {limit: 400});
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
//					if (metric == 'Flag'){ //might have to do since they have flags at two levels
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
        selectData = new ReactiveVar();
		var data4graph = {};
		for (metron in dataIngraph){
			var data4select = [];
			data4graph[metron] = {};
			for (metric in dataIngraph[metron]){
				data4graph[metron].name = metron+'_'+metric;
				data4graph[metron].color = '#8CB921'; //could choose from an indexed list??
				data4graph[metron].type = 'line';
				data4graph[metron].data = dataIngraph[metron][metric];
				dataSets.set(metron+'_'+metric,data4graph[metron]);
				data4select.push(metric);
			}
			dataPacks.set(metron,data4select);
			selectData.set(data4select);
		};
        dataSeriesVar = new ReactiveVar();
		dataSeries = function(metron){
			return dataSets.get(metron)
		};
        var metronTest = 'O3_conc'
		dataSeriesVar.set(metronTest)//;chart.series[0].setData([dataSeriesVar]);
		
        //for five minute data
        Meteor.subscribe('aggregatedata5min',site.get(),timeChosenStr);
		pollutCursor5 = AggrData.find({}, {limit: 100});
		dataSets5 = new ReactiveDict();
		dataPacks5 = new ReactiveDict();
		dataIngraph5 = [];
        pollutCursor5.forEach(function(line){
            var obj5min = {};
			for (metr in line.O3){
                var val = line.O3[metr];
                if (metr=='Flag') {
                    if (val == 1){
                        var flagcolor = '#8CB921';
                    }else{
                        var flagcolor = '#b92156';
                    }
                };
                obj5min['y'] = line.O3.avg;
                //obj5min['stdDev'] = line.O3.stdDev;
                obj5min['x'] = parseInt(line._id)*1000;
                dataIngraph5.push(obj5min)
			};
            
		});
        selectData5 = new ReactiveVar();
        
		var data4graph5 = {};
        var O3data = {};
        O3data.name = 'O3_Five_Minute';
        O3data.type = 'scatter';
        O3data.data = dataIngraph5;
        dataPacks5.set('O3_five_minute',O3data);
                
		var $report= $('#report');
		Highcharts.setOptions({
		    global: {
		        useUTC: false
		    }
		});
		dataChart = $('#container-chart-reactive').highcharts({
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
					//click: function(){dataSeriesVar.set(dataSeries('O3'))},
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
				zoomType: 'xy' //disables pannning
		    },
		    title: {
		        text: 'Ozone Readings at ' + site.get()
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
			series: [dataPacks5.get('O3_five_minute'),
                     dataSets.get(dataSeriesVar.get())
                    ],
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
    },
	action: function () {
		if (this.ready()) {
 	      this.render();
        }else{
          this.render('loading')};
	}
});
Router.route('/history/',{
     name: 'history',
     template: 'history',
 	 action: function () {
 	    this.render();
 	}
});
Router.route('/admin/',{
     name: 'admin',
     template: 'admin',
 	 action: function () {
 	    this.render();
 	}
});
Router.route('/testing/',{
     name: 'testing',
     template: 'passData',
 	 action: function () {
 	    this.render();
 	}
});
Router.plugin('ensureSignedIn', {
  only: ['currentsites','history','admin']
});
//AccountsTemplates.configureRoute('changePwd');
AccountsTemplates.configureRoute('enrollAccount');
//AccountsTemplates.configureRoute('forgotPwd');
AccountsTemplates.configureRoute('resetPwd');
AccountsTemplates.configureRoute('signIn');
AccountsTemplates.configureRoute('signUp');
AccountsTemplates.configureRoute('verifyEmail');


