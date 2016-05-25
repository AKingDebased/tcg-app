var Card = Backbone.Model.extend({
  defaults:function(){
    return{
      name:"none",
      colors:["none"],
      types:["none"],
      image:"none",
      selected:false
    }
  }
});
