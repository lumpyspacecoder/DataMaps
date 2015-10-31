Router.configure({
    layoutTemplate: 'Frame',
	loadingTemplate: 'loading',
    notFoundTemplate: 'pageNotFound',
	yieldTemplates: {
		nav: {to: 'nav'}
	    }
});
Router.map(function() {
    this.route('map', {
        path: '/',
		template:'map', //rest of stuff from below in mainMapOld?
		action: function () {
			this.render();
		}
    });
    this.route('currentsites', {
    	path:'/currentsites',
		template:'currentsites',
		data: function () {
			data4graph = [];
			var site =  Session.get("selectedSite") || '481670571'; //neet to check about subscribe needing string
			var time2find = Session.get("time2find") || (new Date).getTime();//passing epoch as most recent? 
			time2find = '5196299900000'  //for testing
			var timeChosen = time2find - (time2find%36000000);  
			var timeChosenStr = timeChosen.toString().replace(/0+$/,'');
			Meteor.subscribe('livedata',site,timeChosenStr);
			pollutCursor = LiveData.find({}, {limit: 240});
			pollutCursor.forEach(function(line){
				data4graph.push({ x: new Date(line.epoch*1000),
								  y: line.subTypes.metrons.O3[0].val
				});
			});
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
		            data: data4graph,
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
		},
		action: function () {
			this.render();
		}
    });
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


