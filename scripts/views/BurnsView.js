var App = App || new Marionette.Application({});

(function(){
  "use strict";
  App.BurnsView = Marionette.CollectionView.extend({
    tagName:"div",
    template:false,
    childView:App.DraftCardView
  });
})();
