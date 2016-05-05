//a helper object designed to sync the shared cardpool collection
//with firebase, contain meta data about the room, and provide
//global functions
var GameManager = function() {
  this.firebase = new Firebase("https://tcg-app.firebaseio.com/");
  this.cardPool;
  this.randomPack = function(pool,packSize){
    //an embarrassingly terrible algorithm
    var pack = [];
    var colorKeys = Object.keys(pool);
    var randomColorIndex;
    var randomColorKey;
    var randomColor;
    var randomCardIndex;
    var randomCard;
    var emptyColors = {
    };

    //DON'T LOOK AT ME
    //DON'T LOOK AT MY SHAME
    while(pack.length < packSize){
      //randomly find a non-empty color
      do{
        if(_.size(emptyColors) >= 7){
          return;
        }

        randomColorIndex = Math.floor(Math.random() * colorKeys.length)
        randomColorKey = colorKeys[randomColorIndex];
        randomColor = this.cardPool[randomColorKey];

        //Cards collection instantiates with 1 default model
        //not sure why, but here's the temp kludge fix
        if((randomColor.length <= 0 || randomColor.length === 1  &&
          randomColor.at(0).get("name") === "none") && !(randomColorKey in emptyColors)){
            emptyColors[randomColorKey] = 0;
          }
        } while(randomColor.length <= 0 ||
          randomColor.length === 1 && randomColor.at(0).get("name") === "none");

          randomCardIndex = Math.floor(Math.random() * randomColor.length);

          if(randomColor.at(randomCardIndex).get("name") === "none"){
            continue;
          } else {

            //returning an array for some reason?
            randomCard = randomColor.remove(randomColor.at(randomCardIndex))[0];

            pack.push(randomCard);
          }
        }

        return pack;
      }

      this.startGame = function() {
        this.cardPool = {
          white: new Cards("new-game/cardPool/white"),
          blue: new Cards("new-game/cardPool/blue"),
          black: new Cards("new-game/cardPool/black"),
          red: new Cards("new-game/cardPool/red"),
          green: new Cards("new-game/cardPool/green"),
          colorless: new Cards("new-game/cardPool/colorless"),
          multicolor: new Cards("new-game/cardPool/multicolor")
        };

        players.child(firebase.getAuth().uid).set(true);

        //should find a better place for these
        var testPoolView = new CardPoolView();
        playerManager = new PlayerManager();
        deckBuilderView = new DeckBuilderView();
        handView = new ClientHandView();
        draftView = new DraftView();
      }

      console.log("GM online.");
    };

    var PlayerManager = function(){
      var self = this;
      this.mainboard = new Cards("users/" + firebase.getAuth().uid + "/new-game/mainboard");
      this.sideboard = new Cards("users/" + firebase.getAuth().uid + "/new-game/sideboard");
      this.deck = new Cards("users/" + firebase.getAuth().uid + "/new-game/deck");
      this.hand = new Cards("users/" + firebase.getAuth().uid + "/new-game/hand");
      this.opponentID;
      this.opponentHand;

      //establish who the opponent is
      //i.e. it's the only other UID in this room who is not this client
      players.once("value",function(snap){
        snap.forEach(function(childSnap){
          if(childSnap.key() !== firebase.getAuth().uid){
            self.opponentID = childSnap.key();
            //GOD AWFUL place for these things
            //perhaps use the EventHub instead?
            self.opponentHand = new Cards("users/" + self.opponentID + "/new-game/hand");
            opponentHandView = new OpponentHandView({collection:self.opponentHand});
          }
        })
      })

      console.log("player set");
    }

    //only works with glimpse draft
    //needs to be made more generic, to allow for other draft formats
    var DraftManager = function(){
      this.currentDraftManager;
      this.draftPool = new Cards("new-game/current-draft/draftPool");
      this.initializeDraftPool = function(){
        var self = this;
        _.each(gameManager.cardPool,function(color){
          color.forEach(function(card){
            if(card.get("name") === "none"){
              return;
            }
            self.draftPool.push(card.attributes);
          });
        });
      },
      this.addPlayer = function(){
        currentGame.child("current-draft/drafting").once("value",function(snapshot){
          if(!snapshot.val()){
            //draft hasn't started
            currentGame.child("current-draft/active-drafters").once("value",function(snapshot){
              //draft is not full
              if(snapshot.numChildren() <= 1){
                currentGame.child("current-draft/active-drafters").child(firebase.getAuth().uid).set(true);
                currentGame.child("current-draft/drafting").on("value",function(snapshot){
                  if(snapshot.val()){
                    console.log("old fashioned way");
                    self.currentDraftManager = new GlimpseDraftManager();
                    currentGame.child("current-draft/drafting").off("value");
                  }
                });
                EventHub.trigger("notEnoughDrafters");
              }
              //fellow drafter already present
              if(snapshot.numChildren() === 1){
                currentGame.child("current-draft/drafting").transaction(function(currentVal){
                  if(currentVal === null){
                    return true
                  } else if(currentVal === true){
                    return;
                  }
                },function(error,committed,snapshot){
                  if(committed){
                    console.log("draft full, starting now");
                  } else {
                    console.log("draft full, in progress");
                  }
                });
              }
            });
          } else {
            //oy vey, long lines
            currentGame.child("current-draft/inactive-drafters").child(firebase.getAuth().uid).once("value",function(snapshot){
              if(snapshot.val() !== null){
                self.currentDraftManager = new GlimpseDraftManager(true,snapshot.val().draftNumber,snapshot.val().picked,snapshot.val().burns,snapshot.val().remainingPacks);
                return;
              }
            });
          }
        });
      };
      this.createPack = function(packSize){
        console.log("creating a pack");
        var count = 0;
        var pack = [];

        var randomIndex;
        for(var i = 0; i < packSize; i++){
          randomIndex = _.random(0,draftManager.draftPool.length - 1)

          //WHY IS THERE ALWAYS A SINGLE DEFAULT MODEL IN THE COLLECTION
          while(draftManager.draftPool.at(randomIndex).get("name") === "none"){
            randomIndex = _.random(0,draftManager.draftPool.length - 1);
          }
          pack.push(draftManager.draftPool.remove(draftManager.draftPool.at(randomIndex))[0]);
          count++;
        }
        return pack;
      }
    };

    var GlimpseDraftManager = function(reconnecting,previousDraftNumber,previousPicked,previousBurns,previousRemainingPacks){
      this.playersPresent = true;
      this.myPackInitialized = false;
      this.picked = false;
      this.waiting = false;
      this.burns = 0;
      this.remainingPacks = 3;
      this.draftNumber = 0;
      this.numOfDrafters = 2;
      this.draftPicks = new Cards("new-game/current-draft/draft-picks/" + firebase.getAuth().uid);
      this.draftBurns = new Cards("new-game/current-draft/draft-burns/" + firebase.getAuth().uid);
      this.draftPacks = [];
      this.setDisconnect = function(){
        //if client disconnects, log their draft info to the server
        //has to be done multiple times because onDisconnect is weird
        currentGame.child("current-draft/inactive-drafters").child(firebase.getAuth().uid).onDisconnect().set({
          draftNumber:self.draftNumber,
          picked:self.picked,
          burns:self.burns,
          remainingPacks:self.remainingPacks
        });
      };
      this.endDraft = function(){
        //clear the player's mainboard and sideboard

        firebase.child("users/" + firebase.getAuth().uid + "/new-game").remove();

        //add all draft picks to the player's mainboard
        this.draftPicks.each(function(card){
          playerManager.mainboard.create(card.attributes);
        });

        currentGame.child("current-draft/packs-initialized").off("value");
        currentGame.child("current-draft/active-drafters").off();


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
      };
      this.increaseDraftNumber = function(){
        if(++this.draftNumber >= this.numOfDrafters){
          this.draftNumber = 0;
        }
        this.setDisconnect();
      };
      var self = this;

      //when another client in the draft disconnects, halt this client's picks
      currentGame.child("current-draft/active-drafters").on("child_removed",function(){
        alert("seems your fellow drafter disconnected. picking and burning will be disabled until they return.");
        self.playersPresent = false;
      });

      //when another client reconnects, resume drafting
      currentGame.child("current-draft/active-drafters").on("child_added",function(){
        if(!self.playersPresent){
          alert("your fellow drafter is back. picking and burning will resume.");
          self.playersPresent = true;
        }
      });

      //store all the drafters' packs locally
      //not on node, so there's no server side scripting
      //thus, all clients technically have access to all packs
      //currently in the draft
      for(var i = 0; i < this.numOfDrafters; i++){
        this.draftPacks.push(new Cards("new-game/current-draft/draft-packs/" + i));
      }

      //one time draft pack check.
      //meant to render packs for reconnecting drafters
      if(reconnecting){
        currentGame.child("current-draft/inactive-drafters").child(firebase.getAuth().uid).remove(function(){
          currentGame.child("current-draft/active-drafters").child(firebase.getAuth().uid).set(true,function(){
            self.draftNumber = previousDraftNumber;
            self.myPackInitialized = true;
            self.remainingPacks = previousRemainingPacks;
            self.picked = previousPicked;
            self.burns = previousBurns;
            self.setDisconnect();
            EventHub.trigger("renderPack",self.draftPacks[self.draftNumber]);
          });
        });
      }

      //if client disconnects, log their draft info to the server
      self.setDisconnect();
      //if client disconnects, add them to inactive drafters node
      currentGame.child("current-draft/active-drafters").child(firebase.getAuth().uid).onDisconnect().remove();


      //if draft pool has not been initialized, initialize it
      //other players' packs won't be initialized until the draft pool
      //is initialized
      currentGame.child("current-draft/draftPool").once("value",function(snapshot){
        if(!snapshot.exists()){
          draftManager.initializeDraftPool();
        }
      });

      //assign each player a draft number
      //should check if the user is present at all
      currentGame.child("current-draft/active-drafters").once("value",function(snapshot){
        snapshot.forEach(function(drafter){
          if(drafter.key() === firebase.getAuth().uid){
            return true;
          }
          self.increaseDraftNumber();
        });
      });

      //everyone creates their pack in draft number order
      //this will (hopefully) prevent weird network issues that cause
      //duplicate cards across draft packs
      currentGame.child("current-draft/packs-initialized").on("value",function(snapshot){
        if(!self.myPackInitialized){
          if(snapshot.val() === null & self.draftNumber === 0 || snapshot.numChildren() === self.draftNumber){
            console.log("initializing my pack, id",self.draftNumber);

            var packLoaded = new Promise(function(resolve,reject){
              _.each(draftManager.createPack(15),function(packCard){
                self.draftPacks[self.draftNumber].create(packCard);

                //-1 due to default model in collection
                //magic number 15 for glimpse draft pack size
                if(self.draftPacks[self.draftNumber].length - 1 === 15){
                  resolve(self.draftPacks[self.draftNumber]);
                }
              });
            }).then(function(currentPack){
              currentGame.child("current-draft/packs-initialized").child(firebase.getAuth().uid).set(true,function(){
                EventHub.trigger("renderPack",currentPack);
                self.remainingPacks--;
                self.setDisconnect();
              });
            });
          }
        }
      });

      EventHub.trigger("startDraft",this);

      EventHub.bind("draftCardClick",function(cardView){
        if(!self.waiting && self.playersPresent){
          EventHub.trigger("hidePopover");
          if(!self.picked){
            self.draftPicks.create(cardView.model);
            self.picked = true;
            self.draftPacks[self.draftNumber].remove(cardView.model);
            self.setDisconnect();
          } else {
            self.burns++;
            self.draftBurns.create(cardView.model);
            self.draftPacks[self.draftNumber].remove(cardView.model);
            self.setDisconnect();
          }

          if(self.picked && self.burns >= 2){
            self.waiting = true;
            self.picked = false;
            self.burns = 0;
            self.setDisconnect();

            currentGame.child("current-draft/done-picking").child(firebase.getAuth().uid).set(true);
          }
        }
      });

      //detect when all drafters have made their picks
      //once they have, increment everyone's draft number
      //then display the pack associated with that draft number
      currentGame.child("current-draft/done-picking").on("value",function(snapshot){
        if(snapshot.numChildren() === self.numOfDrafters){
          self.increaseDraftNumber();
          EventHub.trigger("renderPack",self.draftPacks[self.draftNumber]);
          self.waiting = false;

          //if the packs are empty, generate new ones
          //once again, default card present in collection
          if(self.draftPacks[self.draftNumber].length <= 1){
            self.myPackInitialized = false;
            console.log("pack is empty");

            //end draft condition
            if(self.remainingPacks <= 0){
              console.log("we're done here")
              EventHub.trigger("draftComplete");
              self.endDraft();
              return;
            }
            currentGame.child("current-draft/packs-initialized").once("value",function(snapshot){
              //ensures that only one client is removing the packs-initialized node

              //draftNumber is 0 indexed
              if(self.draftNumber === snapshot.numChildren() - 1){
                currentGame.child("current-draft/packs-initialized").remove();
              }
            });
            console.log("remaining packs",self.remainingPacks);
          }

          currentGame.child("current-draft/done-picking").remove();
        }
      });
      console.log("glimpse draft manager online");
    }
