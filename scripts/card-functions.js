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
