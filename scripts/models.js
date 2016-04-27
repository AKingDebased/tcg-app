var Card = Backbone.Model.extend({
  defaults:function(){
    return{
      name:"none",
      colors:["none"],
      types:["none"],
      image:"none",
      posX:"0",
      posY:"0",
      revealed:false
    }
  }
});
