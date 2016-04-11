//NAUGHTY GLOBAL VARIABLES

//constant var for card back location
var CARD_BACK = "../resources/img/mtg-card-back.jpg"

var gameManager = new GameManager();
var playerManager;
var EventHub = _.extend({}, Backbone.Events);
var fetchedCards = [];

var logInView = new LogInView();
var deckBuilderView;

var handView;
var opponentHandView;

//make my hand sortable - should be put in a better place
// $("#sortable").sortable({
//   drag:function(event){
//     card.set({
//       "posX":event.pageX,
//       "posY":event.pageY
//     });
//   },
//   stop:function(){
//     console.log("dropped");
//   },
//   revert:true
// });

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

  // populate cards collections with color sorted card models
  _.each(fetchedCards,function(cards,colorName){
    _.each(cards,function(card){
      gameManager.cardPool[colorName].create({
        name:card.name,
        colors:card.colors,
        types:card.types,
        image:card.editions[0].image_url
      });
    })
  });

  fetchedCards = [];
});

//hand
$(".deck").on("dblclick",function(){
  EventHub.trigger("drawCard");
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
$(".save-deck").click(function(){
  playerManager.mainboard.each(function(card){
    //fucking Cards bug, man
    if(card.get("name") === "none"){
      return;
    }
    playerManager.deck.create(card.attributes);
  });

  playerManager.deck.shuffle();
});
