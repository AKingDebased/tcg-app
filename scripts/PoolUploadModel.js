var PoolUploadModel = Backbone.Model.extend({
  initialize:function(){
    console.log("pool upload model online",this);
  },
  defaults:function(){
    return{
      draftPool:new Cards("new-game/current-draft/" + firebase.getAuth().uid + "/draft-pool")
    };
  },
  uploadCards:function(draftPool){
    var self = this;
    var cardNames = draftPool.split("\n");
    App.vent.trigger("clearPoolEl");

    //promise that fetches cards from deckbrew, then
    //fills the draft pool (unsorted)
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
      var multiverseId;
      var validEdition;

      _.each(fetchedCards,function(card){
        validEdition = _.find(card.editions,function(edition){
          return edition.multiverse_id !== 0;
        })

        self.get("draftPool").create({
          name:card.name,
          colors:card.colors,
          types:card.types,
          image:validEdition.image_url
        });
      });
    });
  }
});
