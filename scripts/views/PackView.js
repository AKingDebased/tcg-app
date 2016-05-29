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
        //pack is asynchronously loaded. when it's ready,
        //we set it and render it
        self.collection = self.collection || pack;
        self.render();
      });
    },
    renderSelection:function(childView){
      //if the pick has not already been made
      if(!this.options.parentLayout.model.get("picked")){
        if(!childView.model.get("selected")){
          var otherSelection = this.collection.find(function(card){
            return (card.get("name") !== childView.model.get("name"))  && card.get("selected");
          })
          //if there is another selected card
          if(otherSelection){
            console.log('other selection',otherSelection);
            otherSelection.set("selected",false);
            childView.model.set("selected",true);
            return;
          } else {
            childView.model.set("selected",true);
          }

        } else {
          this.options.parentLayout.model.set("picked",true);
          alert("selection made!");
        }
      }
    },
    childEvents:{
      "cardClicked":"renderSelection"
    }
  })
})();
