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
