var App = App || new Marionette.Application({});

(function(){
  "use strict";

  App.GlimpseDraftManager = Backbone.Firebase.Model.extend({
    url:function(){
      return config.databaseURL + "/new-game/current-draft/" + uid
    },
    initialize:function(){
      console.log("glimpse draft manager online");
      var self = this;
      var poolChannel = Backbone.Radio.channel('pool');
      var draftPool = poolChannel.request("getDraftPool");

      //local references to all packs in the draft
      for(var i = 0; i < this.maxDrafters; i++){
        this.draftPacks.push(new App.Cards("new-game/current-draft/draft-packs/" + i));
      }

      //set draft id if not already set
      if(!this.get("draftNumber")){
        this.set("draftNumber",0);
        var draftNum = this.get("draftNumber");

        //assign draftNumber based on position in activeDrafters endpoint
        activeDrafters.once("value",function(snap){
          snap.forEach(function(val){
            if(uid === val.key){
              return true;
            }

            if(++draftNum >= self.maxDrafters){
              draftNum = 0;
            }
          });

          self.set("draftNumber",draftNum);
        })
      } else {
        alert("your id exists");
      }

      //going directly to firebase for the value event
      //weird things happen when using the .get() method
      currentDraft.child("packs-initialized").on("value",function(snap){
        if(!self.get("myPackInitialized")){
          if(!snap.val() & self.get("draftNumber") === 0 || snap.numChildren() === self.get("draftNumber")){
            console.log("initializing my pack, id",self.get("draftNumber"));

            var packLoaded = new Promise(function(resolve,reject){
              _.each(App.createPack(draftPool,15),function(packCard){
                self.draftPacks[self.get("draftNumber")].create(packCard);

                //magic number 15 for glimpse draft pack size
                if(self.draftPacks[self.get("draftNumber")].length === 15){
                  resolve(self.draftPacks[self.get("draftNumber")]);
                }
              });
            }).then(function(currentPack){
              currentDraft.child("packs-initialized").child(uid).set(true,function(){
                var newRemainingPacks = self.get("remainingPacks") - 1;

                self.set("myPackInitialized",true);
                // self.set("remainingPacks",newRemainingPacks);
                App.vent.trigger("renderPack",currentPack);
              });
            });
          }
        }
      })

      //events
      // this.listenTo(App.vent,"draftCardClick",);
    },
    defaults:function(){
      return {
        myPackInitialized:false,
        picked:false,
        waiting:false,
        burns:0,
        remainingPacks:9,
        packsInitialized:{}
      }
    },
    maxDrafters:2,
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
      if(this.get("draftNumber") === this.numOfDrafters - 1){
        console.log("i am the chosen one",this.get("draftNumber"))
        currentGame.child("current-draft").once("value",function(snapshot){
          if(snapshot.exists()){
            currentGame.child("current-draft").remove();
          }
        });
      }
    }
  });
})();
