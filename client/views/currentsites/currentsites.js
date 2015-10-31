var selectedPoints = null;
var ozoneCursor = null;


//move shit into onRendered, etc.

//LiveData.find();
// var data4graph = [];//
//;
// console.log(data4graph)
// livedata.forEach(function(){
// 	console.log('line')
// // // 	//data4graph.push(line)
//  })

function reactiveArea() {
	//var $report= $('#report');
	// console.log('reactiv')
	//     pollutCursor = LiveData.find({}, {limit: 240}); //just in case asking for too much
	// var data4graph = [];
	// console.log(pollutCursor)
	// // LiveData.find({}).observeChanges({
	// // 	addedBefore: function(id,line){
	// // 		console.log(line)
	// // 			data4graph.push({ x: new Date(line.epoch*1000),
	// // 							  y: line.subTypes.metrons.O3[0].val
	// // 			});
	// // 	}
	// // });
	// pollutCursor.forEach(function(line){
	// 	console.log(line)
	// 	data4graph.push({ x: new Date(line.epoch*1000),
	// 					  y: line.subTypes.metrons.O3[0].val
	// 	});
	// })
		// ozoneCursor = LiveData.find({siteRef:site}, {limit: 240});
//
// 		var ozoneConDataforGraph = [];
// 		ozoneCursor.forEach(function(time) {
// 			ozoneConDataforGraph.push({ x: new Date(time.epoch*1000),
// 									y: parseFloat(time.O3_conc), 	id: time._id});
// 		});

                         
   
	}
	
Template.currentsites.onRendered(function (){

	//var data4graphColl = new Meteor.Collection('dataInGraph');
});

// Template.currentsites.rendered = function () {
//
//     //Tracker.autorun(function () {
//        reactiveArea();
//     //});
// }

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
