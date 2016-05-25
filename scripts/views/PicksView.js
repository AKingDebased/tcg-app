var App = App || new Marionette.Application({});

(function(){
  "use strict";
  App.PicksView = Marionette.CollectionView.extend({
    childView:App.DraftCardView
  });
})();
