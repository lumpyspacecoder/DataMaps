currentSites = new Meteor.Collection('currentsites');

var selectedPoints = null;
Template.currentsites.onCreated(function (){

});
Template.currentsites.onRendered(function (){
//    Tracker.autorun(function () {
            
		
//});//end autorun
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
