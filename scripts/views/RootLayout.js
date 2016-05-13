var RootLayout = Marionette.LayoutView.extend({
  el:"body",
  template: _.template("<div class=main-region></div>"),
  initialize:function(){
    console.log("app layout view online");
  },
  regions:{
    mainRegion:".main-region"
  },
});
