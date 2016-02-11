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

  var sortByColor = function(cardPool){



  };

  var sortABC = function(cards){
    //expects array of card objects, returns new array of sorted string names
    var cardNames = [];

    cards.forEach(function(card){
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

    currentPool.forEach(function(currentCard){
      //asynchronicity needs to be handled. maybe use a promise?
      $.get("https://api.deckbrew.com/mtg/cards/" + formatForAJAX(currentCard),function(fetchedCard){
        fetchedCards.push(fetchedCard);
      });
    });
    //$(".draft-pool").html(cardPoolToTable(currentPool));
  });

  $(".pool-view").click(function(){
    setActiveTab($(".draft-pool-tab"),$(".draft-pool-container"),"active");
  });

  $(".builder-view").click(function(){
    setActiveTab($(".deck-builder-container"),$(".deck-builder-tab"),"active");
  });

  $(".log-fetched").click(function(){
    console.log(fetchedCards);
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
