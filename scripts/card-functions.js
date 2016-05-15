//utility function for debugging
var clearDraft = function(){
  currentGame.child("current-draft").remove();
}

var formatForAJAX = function(card){
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
