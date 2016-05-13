var DraftManager = Backbone.Firebase.Model.extend({
  url:"https://tcg-app.firebaseio.com/new-game/current-draft/" + firebase.getAuth().uid,
  draftPool:new Cards("new-game/current-draft/draftPool"),
  initializeDraftPool:function(){
    var self = this;
    _.each(App.gameManager.cardPool,function(color){
      color.forEach(function(card){
        if(card.get("name") === "none"){
          return;
        }
        App.draftPool.push(card.attributes);
      });
    });
  },
  createPack:function(packSize){
    console.log("creating a pack");
    var count = 0;
    var pack = [];

    var randomIndex;
    for(var i = 0; i < packSize; i++){
      randomIndex = _.random(0,App.draftManager.draftPool.length - 1)

      //WHY IS THERE ALWAYS A SINGLE DEFAULT MODEL IN THE COLLECTION
      while(App.draftManager.draftPool.at(randomIndex).get("name") === "none"){
        randomIndex = _.random(0,App.draftManager.draftPool.length - 1);
      }
      pack.push(App.draftManager.draftPool.remove(App.draftManager.draftPool.at(randomIndex))[0]);
      count++;
    }
    return pack;
  }
});
