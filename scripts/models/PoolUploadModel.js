var App = App || new Marionette.Application({});

(function(){
  "use strict";

  App.PoolUploadModel = Backbone.Firebase.Model.extend({
    url:"https://tcg-app.firebaseio.com/new-game/current-draft",
    initialize:function(){
      console.log("pool upload model online");
      var poolChannel = Backbone.Radio.channel('pool');
      var self = this;

      poolChannel.reply("getDraftPool",function(){
        return self.get("draftPool");
      });
    },
    defaults:function(){
      return{
        poolUploaded:false,
        draftPool:[]
      };
    },
    uploadCards:function(draftPool){
      if(!this.get("poolUploaded")){
        console.log("uploading pool");
        var self = this;
        var cardNames = draftPool.split("\n");
        App.vent.trigger("clearPoolEl");

        //promise that fetches cards from deckbrew, then
        //fills the draft pool (unsorted)
        var uploadCardsPromise = new Promise(function(resolve,reject){
          var fetchedCards = [];
          _.each(cardNames,function(currentCard){
            $.get("https://api.deckbrew.com/mtg/cards/" + App.formatForAJAX(currentCard),function(fetchedCard){
              fetchedCards.push(fetchedCard);

              if(fetchedCards.length === cardNames.length){
                resolve(fetchedCards);
              }
            });
          });
        }).then(function(fetchedCards){
          var multiverseId;
          var validEdition;
          var toUpload = [];

          _.each(fetchedCards,function(card){
            validEdition = _.find(card.editions,function(edition){
              return edition.multiverse_id !== 0;
            })

            toUpload.push({
              name:card.name,
              colors:card.colors || "colorless",
              types:card.types,
              image:validEdition.image_url
            });
          });

          //if man won't upload cards, the devil will do it

          self.set("poolUploaded",true);
          self.set("draftPool",toUpload)
          self.save();
        });
      } else {
        console.log("pool already present");
      }
    }
  });
})();
