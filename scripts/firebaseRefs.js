//let's pretend this file is a good idea

var firebase = new Firebase("https://tcg-app.firebaseio.com/");
var users = firebase.child("users");
var currentGame = firebase.child("new-game");
var players = currentGame.child("players");
var playerCount = currentGame.child("playerCount");
var amOnline = firebase.child(".info/connected");
