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
    },
    childEvents:{
      "cardClicked":function(childView){
        //if the pick has not already been made
        if(!this.options.parentLayout.model.get("picked")){
          if(!childView.model.get("selected")){
            childView.model.set("selected",true);
            this.options.parentLayout.model.set("picked",true);
          }
        } else {
          //if you click on another card while one is selected
          if(!childView.model.get("selected")){
            this.collection.find(function(card){
              return (card.get("name") !== childView.model.get("name"))  && card.get("selected");
            }).set("selected",false);

            childView.model.set("selected",true);
          }
        }
      }
    }
  });
})();
