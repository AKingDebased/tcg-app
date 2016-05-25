var App = App || new Marionette.Application({});

(function(){
  "use strict";

  App.Cards = Backbone.Firebase.Collection.extend({
    model: Card,
    initialize: function(location) {
      this.url = "https://tcg-app.firebaseio.com/" + location;
    }
  });
})();
