var GameManager = function() {
  this.firebase = new Firebase("https://tcg-app.firebaseio.com/");
  this.cardPool;
  this.randomPack = function(packSize){
    //an embarrassingly terrible algorithm
    var pack = [];
    var colorKeys = Object.keys(this.cardPool);
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
