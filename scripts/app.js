$(function(){
  //models should eventually be fetched from firebase
  var player = new Player();
  var game = new Game({
    cardPool: new Cards()
  });

  $(".add-to-pool").click(function(){
    var cardsString = $(".pool-builder textarea").val().split("\n");
    $(".pool-builder textarea").val("");

    _.each(cardsString,function(currentCard){
      //asynchronicity needs to be handled. maybe use a promise?
      $.get("https://api.deckbrew.com/mtg/cards/" + formatForAJAX(currentCard),function(fetchedCard){
        game.get("cardPool").add(new Card({
          name: fetchedCard.name,
          colors: fetchedCard.colors,
          types: fetchedCard.types
        }));
      });
    });
    //need a promise here to load sorted cards to DOM
  });

  //card pool entry menu
  $(".pool-view").click(function(){
    setActiveTab($(".draft-pool-tab"),$(".draft-pool-container"),"active");
  });

  $(".builder-view").click(function(){
    setActiveTab($(".deck-builder-container"),$(".deck-builder-tab"),"active");
  });

  $(".log-fetched").click(function(){
    console.log(game.get("cardPool").toJSON())
    console.log(sortByColor(game.get("cardPool")));
    //populateColorCols(sortByColor(game.cardPool.toJSON()));
  });

  //pool/builder modal
  $(".draft-pool-tab").click(function(){
    setActiveTab($(".deck-builder-tab"),$(".draft-pool-container"),"active");
  });

  $(".deck-builder-tab").click(function(){
    setActiveTab($(".deck-builder-tab"),$(".draft-pool-container"),"inactive");
  });

  $('.myModal').on('hidden.bs.modal', function () {
    setActiveTab($(".draft-pool-tab"),$(".draft-pool-container"),"inactive");
    setActiveTab($(".deck-builder-container"),$(".deck-builder-tab"),"inactive");
  })

  //draft builder tab
  $(".randMainboard").click(function(){
    //change myCardPool & fetchedCards variables
    myCardPool = randomMainboard(fetchedCards);
    populateMainboard(player.mainboard);
  });

  $(".main-board").on("click","li",function(){
    //temporary until Backbone migration
    addToBoard($(this).text(),"side");
    $(this).remove();
  });

  $(".side-board").on("click","li",function(){
    //temporary until Backbone migration
    addToBoard($(this).text(),"main");
    $(this).remove();
  });

  // $(".save-deck").click(function(){
  //
  // });
});
