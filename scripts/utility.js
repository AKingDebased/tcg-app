var App = App || new Marionette.Application({});

//globally available firebase references
var auth = firebase.auth();
var database = firebase.database();
var uid;

var users = database.ref("users");
var currentGame = database.ref("new-game");
var currentDraft = currentGame.child("current-draft");
var players = currentGame.child("players");
var playerCount = currentGame.child("playerCount");
var activeDrafters = currentDraft.child("activeDrafters");


(function(){
  "use strict";

  App.createPack = function(pool,packSize){
    var count = 0;
    var pack = [];

    var randomIndex;
    for(var i = 0; i < packSize; i++){
      randomIndex = _.random(0,pool.length - 1)

      pack.push(pool.splice(randomIndex,1)[0]);
      count++;
    }

    return pack;
  }

  App.clearDraft = function(){
    currentGame.child("current-draft").remove();
  }

  App.formatForAJAX = function(card){
    card = card.toLowerCase();
    var regex;

    if(card.includes("'")){
      //deckbrew replaces apostrophes with empty string
      regex = new RegExp("'", "g");
      card = card.replace(regex, ''); //HOW DOES REGEX WORK SEND HELP
    };

    if(card.includes(",")){
      regex = new RegExp(",","g");
      card = card.replace(regex, ''); //REGEX CONTINUES TO MYSTIFY LOCAL PROGRAMMER
    }

    if(card.includes("aet")){
      regex = new RegExp("aet","g");
      card = card.replace(regex, encodeURI("æt")); //regex, an unsolved mystery
    }

    return card.split(" ").join("-");
  };

  App.sortByColor = function(cardPool){
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

  App.sortABC = function(cards){
    //expects array of card objects, returns new array of sorted string names
    var cardNames = [];

    _.each(cards,function(card){
      cardNames.push(card.name);
    })
    cardNames.sort();
    return cardNames;
  };
})();
