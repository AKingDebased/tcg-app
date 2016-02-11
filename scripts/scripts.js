$(function(){
  //temporary global variable to contain card pool
  //should eventually be on firebase
  var currentPool;
  var fetchedCards = [];

  var formatForAJAX = function(card){
    //commas need to be handled
    if(card.includes("'")){
      //deckbrew replaces apostrophes with empty string
      return card.replace(/'/g, '').toLowerCase().split(" ").join("-"); //HOW DOES REGEX WORK SEND HELP
    }
    return card.toLowerCase().split(" ").join("-");
  }

  var createNameList = function(cards){
    var $el = $("<ul>");

    _.each(cards,function(card){
      $el.append($("<li>").append(card.name));
    });

    return $el;
  }

  var populateColorCols = function(sortedCards){
    //currently unalphabetized
    $(".white-col").html(createNameList(sortedCards.white));
    $(".blue-col").html(createNameList(sortedCards.blue));
    $(".black-col").html(createNameList(sortedCards.black));
    $(".red-col").html(createNameList(sortedCards.red));
    $(".green-col").html(createNameList(sortedCards.green));
    $(".multi-col").html(createNameList(sortedCards.multicolor));
    $(".colorless-col").html(createNameList(sortedCards.colorless));
  }

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
  }

  var setActiveTab = function($tab,$pane,state){
    if(state === "active"){
      $tab.addClass(state);
      $pane.addClass(state);
    } else {
      $tab.removeClass("active");
      $pane.removeClass("active");
    }
  }

  $(".add-to-pool").click(function(){
    currentPool = $(".pool-builder textarea").val().split("\n");
    $(".pool-builder textarea").val("");

    _.each(currentPool,function(currentCard){
      //asynchronicity needs to be handled. maybe use a promise?
      $.get("https://api.deckbrew.com/mtg/cards/" + formatForAJAX(currentCard),function(fetchedCard){
        fetchedCards.push(fetchedCard);
      });
    });
    //need a promise here to load sorted cards to DOM
  });

  $(".pool-view").click(function(){
    setActiveTab($(".draft-pool-tab"),$(".draft-pool-container"),"active");
  });

  $(".builder-view").click(function(){
    setActiveTab($(".deck-builder-container"),$(".deck-builder-tab"),"active");
  });

  $(".log-fetched").click(function(){
    console.log("sorted", sortByColor(fetchedCards));
    populateColorCols(sortByColor(fetchedCards));
  });

  $(".draft-pool-tab").click(function(){
    $(this).tab('show');
  });

  $(".deck-builder-tab").click(function(){
    $(this).tab('show');
  });

  $('.myModal').on('hidden.bs.modal', function () {
    setActiveTab($(".draft-pool-tab"),$(".draft-pool-container"),"inactive");
    setActiveTab($(".deck-builder-container"),$(".deck-builder-tab"),"inactive");
  })
});
