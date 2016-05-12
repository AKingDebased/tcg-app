var App = new Marionette.Application({});

App.addInitializer(function(){
  console.log("app started");

  if(!firebase.getAuth()){
    firebase.authAnonymously(function(error, authData) {
      console.log("authenticated",authData.uid);
    }, {
      //this shit isn't working for some unknown reason
      remember: "sessionOnly"
    });
  }

  firebase.onAuth(function(authData){
    if(authData){
      console.log("authenticated",authData.uid);
      App.rootLayout = new RootLayout();
      App.homeView = new HomeView();

      App.rootLayout.render().mainRegion.show(App.homeView);
    }
  });
});

App.start();

//constant var for card back location
var CARD_BACK = "../resources/img/mtg-card-back.jpg"
var LENGTH_OFFSET = 1;

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
        App.poolUploadHelper.draftPool[colorName].create({
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
