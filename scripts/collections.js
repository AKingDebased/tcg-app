var Players = Backbone.Firebase.Collection.extend({
  model:Player,
  url:"https://tcg-app.firebaseio.com/game/players"
});

var Cards = Backbone.Firebase.Collection.extend({
  model: Card,
  initialize: function(location) {
    this.url = "https://tcg-app.firebaseio.com/" + location;
  }
});
