var Card = Backbone.Model.extend({
  defaults:function(){
    return{
      name:"none",
      colors:["none"],
      types:["none"],
      image:"none",
      posX:"0",
      posY:"0",
      revealed:false
    }
  }
});

var GatekeeperModel = Backbone.Firebase.Model.extend({
  //temp link until draft rooms are implemented
  url: "https://tcg-app.firebaseio.com/new-game/current-draft/",
  initialize:function(){
    this.listenToOnce(this,"sync",function(){
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
          console.log("you're already here");
          //TODO: already present behavior
        }

        myStatus = Object.assign(myStatus,this.get("activeDrafters"));
        this.set({
          activeDrafters:myStatus
        });
      }
    })
  },
  defaults:function(){
    return{
      activeDrafters:{},
      drafting:false
    }
  }
});
