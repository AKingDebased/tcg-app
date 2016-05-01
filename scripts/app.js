//NAUGHTY GLOBAL VARIABLES
//constant var for card back location
var CARD_BACK = "../resources/img/mtg-card-back.jpg"
var LENGTH_OFFSET = 1;

var gameManager = new GameManager();
var draftManager = new DraftManager();
var playerManager;

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

$(".upload-cards").click(function(){
  var cardNames = $(".pool-builder textarea").val().split("\n");
  $(".pool-builder textarea").val("");

  var uploadCardsPromise = new Promise(function(resolve,reject){
    var fetchedCards = [];

    _.each(cardNames,function(currentCard){
      $.get("https://api.deckbrew.com/mtg/cards/" + formatForAJAX(currentCard),function(fetchedCard){
        fetchedCards.push(fetchedCard);

        if(fetchedCards.length === cardNames.length){
          console.log("resolving")
          resolve(fetchedCards);
        }
      });
    });
  }).then(function(fetchedCards){
    console.log("populating cards");
    fetchedCards = sortByColor(fetchedCards);
    var multiverseId;
    var validEdition;

    // populate cards collections with color sorted card models
    _.each(fetchedCards,function(cards,colorName){
      _.each(cards,function(card){
        validEdition = _.find(card.editions,function(edition){
          return edition.multiverse_id !== 0;
        })
        gameManager.cardPool[colorName].create({
          name:card.name,
          colors:card.colors,
          types:card.types,
          image:validEdition.image_url
        });
      })
    });
  });
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
  var validEdition;

  // populate cards collections with color sorted card models
  _.each(fetchedCards,function(cards,colorName){
    _.each(cards,function(card){
      validEdition = _.find(card.editions,function(edition){
        return edition.multiverse_id !== 0;
      })
      gameManager.cardPool[colorName].create({
        name:card.name,
        colors:card.colors,
        types:card.types,
        image:validEdition.image_url
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
