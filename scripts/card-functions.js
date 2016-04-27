//utility function for debugging
var clearDraft = function(){
  currentGame.child("draft-packs").remove();
  currentGame.child("done-picking").remove();
  currentGame.child("drafters").remove();
  currentGame.child("drafting").remove();
  currentGame.child("draftPool").remove();
  currentGame.child("draft-picks").remove();
  currentGame.child("draft-burns").remove();
  currentGame.child("packs-initialized").remove();
}

//debugging
var dani = function(){
  $(".email").val("dani.galipeau@gmail.com");
  $(".password").val("dani");
}

//debugging
var me = function(){
  $(".email").val("akingdebased@gmail.com");
  $(".password").val("TheSunSails15");
}

//terrible place for this
var EventHub = _.extend({}, Backbone.Events);

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

var pxToPercent = function(pos,axis){
  if(axis === "x"){
    return (pos / window.innerWidth) * 100;
  } else if (axis === "y"){
    return (pos / window.innerHeight) * 100;
  }
  return pos;
}

var percentToPx = function(percent,axis){
  if(axis === "x"){
    return (percent / 100) * window.innerWidth;
  } else if (axis === "y"){
    return (percent / 100) * window.innerHeight;
  }
  return percent;
}
