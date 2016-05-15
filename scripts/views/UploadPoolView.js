var UploadPoolView = Marionette.ItemView.extend({
  attributes:{
    class:"upload-pool"
  },
  template:_.template($("#upload-pool").html()),
  onShow:function(){
    console.log("upload pool view online");

    this.listenTo(App.vent,"clearPoolEl",this.clearPoolEl);
    //attribute event not triggering on instantiation
    this.model.fetch();
  },
  ui:{
    poolUploader:".pool-uploader",
    startDraft:".start-draft"
  },
  events:{
    "click .upload-button":function(){
      this.model.uploadCards(this.ui.poolUploader.val());
    },
    "click .start-draft":function(){
      //this needs to be bound to a boolean
      App.rootLayout.mainRegion.empty();
      App.glimpseDraftView = new GlimpseDraftView({
        model:new GlimpseDraftManager()
      });
      App.rootLayout.mainRegion.show(App.glimpseDraftView);
    }
  },
  modelEvents:{
    "sync":function(model){
      if(model.get("poolUploaded")){
        this.poolUploaded();
      }
    }
  },
  clearPoolEl:function(){
    this.ui.poolUploader.val("");
  },
  poolUploaded:function(){
    this.ui.poolUploader.attr("readonly","").css("opacity","0.4");
    this.ui.startDraft.removeAttr("disabled");
  }
});
