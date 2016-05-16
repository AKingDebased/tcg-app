var GatekeeperModel = Backbone.Firebase.Model.extend({
  //temp link until draft rooms are implemented
  url: "https://tcg-app.firebaseio.com/new-game/current-draft/",
  initialize:function(){
    this.listenToOnce(this,"change:activeDrafters",function(event){
      //if the draft has not yet started
      if(!this.get("drafting")){
        console.log("the draft has not yet started");
        if(!this.get('activeDrafters')){
          console.log("you're the first drafter.");
          var myStatus = {};
          myStatus[firebase.getAuth().uid] = true;

          this.set({
            activeDrafters:myStatus
          });

        } else {
          console.log("there's another drafter here");
          var myStatus = {};
          myStatus[firebase.getAuth().uid] = true;

          if(this.get("activeDrafters").hasOwnProperty(firebase.getAuth().uid)){
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

        if(this.get("activeDrafters").hasOwnProperty(firebase.getAuth().uid)){
          console.log("you're already here, and the draft has already started.");
          //TODO: already present behavior when draft has started
        } else {
          console.log("draft has already started and you're not here. sorry.");
        }
      }
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
