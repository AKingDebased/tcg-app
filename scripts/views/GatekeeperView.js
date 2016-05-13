var GatekeeperView = Marionette.ItemView.extend({
  attributes:{
    class:"gatekeeper"
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
    App.rootLayout.mainRegion.empty();
    App.poolUploadModel = new PoolUploadModel();
    App.rootLayout.mainRegion.show(new UploadPoolView({
      model:App.poolUploadModel
    }));
  }
});
