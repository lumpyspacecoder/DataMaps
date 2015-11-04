



// Meteor.publish('sitesdata', function() {
//     return Sites.find();
// })
Meteor.publish('userData', function () {
  if (this.userId) {
    return Meteor.users.find({_id: this.userId},
                             {fields: {'other': 1, 'things': 1}});
  } else {
    this.ready();
  }
});

Meteor.publish('favorites', function () {
    return Favorites.find({ owner: this.userId});
});
    
