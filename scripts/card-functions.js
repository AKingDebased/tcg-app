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

// var createNameList = function(cards){
//   var $el = $("<ul>");
//
//   _.each(cards,function(card){
//     $el.append($("<li>").append(card.name));
//   });
//
//   return $el;
// };

// var populateColorCols = function(fetchedCards){
//   //currently unalphabetized
//   $(".white-col").html(createNameList(fetchedCards.white));
//   $(".blue-col").html(createNameList(fetchedCards.blue));
//   $(".black-col").html(createNameList(fetchedCards.black));
//   $(".red-col").html(createNameList(fetchedCards.red));
//   $(".green-col").html(createNameList(fetchedCards.green));
//   $(".multi-col").html(createNameList(fetchedCards.multicolor));
//   $(".colorless-col").html(createNameList(fetchedCards.colorless));
// };

// var populateMainboard = function(cards){
//   _.each(cards,function(card){
//     $("<li>").text(card.name).appendTo($(".main-board"));
//   });
// };

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

var randomMainboard = function(fetchedCards){
  var pool = {
    mainboard:[],
    sideboard:[]
  };

  while(pool.mainboard.length < 45){
    randNum = _.random(0,fetchedCards.length - 1);
    pool.mainboard.push(fetchedCards[randNum]);
  }

  return pool;
};

//temporary until Backbone migration
// var displayOnBoard = function(cardName,board){
//   $("<li>").text(cardName).appendTo($("." + board + "-board"));
// }

// var saveDeck = function(deck){
//   playerPool.maindeck = {}
//
//   return playerPool;
// }
