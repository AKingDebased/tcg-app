//NAUGHTY GLOBAL VARIABLES
//models should eventually all by synced to firebase
var gameManager = new GameManager();
var playerManager;
var EventHub = _.extend({}, Backbone.Events);
var fetchedCards = [];

var logInView = new LogInView();
var deckBuilderView;

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
  var drawnCard = player.get("deck").pop();
  var $cardImage = $("<img>").attr("src",drawnCard.get("image")).addClass("card");

  players.child(me).child("hand").push(drawnCard.toJSON());

  $(".my-hand").append($cardImage);
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
  player.get("mainboard").each(function(card){
    player.get("deck").push(card);
  });

  player.set("deck",player.get("deck").shuffle());
});
