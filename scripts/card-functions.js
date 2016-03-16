//a helper object designed to sync the shared cardpool collection
//with firebase, contain meta data about the room, and provide
//global functions
var GameManager = function() {
  this.firebase = new Firebase("https://tcg-app.firebaseio.com/");
  this.cardPool;
  this.randomPack = function(packSize){
    //an embarrassingly terrible algorithm
    var pack = new Cards();
    var colorKeys = Object.keys(this.get("cardPool"));
    var randomColorIndex;
    var randomColorKey;
    var randomColor;
    var randomCardIndex;
    var randomCard;
    var attempts = 0;
    var emptyColors = {
    };

    //DON'T LOOK AT ME
    //DON'T LOOK AT MY SHAME
    while(pack.length < packSize){
      do{
        if(_.size(emptyColors) >= 7){
          return null;
        }

        randomColorIndex = Math.floor(Math.random() * colorKeys.length)
        randomColorKey = colorKeys[randomColorIndex];
        randomColor = this.get("cardPool")[randomColorKey];

        if(randomColor.length <= 0 && !(randomColorKey in emptyColors)){
          emptyColors[randomColorKey] = 0;
        }
      } while(randomColor.length <= 0);

      randomCardIndex = Math.floor(Math.random() * randomColor.length);
      randomCard = randomColor.remove(randomColor.at(randomCardIndex));

      pack.push(randomCard);
    }

    return pack;
  };
  this.startGame = function(username) {
    var self = this;
    var newPlayer = {};
    newPlayer[username] = true;

    firebase.child("new-game/players").once("value", function(snap) {
      if (snap.val() === null) {
        console.log("creating new game.");
        firebase.child("new-game").set({
          playerCount: 0,
          players:newPlayer
        });
      } else {
        console.log("game in session.");
        firebase.child("new-game/players").update(newPlayer);
      }

      self.cardPool = {
        white: new Cards("new-game", "white"),
        blue: new Cards("new-game", "blue"),
        black: new Cards("new-game", "black"),
        red: new Cards("new-game", "red"),
        green: new Cards("new-game", "green"),
        colorless: new Cards("new-game", "colorless"),
        multicolor: new Cards("new-game", "multicolor")
      };
    });
  }

  console.log("GM online.");
};

var formatForAJAX = function(card){
  //commas need to be handled
  var regex;
  if(card.includes("'")){
    //deckbrew replaces apostrophes with empty string
    regex = new RegExp("'", "g");
    return card.replace(regex, '').toLowerCase().split(" ").join("-"); //HOW DOES REGEX WORK SEND HELP
  };

  if(card.includes(",")){
    regex = new RegExp(",","g");
    return card.replace(regex , '').toLowerCase().split(" ").join("-"); //REGEX CONTINUES TO MYSTIFY LOCAL PROGRAMMER
  }

  return card.toLowerCase().split(" ").join("-");
};

var sortByColor = function(cardPool){
  //returns an object containing arrays of all the sorted cards
  return _.groupBy(cardPool, function(card) {
    if (!card.hasOwnProperty("colors")) {
      return "colorless";
    }
    if (card.colors.length > 1) {
      return "multicolor";
    } else {
      return card.colors[0];
    }
  });
  //underscore, you beautiful bastard
};

var sortABC = function(cards){
  //expects array of card objects, returns new array of sorted string names
  var cardNames = [];

  _.each(cards,function(card){
    cardNames.push(card.name);
  })
  cardNames.sort();
  return cardNames;
};

var setActiveTab = function($tab,$pane,state){
  if(state === "active"){
    $tab.addClass(state);
    $pane.addClass(state);
  } else {
    $tab.removeClass("active");
    $pane.removeClass("active");
  }
};

var addPlayer = function(username){
  players.child(username).transaction(function(player){
    if(player === null){
      if(playersCount >= 2){
        return;
      } else {
        var newPlayer = {};

        return newPlayer[username] = true;
      }
    } else {
      return player;
    }
  },function(error,committed,snapshot){
    if(error){
      alert("shit went wrong");
    } else if(committed){
      alert(username + " has entered the game!");
    } else if(!committed){
      alert(username + " is already in the room, or room is full.");
      location.reload();
    } else {
      alert("god help you");
    }
  });
}
