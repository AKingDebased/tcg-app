var Player = Backbone.Model.extend({
  defaults:function(){
    return {
      name:"",
      mainboard:new Cards(),
      sideboard:new Cards(),
      deck:new Cards()
    }
  },
  initialize: function() {
    //if the mainboard is replaced
    this.listenTo(this, "change:mainboard", function(change) {
      this.listenTo(change.get("mainboard"), "remove", function() {
        EventHub.trigger("removedMainboardItem")
      });
      this.listenTo(change.get("mainboard"), "add", function() {
        EventHub.trigger("addedMainboardItem");
      });
    })
  }
});

var Card = Backbone.Model.extend({
  defaults:function(){
    return{
      name:"none",
      colors:["none"],
      types:["none"],
      image:"none"
    }
  }
});
