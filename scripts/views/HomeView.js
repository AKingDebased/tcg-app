var App = App || new Marionette.Application({});

(function(){
  'use strict';

  App.HomeView = Marionette.ItemView.extend({
    attributes:{
      class:"home"
    },
    initialize:function(){
      console.log("home view online");
    },
    ui:{
      startGlimpse:".start-glimpse",
      startGrid:".start-grid",
      startWinchester:".start-winchester",
      startWinston:".start-winston",
      startDraft:".start-draft"
    },
    template:_.template($("#home-template").html()),
    events:{
      "click @ui.startGlimpse":"displayGlimpseInfo",
      "click @ui.startDraft":function(){
        //empty the region when the modal is fully hidden
        $(".draft-info-modal").modal("hide").on("hidden.bs.modal",function(){
          App.rootLayout.mainRegion.empty();
          App.gatekeeperModel = new App.GatekeeperModel();

          App.gatekeeperView = new App.GatekeeperView({
            model: App.gatekeeperModel
          });

          App.rootLayout.mainRegion.show(App.gatekeeperView);
        });
      }
    },
    displayGlimpseInfo:function(){
      //these 4 display functions should be condensed down to one
      $(".draft-info-modal").modal('show');
      $.get('templates/glimpse-draft-info.html', function (data) {
        $(".draft-info").html(_.template(data));
      }, 'html');
    },
    displayGridInfo:function(){
      //TODO
    },
    displayWinstonInfo:function(){
      //TODO
    },
    displayWinchesterInfo:function(){
      //TODO
    }
  })
})()
