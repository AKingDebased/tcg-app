var App = App || new Marionette.Application({});

(function(){
  "use strict";

  App.PoolUploadView = Marionette.ItemView.extend({
    attributes:{
      class:"upload-pool"
    },
    template:_.template($("#pool-upload-template").html()),
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
        var self = this;

        if(!this.model.get("poolUploaded")){
          alert("nice try.")
          return;
        }

        App.vent.trigger("startDrafting");
        App.glimpseDraftManager = new App.GlimpseDraftManager({
          //drafting true?
          drafting:true
        });
        App.glimpseDraftLayout = new App.GlimpseDraftLayout({
          model:App.glimpseDraftManager
        });
        App.rootLayout.mainRegion.show(App.glimpseDraftLayout);
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
})();
