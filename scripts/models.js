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

var DraftStatus = Backbone.Firebase.Model.extend({
  //temp link until draft rooms are implemented
  url: "https://tcg-app.firebaseio.com/new-game",
  initialize:function(){
    console.log("syncing draft status");
  },
  defaults:function(){
    return{
      activeDrafters:{},
      drafting:false
    }
  }
});
