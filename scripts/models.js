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
    //an embarrassingly terrible algorithm
    var pack = new Cards();
    var colorKeys = Object.keys(this.get("cardPool"));
    var randomColorIndex;
    var randomColorKey;
    var randomColor;
    var randomCardIndex;
    var randomCard;
    var attempts = 0;
    var emptyColors = {
    };

    //DON'T LOOK AT ME
    //DON'T LOOK AT MY SHAME
    while(pack.length < packSize){
      do{
        if(_.size(emptyColors) >= 7){
          return pack;
        }

        randomColorIndex = Math.floor(Math.random() * colorKeys.length)
        randomColorKey = colorKeys[randomColorIndex];
        randomColor = this.get("cardPool")[randomColorKey];

        if(randomColor.length <= 0 && !(randomColorKey in emptyColors)){
          emptyColors[randomColorKey] = 0;
        }
      } while(randomColor.length <= 0);

      randomCardIndex = Math.floor(Math.random() * randomColor.length);
      randomCard = randomColor.remove(randomColor.at(randomCardIndex));

      pack.push(randomCard);
    }

    return pack;
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
