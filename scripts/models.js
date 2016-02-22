// var Player = Backbone.Model.extend({
//   defaults : function(){
//     return {
//       username : "",
//       deck: [],
//       cardPool: {}
//     }
//   }
// });
var Game = Backbone.Model.extend({
  defaults:function(){
    return {
      cardPool: []
    }
  }
});

var Player = Backbone.Model.extend({
  defaults:function(){
    return {
      name:"",
      mainboard:[],
      sideboard:[]
    }
  }
});

var Card = Backbone.Model.extend({
  defaults:function(){
    return{
      name:"",
      colors:undefined,
      types:[],
      image:""
    }
  }
});
