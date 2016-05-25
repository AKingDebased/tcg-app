var App = App || new Marionette.Application({});

(function(){
  "use strict";

  App.PackView = Marionette.CollectionView.extend({
    tagName:"div",
    childView:App.DraftCardView,
    template:false,
    initialize:function(){
      var self = this;

      this.listenTo(App.vent,"renderPack",function(pack){
        //pack is asynchronously loaded. when it's ready, we set
        //it and render it
        self.collection = self.collection || pack;
        self.render();
      });
    }
  });
})();
