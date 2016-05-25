var App = App || new Marionette.Application({});

(function(){
  "use strict";
  
  App.RootLayout = Marionette.LayoutView.extend({
    el:"body",
    template: _.template("<div class=root-region></div>"),
    initialize:function(){
      console.log("app layout view online");
    },
    regions:{
      mainRegion:".root-region"
    },
  });

})();
