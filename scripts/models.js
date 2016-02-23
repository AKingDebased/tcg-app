var Game = Backbone.Model.extend({
  defaults:function(){
    return {
      cardPool: {
        white:new Cards(),
        blue:new Cards(),
        black:new Cards(),
        red:new Cards(),
        green:new Cards(),
        colorless:new Cards(),
        multicolor:new Cards()
      }
    }
  },
  randomPack:function(packSize,player){
    var pack = new Cards();
    var colorKeys = Object.keys(this.get("cardPool"));
    var randomColorIndex = Math.floor(Math.random() * colorKeys.length);
    var randomColorKey;
    var randomColor;
    var randomCardIndex;

    while(pack.length < 15){
      do{
        randomColorKey = colorKeys[randomColorIndex];
        randomColor = this.get("cardPool")[randomColorKey];
        console.log(randomColor,randomColor.length);
      } while(randomColor.length <= 0);

      randomCardIndex = Math.floor(Math.random() * randomColor.length);

      pack.push(randomColor.remove(randomColor.at(randomCardIndex)));
    }

    console.log(pack);
  }
});

var Player = Backbone.Model.extend({
  defaults:function(){
    return {
      name:"",
      mainboard:new Cards(),
      sideboard:new Cards()
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
