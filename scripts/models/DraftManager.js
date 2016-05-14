var DraftManager = Backbone.Firebase.Model.extend({
  url:"https://tcg-app.firebaseio.com/new-game/current-draft/" + firebase.getAuth().uid,
  draftPool:new Cards("new-game/current-draft/draft-pool"),
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
    var count = 0;
    var pack = [];

    var randomIndex;
    for(var i = 0; i < packSize; i++){
    randomIndex = _.random(0,this.draftPool.length - 1)

    // WHY IS THERE ALWAYS A SINGLE DEFAULT MODEL IN THE COLLECTION
      while(this.draftPool.at(randomIndex).get("name") === "none"){
        randomIndex = _.random(0,this.draftPool.length - 1);
      }
      pack.push(this.draftPool.remove(this.draftPool.at(randomIndex))[0]);
      count++;
    }
    return pack;
  }
});
