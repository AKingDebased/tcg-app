var PoolUploadModel = Backbone.Firebase.Model.extend({
  url:"https://tcg-app.firebaseio.com/new-game/current-draft",
  initialize:function(){
    console.log("pool upload model online");
  },
  defaults:function(){
    return{
      poolUploaded:false
    };
  },
  draftPool:new Cards("new-game/current-draft/draft-pool"),
  uploadCards:function(draftPool){
    if(!this.get("poolUploaded")){
      console.log("uploading pool");
      var self = this;
      var cardNames = draftPool.split("\n");
      App.vent.trigger("clearPoolEl");

      //promise that fetches cards from deckbrew, then
      //fills the draft pool (unsorted)
      var uploadCardsPromise = new Promise(function(resolve,reject){
        var self = this;
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

          self.draftPool.create({
            name:card.name,
            colors:card.colors,
            types:card.types,
            image:validEdition.image_url
          });
        });

        self.set("poolUploaded",true);
      });
    } else {
      console.log("pool already present");
    }
  }
});
