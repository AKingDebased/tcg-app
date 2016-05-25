var App = App || new Marionette.Application({});

(function(){
  "use strict";

  App.GatekeeperModel = Backbone.Firebase.Model.extend({
    //temp link until draft rooms are implemented
    url: "https://tcg-app.firebaseio.com/new-game/current-draft/",
    initialize:function(){
      var self = this;

      this.listenTo(App.vent,"startDrafting",function(){
        self.set("drafting",true);
      });

      this.listenToOnce(this,"change:activeDrafters",function(event){
        //if the draft has not yet started
        if(!this.get("drafting")){
          console.log("the draft has not yet started");
          if(!this.get('activeDrafters')){
            var myStatus = {};
            myStatus[uid] = true;

            this.set({
              activeDrafters:myStatus
            });

          } else {
            var myStatus = {};
            myStatus[uid] = true;

            if(this.get("activeDrafters").hasOwnProperty(uid)){
              console.log("you're already here, but the draft hasn't started yet.");
              //TODO: already present behavior
            }

            myStatus = Object.assign(myStatus,this.get("activeDrafters"));
            this.set({
              activeDrafters:myStatus
            });
          }
        } else {
          console.log("the draft has already started.");

          if(this.get("activeDrafters").hasOwnProperty(uid)){
            console.log("you're already here, and the draft has already started.");
            //TODO: already present behavior when draft has started
          } else {
            console.log("draft has already started and you're not here. sorry.");
          }
        }

        console.log("num of drafters:",Object.keys(this.get("activeDrafters")).length);
      })
    },
    defaults:function(){
      return{
        activeDrafters:{},
        drafting:false,
        maxDrafters:2
      }
    }
  });
})();
