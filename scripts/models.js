// var Player = Backbone.Model.extend({
//   defaults : function(){
//     return {
//       username : "",
//       deck: [],
//       cardPool: {}
//     }
//   }
// });

var Card = Backbone.Model.extend({
  defaults:{
    name:"",
    colors:[],
    types:[]
  }
});

var Cards = Backbone.Collection.extend({
  model: Card
});
