//NAUGHTY GLOBAL VARIABLES
//constant var for card back location
var CARD_BACK = "../resources/img/mtg-card-back.jpg"

var gameManager = new GameManager();
var draftManager = new DraftManager();
var playerManager;
var fetchedCards = [];

var logInView = new LogInView();
var deckBuilderView;

var handView;
var opponentHandView;
var draftView;

$('body').popover({
  selector:'[data-toggle="popover"]',
  trigger:"hover",
  content:function(){
    return $("<img>").attr("src",$(this).attr("src"));
  },
  placement:"auto",
  html:true
});

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
  var multiverseId;

  // populate cards collections with color sorted card models
  _.each(fetchedCards,function(cards,colorName){
    _.each(cards,function(card){
      //occasionally, particular card editions do not come with art
      //thus, this loop
      _.each(card.editions,function(edition){
        if(edition["multiverse_id"] !== 0){
          multiverseId = edition["multiverse_id"];
        }
      });
      gameManager.cardPool[colorName].create({
        name:card.name,
        colors:card.colors,
        types:card.types,
        //deckbrew removed image support, temp fix
        image:"https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid="+ multiverseId + "&type=card"
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
