//prevent memory leaks when removing views from DOM
Backbone.View.prototype.close = function(){
  this.remove();
  this.unbind();
  if(this.onClose){
    this.onClose();
  }
};

var LogInView = Backbone.View.extend({
  el: "body",
  template: _.template($(".log-in-template").html()),
  events:{
    "click .log-in":"logIn",
    "keydown .password":"logIn"
  },
  logIn:function(event){
    //only log in if button is clicked or enter key is pressed
    if(!(event.which === 1 || event.which === 13)){
      return;
    }

    var $email = $(".email").val();
    var $password = $(".password").val();
    var userInfo = {};
    var self = this;

    firebase.createUser({
      email: $email,
      password: $password
    }, function(error, userData) {
      if (error) {
        //do error shit

      } else {
        console.log("Successfully created user account with uid:", userData.uid);
      }
    });

    firebase.authWithPassword({
      email    : $email,
      password : $password
    }, function(error, authData) {
      if(error){
        console.log("error logging in: " + error);
      } else {
        self.fadeOut();
        gameManager.startGame();
      }
    });
  },
  fadeOut:function(){
    //should remove log in screen from DOM
    this.$(".log-in-screen").fadeOut(1000);
    //this.close();
  },
  initialize:function(){
    _.bindAll(this,"render","logIn","fadeOut");
    this.render();
  },
  render:function(){
    this.$el.append(this.template);
  },
});

var CardPoolItemView = Backbone.View.extend({
  tagName:"li",
  initialize:function(){
    _.bindAll(this,"render");
  },
  events:{
    "click":function(){
      EventHub.trigger("clickedPoolItem",this);
    }
  },
  renderMainboard:function(){
    this.$el.html(this.model.get("name")).addClass("mainboard-item");
    return this;
  },
  renderSideboard:function(){
    this.$el.html(this.model.get("name")).addClass("sideboard-item");
    return this;
  },
  render:function(){
    this.$el.html(this.model.get("name"));
    return this;
  }
});

var CardPoolColView = Backbone.View.extend({
  tagName:"ul",
  itemViews:[],
  initialize:function(){
    _.bindAll(this,"render");
    this.listenTo(this.collection,"add",function(card){
      this.addItemView(card);
      this.renderAdded();
    });
  },
  addItemView:function(cardModel){
    this.itemViews.push(new CardPoolItemView({
      model:cardModel
    }));
  },
  renderAdded:function(){
    this.$el.append(this.itemViews[this.itemViews.length-1].render().$el);
    return this;
  }
});

var CardPoolView = Backbone.View.extend({
  el: ".draft-pool",
  columns:[],
  initialize: function(){
    _.bindAll(this,"render","createColumns");
    this.createColumns();
    this.render();
  },
  createColumns:function(){
    var self = this;
    _.each(gameManager.cardPool,function(color,colorName){
      self.columns.push(new CardPoolColView({
        className:"draft-col " + colorName,
        collection: color
      }));
    })
  },
  render:function(){
    var self = this;
    _.each(this.columns,function(column){
      self.$el.append(column.render().$el);
    })
  }
});

var DeckBuilderView = Backbone.View.extend({
  el:".deck-builder-container",
  initialize:function(){
    var self = this;

    playerManager.sideboard.once("sync",function(){
      if(playerManager.sideboard.length > 0){
        playerManager.sideboard.each(function(card){
          if(card.get("name") === "none"){
            return;
          }
          self.addToSideboard(card);
        });
      }
    });

    this.listenTo(playerManager.mainboard,"add",this.addToMainboard);
    this.listenTo(playerManager.mainboard,"remove",this.addToSideboard);
    this.listenTo(playerManager.sideBoard,"remove",this.addToMainboard);

    var self = this;
    EventHub.bind("clickedPoolItem",function(poolItem){
      if(poolItem.$el.attr("class") === "mainboard-item"){
        playerManager.sideboard.push(playerManager.mainboard.remove(poolItem.model));
      } else if(poolItem.$el.attr("class") === "sideboard-item"){
        playerManager.mainboard.push(playerManager.sideboard.remove(poolItem.model));
      }
      poolItem.close();
    });
  },
  addToMainboard:function(card){
    var cardItemView = new CardPoolItemView({
      model:card
    })

    this.$(".mainboard").append(cardItemView.renderMainboard().$el);
  },
  addToSideboard:function(card){
    var cardItemView = new CardPoolItemView({
      model:card
    })

    this.$(".sideboard").append(cardItemView.renderSideboard().$el);
  },

  events:{
    "click .randMainboard":function(){
      var randPack = gameManager.randomPack(5);

      //backbonefire 'add' method only accepts
      //plain objects as arguments, not models
      _.each(randPack,function(card){
        playerManager.mainboard.create(card);
      });
    }
  }
});

var ClientHandView = Backbone.View.extend({
  el:".my-hand",
  initialize:function(){
    var self = this;

    EventHub.bind("drawCard",function(){
      self.drawCard();
    });

    playerManager.hand.on("add",function(card){
      self.displayDraw(card);
    })
  },
  drawCard:function(){
    //remove returns an array, for reasons unknown. why can't i just pop() god dammit
    playerManager.hand.create(playerManager.deck.remove(playerManager.deck.at(0))[0]);
  },
  displayDraw:function(card){
    //should specify the jQuery ui bits elsewhere
    var $cardImage = $("<img>");
    $cardImage.attr("src",card.attributes.image).addClass("card").draggable({
      //half card height and with
      cursorAt:{
        top:72.5,
        left:50.7
      },
      drag:function(event,ui){
        card.set({
          //temporary fix to account for mouse offset on card
          "xPercent":pxToPercent(event.clientX + 50.7,"x"),
          "yPercent":pxToPercent(event.clientY + 72.5,"y")
        });
      },
      stop:function(){
        card.set({
          revealed:true
        });
      }
    });

    this.$el.append($cardImage);
  }
});

var OpponentHandView = Backbone.View.extend({
  el:".opponent-hand",
  initialize:function(){
    var self = this;
    this.collection.on("add",function(card){
      self.displayDraw(card);
    });

    this.collection.on("change",function(card){
      $(".card[cardid='" + card.attributes.id + "']").css({
        top:window.innerHeight - percentToPx(card.attributes.yPercent,"y") + "px",
        left:window.innerWidth - percentToPx(card.attributes.xPercent,"x") + "px"
      });
    });

    //should only trigger off of change in 'revealed'
    //currently triggers off ANY change
    this.collection.on("change",function(card){
      if(card.attributes.revealed){
        self.$(".card[cardid='" + card.attributes.id + "']").attr("src",card.attributes.image);
      }
    });
  },
  displayDraw:function(card){
    var $cardImage = $("<img>").attr({
      src:CARD_BACK,
      cardID:card.attributes.id
    }).addClass("card opponent-card");

    this.$el.prepend($cardImage);
  }
});
