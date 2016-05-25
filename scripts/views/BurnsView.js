var App = App || new Marionette.Application({});

(function(){
  "use strict";
  App.BurnsView = Marionette.CollectionView.extend({
    childView:App.DraftCardView
  });
})();
