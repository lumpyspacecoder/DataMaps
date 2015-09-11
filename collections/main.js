Template.main.onCreated( function() {
    // creation of reactive var which will be a mongo query for the menu of live data monitors
    var self = this;
  self.autorun(function () {
    self.subscribe('LiveData');
  });
});
Template.main.helpers( 
    // used to display menu on main div
    currentSite: function() {
    return LiveData.find();
});

Template.main.events({
    // depending on which site the user clicks to learn more about, session variable will be changed and passed to currentsites.js
    'click .site': function(e) {   
        Session.set("selectedSite", this.siteRef);
    }
});

