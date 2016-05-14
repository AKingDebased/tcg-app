var GlimpseDraftManager = DraftManager.extend({
  initialize:function(){
    console.log("glimpse draft manager online");
    var self = this;

    //store all the drafters' packs locally
    //not on node, so there's no server side scripting
    //thus, all clients technically have access to all packs
    //currently in the draft
    for(var i = 0; i < this.numOfDrafters; i++){
      this.draftPacks.push(new Cards("new-game/current-draft/draft-packs/" + i));
    }

    //assign each player a draft number
    //should check if the user is present at all
    for(drafter in App.gatekeeperView.model.get("activeDrafters")){
      if(drafter === firebase.getAuth().uid){
        break;
      }
      this.increaseDraftNumber();
    }

    this.firebaseRefs.packsInitialized.on("value",function(snapshot){
      if(!self.get("myPackInitialized")){
        console.log("my pack is not initialized");
        if(snapshot.val() === null && self.get("draftNumber") === 0 || snapshot.numChildren() === self.get("draftNumber")){
          console.log("initializing my pack, id",self.get("draftNumber"));

          var packLoaded = new Promise(function(resolve,reject){
            _.each(self.createPack(15),function(packCard){
              self.draftPacks[self.get("draftNumber")].create(packCard);
              // -1 due to default model in collection
              // magic number 15 for glimpse draft pack size
              if(self.draftPacks[self.get("draftNumber")].length - 1 === 15){
                resolve(self.draftPacks[self.get("draftNumber")]);
              }
            });
          }).then(function(currentPack){
            self.firebaseRefs.packsInitialized.child(firebase.getAuth().uid).set(true,function(){
              App.vent.trigger("renderPack",currentPack);
              self.set("remainingPacks",self.get("remainingPacks") - 1);
              self.setDisconnect();
            });
          });
        }
      }
    });
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
  draftPicks:new Cards("new-game/current-draft/draft-picks/" + firebase.getAuth().uid),
  draftBurns:new Cards("new-game/current-draft/draft-burns/" + firebase.getAuth().uid),
  draftPacks:[],
  setDisconnect:function(){
    //if client disconnects, log their draft info to the server
    //has to be done multiple times because onDisconnect is weird
    // currentGame.child("current-draft/inactiveDrafters").child(firebase.getAuth().uid).onDisconnect().set({
    //   draftNumber:self.get("draftNumber"),
    //   picked:self.picked,
    //   burns:self.burns,
    //   remainingPacks:self.remainingPacks
    // });
  },
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
    this.setDisconnect();
  }
});
