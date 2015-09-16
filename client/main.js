Template.main.onCreated( function() {
    // creation of reactive var which will be a mongo query for the menu of live data monitors
    var self = this;
    self.autorun(function () {
    self.subscribe('LiveMenu');
  });
});


Template.main.helpers({
      currentSites: function () {
        var data = LiveFeedMonitors.find().fetch();
         var distinctData = _.uniq(data, false, function(d) {return d.siteRef});
         return _.pluck(distinctData, "siteRef");
}
});

// Template.main.helpers({
//     // used to display menu on main div
//     currentSites: function() {
//       var current = LiveFeedMonitors.find().fetch();
//       var distinctEntries = _.uniq(current, false, function(d) {return d.siteRef});
//       return _.pluck(distinctEntries, "siteRef");
      
//     }
    
// });


Template.main.events({
    // depending on which site the user clicks to learn more about, session variable will be changed and passed to currentsites.js
    'change #siteselect': function(e) {
        var newValue = $(e.target).val();
        Session.set("selectedSite", newValue);
    }
});

