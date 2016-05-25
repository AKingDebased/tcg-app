var App = App || new Marionette.Application({});

(function(){
  "use strict";

  App.DraftCardView = Marionette.ItemView.extend({
    tagName:"img",
    attributes:function(){
      return {
        src:this.model.get("image").replace("ps:","p:"),
        class:"draft-card"
      }
    },
    template:false,
    triggers:{
      "click":"cardClicked"
    },
    renderSelected:function(){
      this.$el.addClass("selected");
    },
    renderUnselected:function(){
      this.$el.removeClass("selected");
    },
    modelEvents:{
      "change:selected":function(model){
        if(model.get("selected")){
          this.renderSelected();
        } else {
          this.renderUnselected();
        }
      }
    }
  });
})();
