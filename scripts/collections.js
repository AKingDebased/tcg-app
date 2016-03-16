var Players = Backbone.Firebase.Collection.extend({
  model:Player,
  url:"https://tcg-app.firebaseio.com/game/players"
});

var Cards = Backbone.Firebase.Collection.extend({
  model: Card,
  initialize: function(game, color) {
    this.url = "https://tcg-app.firebaseio.com/" + game + "/cardPool/" + color;
  }
});
