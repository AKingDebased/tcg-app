var App = App || new Marionette.Application({});

(function(){
  "use strict";
  App.PicksView = Marionette.CollectionView.extend({
    tagName:"div",
    template:false,
    childView:App.DraftCardView
  });
})();
