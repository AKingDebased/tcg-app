var App = new Marionette.Application({});

App.addInitializer(function(){
  console.log("app started");

  this.gameManager = new GameManager();
  this.rootLayout = new RootLayout();
  this.homeView = new HomeView();

  this.rootLayout.render().mainRegion.show(this.homeView);
});


App.enterDraft = function(){
  var self = this;

  currentGame.child("current-draft/drafting").once("value",function(snapshot){
    if(!snapshot.val()){
      //draft hasn't started
      currentGame.child("current-draft/active-drafters").once("value",function(snapshot){
        //draft is not full
        if(snapshot.numChildren() <= 1){
          currentGame.child("current-draft/active-drafters").child(firebase.getAuth().uid).set(true);
          currentGame.child("current-draft/drafting").on("value",function(snapshot){
            if(snapshot.val()){
              console.log("old fashioned way");
              self.currentDraftManager = new GlimpseDraftManager();
              currentGame.child("current-draft/drafting").off("value");
            }
          });
          EventHub.trigger("notEnoughDrafters");
        }
        //fellow drafter already present
        if(snapshot.numChildren() === 1){
          currentGame.child("current-draft/drafting").transaction(function(currentVal){
            if(currentVal === null){
              return true
            } else if(currentVal === true){
              return;
            }
          },function(error,committed,snapshot){
            if(committed){
              console.log("draft full, starting now");
            } else {
              console.log("draft full, in progress");
            }
          });
        }
      });
    } else {
      //oy vey, long lines
      currentGame.child("current-draft/inactive-drafters").child(firebase.getAuth().uid).once("value",function(snapshot){
        if(snapshot.val() !== null){
          self.currentDraftManager = new GlimpseDraftManager(true,snapshot.val().draftNumber,snapshot.val().picked,snapshot.val().burns,snapshot.val().remainingPacks);
          return;
        }
      });
    }
  });
}

App.start();


//NAUGHTY GLOBAL VARIABLES
//constant var for card back location
var CARD_BACK = "../resources/img/mtg-card-back.jpg"
var LENGTH_OFFSET = 1;

var playerManager;

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

//if a player disconnects, remove them from the current draft

$(".upload-cards").click(function(){
  var cardNames = $(".pool-builder textarea").val().split("\n");
  $(".pool-builder textarea").val("");

  //promise that fetches cards from deckbrew, then
  //fills the global cardPool collection with card models,
  //sorted by color
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

// $(".log-fetched").click(function(){
//   fetchedCards = sortByColor(fetchedCards);
//   var multiverseId;
//   var validEdition;

// populate cards collections with color sorted card models
//   _.each(fetchedCards,function(cards,colorName){
//     _.each(cards,function(card){
//       validEdition = _.find(card.editions,function(edition){
//         return edition.multiverse_id !== 0;
//       })
//       gameManager.cardPool[colorName].create({
//         name:card.name,
//         colors:card.colors,
//         types:card.types,
//         image:validEdition.image_url
//       });
//     })
//   });
//
//   fetchedCards = [];
// });


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
