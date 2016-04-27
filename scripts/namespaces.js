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
        draftView = new DraftView({collection:draftManager.draftPool});
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
      this.draftPool = new Cards("new-game/draftPool");
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
        currentGame.child("drafters").child(firebase.getAuth().uid).set(true);
        //check if there are 2 drafters
        //if there are, and the draft hasn't started, start it
        //if there are and the draft has started... i dunno, cry, i guess?
        currentGame.child("drafters").once("value",function(snap){
          if(snap.numChildren() < 2){
            EventHub.trigger("notEnoughDrafters");
          } else if(snap.numChildren() >= 2){
            currentGame.child("drafting").transaction(function(currentVal){
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
          } else {
            return;
          }
        });
      },
      this.createPack = function(packSize){
        var pack = [];

        var randomIndex;
        for(var i = 0; i < packSize; i++){
          randomIndex = _.random(0,draftManager.draftPool.length - 1)

          //WHY IS THERE ALWAYS A SINGLE DEFAULT MODEL IN THE COLLECTION
          while(draftManager.draftPool.at(randomIndex).get("name") === "none"){
            randomIndex = _.random(0,draftManager.draftPool.length - 1);
          }
          pack.push(draftManager.draftPool.remove(draftManager.draftPool.at(randomIndex))[0]);
        }
        return pack;
      }

      currentGame.child("drafting").on("value",function(snapshot){
        if(snapshot.val() === true){
          self.currentDraftManager = new GlimpseDraftManager();
        }
      });
    };

    var GlimpseDraftManager = function(){
      this.myPackInitialized = false;
      this.picked = false;
      this.waiting = false;
      this.burns = 0;
      this.remainingPacks = 1;
      this.draftNumber = 0;
      this.numOfDrafters = 2;
      this.draftPicks = new Cards("new-game/draft-picks/" + firebase.getAuth().uid);
      this.draftBurns = new Cards("new-game/draft-burns/" + firebase.getAuth().uid);
      this.draftPacks = [];
      this.endDraft = function(){
        //clear the player's mainboard and sideboard
        if(playerManager.mainboard.length >= 1){
          console.log("removing mainboard");
          firebase.child("users/" + firebase.getAuth().uid + "/new-game/mainboard").remove();
        }

        if(playerManager.sideboard.length >= 1){
          console.log("removing sideboard");
          firebase.child("users/" + firebase.getAuth().uid + "/new-game/sideboard").remove();
        }

        //add all draft picks to the player's mainboard
        this.draftPicks.each(function(card){
          playerManager.mainboard.create(card.attributes);
        });

        //clears all firebase draft nodes and places all
        //picks in the player's mainboard
        // currentGame.child("draft-packs").remove();
        // currentGame.child("done-picking").remove();
        // currentGame.child("drafters").remove();
        // currentGame.child("drafting").remove();
        // currentGame.child("draftPool").remove();
        // currentGame.child("draft-picks").remove();
        // currentGame.child("draft-burns").remove();
        // currentGame.child("packs-initialized").remove();
      }
      this.increaseDraftNumber = function(){
        if(++this.draftNumber >= this.numOfDrafters){
          this.draftNumber = 0;
        }
      };
      var self = this;

      //store all the drafters' packs locally
      //not on node, so there's no server side scripting
      //thus, all clients technically have access to all packs
      //currently in the draft
      for(var i = 0; i < this.numOfDrafters; i++){
        this.draftPacks.push(new Cards("new-game/draft-packs/" + i));
      }

      //if draft pool has not been initialized, initialize it
      //other players' packs won't be initialized until the draft pool
      //is initialized
      currentGame.child("draftPool").once("value",function(snapshot){
        if(!snapshot.exists()){
          draftManager.initializeDraftPool();
        }
      });

      //assign each player a draft number
      //should check if the user is present at all
      currentGame.child("drafters").once("value",function(snapshot){
        snapshot.forEach(function(drafter){
          if(drafter.key() === firebase.getAuth().uid){
            return true;
          }
          self.draftNumber++;
        });
      });

      //everyone creates their pack in draft number order
      //this will (hopefully) prevent weird network issues that cause
      //duplicate cards across draft packs
      currentGame.child("packs-initialized").on("value",function(snapshot){
        if(!self.myPackInitialized){
          console.log("my draft number: ",self.draftNumber,"drafter's turn",snapshot.numChildren());
          if(snapshot.val() === null & self.draftNumber === 0){
            self.myPackInitialized = true;

            _.each(draftManager.createPack(15),function(packCard){
              self.draftPacks[self.draftNumber].create(packCard);
            });
            EventHub.trigger("renderPack",self.draftPacks[self.draftNumber]);

            currentGame.child("packs-initialized").child(firebase.getAuth().uid).set(true);
            self.remainingPacks--;
            console.log("i am first and i deserve this");
          } else if(snapshot.numChildren() === self.draftNumber){
            self.myPackInitialized = true;

            _.each(draftManager.createPack(15),function(packCard){
              self.draftPacks[self.draftNumber].create(packCard);
            });

            EventHub.trigger("renderPack",self.draftPacks[self.draftNumber]);

            console.log("not first, setting up my pack",self.draftNumber);
            currentGame.child("packs-initialized").child(firebase.getAuth().uid).set(true);
            self.remainingPacks--;
          }
        }
      });

      EventHub.trigger("startDraft",this);

      //behavior for a draft card being clicked
      EventHub.bind("draftCardClick",function(cardView){
        if(!self.waiting){
          if(!self.picked){
            self.picked = true;
            self.draftPicks.create(cardView.model);
            self.draftPacks[self.draftNumber].remove(cardView.model);
          } else {
            self.burns++;
            self.draftBurns.create(cardView.model);
            self.draftPacks[self.draftNumber].remove(cardView.model);
          }

          if(self.picked && self.burns >= 2){
            self.waiting = true;
            self.picked = false;
            self.burns = 0;

            currentGame.child("done-picking").child(firebase.getAuth().uid).set(true);
          }
        }
      });

      //detect when all drafters have made their picks
      //once they have, increment everyone's draft number
      //then display the pack associated with that draft number
      currentGame.child("done-picking").on("value",function(snapshot){
        if(snapshot.numChildren() === self.numOfDrafters){
          currentGame.child("done-picking").remove();
          self.increaseDraftNumber();
          EventHub.trigger("renderPack",self.draftPacks[self.draftNumber]);
          self.waiting = false;

          //if the packs are empty, generate new ones
          //once again, default card present in collection
          if(self.draftPacks[self.draftNumber].length <= 1){
            console.log("pack switch");
            self.myPackInitialized = false;

            if(self.remainingPacks <= 0){
              console.log("we're done here")
              EventHub.trigger("draftComplete");
              self.endDraft();
              return;
            }

            currentGame.child("packs-initialized").once("value",function(snapshot){
              //ensures that only one client is removing the packs-initialized node

              //draftNumber is 0 indexed
              if(self.draftNumber === snapshot.numChildren() - 1){
                currentGame.child("packs-initialized").remove();
              }
            });
            console.log("remaining packs",self.remainingPacks);
          }
        }
      });
      console.log("glimpse draft manager online");
    }
