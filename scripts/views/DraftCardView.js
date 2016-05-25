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
    events:{
      "click":function(){
        App.vent.trigger("draftCardClick",this);
      }
    }
  });
})();
