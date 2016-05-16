var GlimpseDraftManager = DraftManager.extend({
  initialize:function(){
    console.log("glimpse draft manager online");
  
  },
  defaults:function(){
    return {
      playersPresent:true,
      myPackInitialized:false,
      picked:false,
      waiting:false,
      burns:0,
      remainingPacks:9,
      draftNumber:0
    }
  },
  firebaseRefs:{
    packsInitialized:currentGame.child("current-draft/packs-initialized")
  },
  numOfDrafters:2,

  draftPacks:[],
  endDraft:function(){
    //clear the player's mainboard and sideboard

    firebase.child("users/" + firebase.getAuth().uid + "/new-game").remove();

    //add all draft picks to the player's mainboard
    this.draftPicks.each(function(card){
      playerManager.mainboard.create(card.attributes);
    });

    currentGame.child("current-draft/packs-initialized").off("value");
    currentGame.child("current-draft/activeDrafters").off();


    //in order to prevent two clients trying to delete the same node,
    //arbitrarily allow a particular client to clear the draft nodes
    if(this.draftNumber === this.numOfDrafters - 1){
      console.log("i am the chosen one",this.draftNumber)
      currentGame.child("current-draft").once("value",function(snapshot){
        if(snapshot.exists()){
          currentGame.child("current-draft").remove();
        }
      });
    }
  },
  increaseDraftNumber:function(){
    var newDraftNum = this.get("draftNumber") + 1;
    if(newDraftNum >= this.numOfDrafters){
      this.set("draftNumber",0);
    } else {
      this.set("draftNumber",newDraftNum)
    }
  }
});
