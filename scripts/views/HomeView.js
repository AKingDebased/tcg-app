var HomeView = Backbone.View.extend({
  attributes:{
    class:"home"
  },
  initialize:function(){
    console.log("home view online");
    _.bindAll(this,"displayGlimpseInfo");
  },
  events:{
    "click .start-glimpse":"displayGlimpseInfo",
    "click .start-draft":function(){
      //empty the region when the modal is fully hidden
      $(".draft-info-modal").modal("hide").on("hidden.bs.modal",function(){
        App.rootLayout.mainRegion.empty();    

        App.gatekeeperView = new GatekeeperView({
          model: new GatekeeperModel()
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
  },
  render:function(){
    var self = this;
    $.get('templates/home.html', function (data) {
      self.$el.html(_.template(data));
    }, 'html');
  }
});
