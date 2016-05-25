var App = App || new Marionette.Application({});

(function(){
  "use strict";

  App.GatekeeperView = Marionette.ItemView.extend({
    attributes:{
      class:"gatekeeper"
    },
    onShow:function(){
      //model doesn't sync initially, for some reason

      this.changeNumDrafters(this.model);
    },
    ui:{
      activeDrafters:".activeDrafters",
      maxDrafters:".maxDrafters",
      enterDraft:".enter-draft",
      waitingLabel:".waiting-label"
    },
    //template needs to be loaded externally
    template:_.template($("#gatekeeper-template").html()),
    modelEvents:{
      "sync":"changeNumDrafters draftReady"
    },
    events:{
      "click .enter-draft":"startDraft"
    },
    changeNumDrafters:function(data){
      this.ui.activeDrafters.text(Object.keys(data.get("activeDrafters")).length);
      this.ui.maxDrafters.text(data.get("maxDrafters"));
    },
    draftReady:function(data){
      //if all drafters are present
      if(Object.keys(data.get("activeDrafters")).length === data.get("maxDrafters")){
        this.ui.enterDraft.removeAttr("disabled");
        this.ui.waitingLabel.text("all drafters present!");
      }
    },
    startDraft:function(){
      //thwart any sneaky hackers
      if(Object.keys(this.model.get("activeDrafters")).length !== this.model.get("maxDrafters")){
        alert("nice try");
        return;
      }

      App.rootLayout.mainRegion.empty();
      App.poolUploadModel = new App.PoolUploadModel();
      App.poolUploadView = new App.PoolUploadView({
        model:App.poolUploadModel
      });
      App.rootLayout.mainRegion.show(App.poolUploadView);
    }
  });
})();
