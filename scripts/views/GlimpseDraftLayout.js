var App = App || new Marionette.Application({});

(function(){
  "use strict";
  App.GlimpseDraftLayout = Marionette.LayoutView.extend({
    template: _.template($("#glimpse-draft").html()),
    initialize:function(){
      console.log("glimpse draft layout view online");
    },
    regions:{
      packRegion:".pack-region",
      picksRegion:".picks-region",
      burnsRegion:".burns-region"
    },
    onRender:function(){
      var packView = new App.PackView({
        parentLayout:this
      });
      var picksView = new App.PicksView();
      var burnsView = new App.BurnsView();


      this.packRegion.show(packView);
      this.picksRegion.show(picksView);
      this.burnsRegion.show(burnsView);
    }
  });
})();
