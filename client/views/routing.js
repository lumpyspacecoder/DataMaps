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
        time2find.set((new Date).getTime());//passing epoch as most recent?
        time2find.set('5194882710000');  //for testing
        timeChosen = time2find.get() - (time2find.get()%360000000);
        timeChosenStr = timeChosen.toString().replace(/0+$/,'');
        Meteor.subscribe('livedata',site.get(),timeChosenStr);
		pollutCursor = LiveData.find({}, {limit: 240});
        //console.log('cnt',pollutCursor.count())
		dataSets = new ReactiveDict();
		dataPacks = new ReactiveDict();
		dataIngraph = {};
		pollutCursor.forEach(function(line){
            //console.log(line)
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
				data4graph[metron].name = metric;
				data4graph[metron].color = '#8CB921'; //could choose from an indexed list??
				data4graph[metron].type = 'bubble';
				data4graph[metron].data = dataIngraph[metron][metric]
			}
			dataSets.set(metron,data4graph)
		};
		dataSeries = function(){
			//console.log(dataSets.keys)
			for (key in dataSets.keys){
//				console.log('data',dataSets.get(key)[key].data)
//				console.log('key',key) //key is the name of the metric
//				console.log(dataSets.get(key)[key].name)
//				console.log(dataSets.get('O3')['O3'])
				//key is the metron, and should be used for higher on select
 				return {name: dataSets.get(key)[key].name,
						data: dataSets.get(key)[key].data, //dataSets.keys[key],
						color: dataSets.get(key)[key].color,
						type: dataSets.get(key)[key].type
				}
			}
		}
		
		//console.log('dataSeries',dataSeries())
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


