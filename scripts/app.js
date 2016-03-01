//NAUGHTY GLOBAL VARIABLES
//models should eventually all by synched to firebase
var GlobalGame = new Game();
var EventHub = _.extend({}, Backbone.Events);

$(function(){
  var fetchedCards = [];

  var player = new Player()
  var testPoolView = new CardPoolView();
  var deckBuilderView = new DeckBuilderView({model:player});


  $(".add-to-pool").click(function(){
    var cardsString = $(".pool-builder textarea").val().split("\n");
    $(".pool-builder textarea").val("");

    _.each(cardsString,function(currentCard){
      //asynchronicity needs to be handled. maybe use a promise?
      $.get("https://api.deckbrew.com/mtg/cards/" + formatForAJAX(currentCard),function(fetchedCard){
        fetchedCards.push(fetchedCard);
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
    fetchedCards = sortByColor(fetchedCards);

    //populate cards collections with color sorted card models
    _.each(fetchedCards,function(cards,colorName){
      _.each(cards,function(card){
        GlobalGame.get("cardPool")[colorName].add(new Card({
          name:card.name,
          colors:card.colors,
          types:card.types,
          image:card.editions[0].image_url
        }));
      })
    });
  });

  //pool & builder modal
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