var App = App || new Marionette.Application({});

(function(){
  "use strict";

  App.on("before:start",function(){
    console.log("app started");

    App.rootLayout = new App.RootLayout();
    App.homeView = new App.HomeView();

    App.rootLayout.render().mainRegion.show(App.homeView);

    firebase.auth().signInAnonymously().catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;

      console.log("error logging in",errorMessage,errorCode);
    });

    auth.onAuthStateChanged(function(user) {
      if (user) {
        if(!uid){
          uid = user.uid;
          console.log("authenticated",uid);
        }
      } else {
        console.log("gonna miss you.");
      }
    });

  });

  App.start();
})()
