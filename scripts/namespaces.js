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
        console.log("pool is filling up");
        _.each(gameManager.cardPool,function(color){
          color.forEach(function(card){
            if(card.get("name") === "none"){
              return;
            }
            self.draftPool.create(card.attributes);
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
          this.currentDraftManager = new GlimpseDraftManager();
        }
      });
    };

    var GlimpseDraftManager = function(){
      this.pick = 0;
      this.burns = 0;
      this.remainingPacks = 18;
      this.myPack = new Cards("new-game/draft-packs/" + firebase.getAuth().uid);
      this.opponentPack = new Cards("new-game/draft-packs" + playerManager.opponentID);
      var self = this;

      EventHub.trigger("startDraft",this);

      //if draft pool has not been initialized, initialized it
      //also creates first pack
      currentGame.child("draftPool").once("value",function(snapshot){
        if(!snapshot.exists()){
          draftManager.initializeDraftPool();
        }

        _.each(draftManager.createPack(15),function(packCard){
          self.myPack.create(packCard);
        });
      });

      console.log("glimpse draft manager online");
    }
