var RootLayout = Marionette.LayoutView.extend({
  el:"body",
  template: _.template("<div class=main-region></div>"),
  initialize:function(){
    console.log("app layout view online");
  },
  regions:{
    mainRegion:".main-region"
  },
});

var GatekeeperView = Marionette.ItemView.extend({
  attributes:{
    class:"gatekeeper"
  },
  template:function(){
    var templateHTML = $(".gatekeeper").html()
    console.log(templateHTML);
    return _.template("lol")
  }
});

var HomeView = Backbone.View.extend({
  attributes:{
    class:"home"
  },
  initialize:function(){
    console.log("home view online");
    _.bindAll(this,"displayGlimpseInfo");
  },
  events:{
    "click .start-glimpse":"displayGlimpseInfo",
    "click .start-draft":function(){
      //empty the region when the modal is fully hidden
      $(".draft-info-modal").modal("hide").on("hidden.bs.modal",function(){
        App.rootLayout.mainRegion.empty();
        App.gatekeeperView = new GatekeeperView();
        App.rootLayout.mainRegion.show(App.gatekeeperView);
      });
    }
  },
  displayGlimpseInfo:function(){
    //these 4 display functions should be condensed down to one
    $(".draft-info-modal").modal('show');
    $.get('templates/glimpse-draft-info.html', function (data) {
      $(".draft-info").html(_.template(data));
    }, 'html');
  },
  displayGridInfo:function(){

  },
  displayWinstonInfo:function(){

  },
  displayWinchesterInfo:function(){

  },
  render:function(){
    var self = this;
    $.get('templates/home.html', function (data) {
      self.$el.html(_.template(data));
    }, 'html');
  }
});












//prevent memory leaks when removing views from DOM
Backbone.View.prototype.close = function(){
  this.remove();
  this.unbind();
  if(this.onClose){
    this.onClose();
  }
};


var CardPoolItemView = Backbone.View.extend({
  tagName:"li",
  initialize:function(){
    _.bindAll(this,"render","renderInMainboard","renderInSideboard");

    var self = this;
    //failsafe, in case a Card model is ever removed
    //from the mainboard/sideboard without being clicked on
    this.listenTo(this.model,"remove",function(event){
      self.close();
    });
  },
  events:{
    "click":function(){
      EventHub.trigger("clickedPoolItem",this);
    }
  },
  renderInMainboard:function(){
    this.$el.html(this.model.get("name")).addClass("mainboard-item");
    return this;
  },
  renderInSideboard:function(){
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
    _.bindAll(this,"renderAdded","addItemView");
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


var DraftInfoView = Backbone.View.extend({
  el:".draft-info"

});

var DeckBuilderView = Backbone.View.extend({
  el:".deck-builder-container",
  initialize:function(){
    _.bindAll(this,"addToMainboard","addToSideboard");

    var self = this;

    this.listenTo(playerManager.mainboard,"add",this.addToMainboard);
    this.listenTo(playerManager.sideboard,"add",this.addToSideboard);

    var self = this;
    EventHub.bind("clickedPoolItem",function(poolItem){
      //this should be done with listeners on the models
      //but this method prevents weirdness when mainboard/sideboard
      //items are removed from other sources, like a draft ending
      if(poolItem.$el.attr("class") === "mainboard-item"){
        playerManager.sideboard.push(playerManager.mainboard.remove(poolItem.model));
      } else if(poolItem.$el.attr("class") === "sideboard-item"){
        playerManager.mainboard.push(playerManager.sideboard.remove(poolItem.model));
      }
      poolItem.close();
    });
  },
  addToMainboard:function(card){
    //why is there always that default model in the cards collection
    if(card.get("name") === "none"){
      return;
    }

    var cardItemView = new CardPoolItemView({
      model:card
    })

    this.$(".mainboard").append(cardItemView.renderInMainboard().$el);
  },
  addToSideboard:function(card){
    //why is there always that default model in the cards collection
    if(card.get("name") === "none"){
      return;
    }

    var cardItemView = new CardPoolItemView({
      model:card
    })

    this.$(".sideboard").append(cardItemView.renderInSideboard().$el);
  }
});

// var ClientHandView = Backbone.View.extend({
//   el:".my-hand",
//   initialize:function(){
//     var self = this;

//this one tosses an error? for some reason?
// _.bindAll(this,"drawCard","displayCard");

//   EventHub.bind("drawCard",function(){
//     self.drawCard();
//   });
//
//   this.listenTo(playerManager.hand,"add",function(card){
//     self.displayDraw(card);
//   })
// },
// drawCard:function(){
//remove returns an array, for reasons unknown. why can't i just pop() god dammit
//   playerManager.hand.create(playerManager.deck.remove(playerManager.deck.at(0))[0]);
// },
// displayDraw:function(card){
//should specify the jQuery ui bits elsewhere
// var $cardImage = $("<img>");
// $cardImage.attr("src",card.attributes.image).addClass("card").draggable({
//half card height and with
// cursorAt:{
//   top:72.5,
//   left:50.7
// },
// drag:function(event,ui){
//   card.set({
//temporary fix to account for mouse offset on card
//           "xPercent":pxToPercent(event.clientX + 50.7,"x"),
//           "yPercent":pxToPercent(event.clientY + 72.5,"y")
//         });
//       },
//       stop:function(){
//         card.set({
//           revealed:true
//         });
//       }
//     });
//
//     this.$el.append($cardImage);
//   }
// });

// var OpponentHandView = Backbone.View.extend({
//   el:".opponent-hand",
//   initialize:function(){
//     _.bindAll(this,"displayDraw");
//
//     var self = this;
//     this.listenTo(this.collection,"add",function(card){
//       self.displayDraw(card);
//     });
//
//     this.listenTo(this.collection,"change",function(card){
//       $(".card[cardid='" + card.attributes.id + "']").css({
//         top:window.innerHeight - percentToPx(card.attributes.yPercent,"y") + "px",
//         left:window.innerWidth - percentToPx(card.attributes.xPercent,"x") + "px"
//       });
//     });

//should only trigger off of change in 'revealed'
//currently triggers off ANY change
//     this.listenTo(this.collection,"change",function(card){
//       if(card.attributes.revealed){
//         self.$(".card[cardid='" + card.attributes.id + "']").attr("src",card.attributes.image);
//       }
//     });
//   },
//   displayDraw:function(card){
//     var $cardImage = $("<img>").attr({
//       src:CARD_BACK,
//       cardID:card.attributes.id
//     }).addClass("card opponent-card");
//
//     this.$el.prepend($cardImage);
//   }
// });


var DraftCardView = Backbone.View.extend({
  tagName:"img",
  initialize:function(){
    _.bindAll(this,"render");
  },
  events:{
    "click":function(){
      EventHub.trigger("draftCardClick",this);
    }
  },
  render:function(){
    //gives all draft cards a popover
    this.$el.attr({
      "src":this.model.get("image").replace('ps:','p:'),
      "data-toggle":"popover"
    }).addClass("draft-card");
    return this;
  }
});

var DraftView = Backbone.View.extend({
  el:".draft-container",
  initialize:function(){
    _.bindAll(this,"renderDraftOptions","renderCard",
    "startDraft", "renderDraft","renderPick","renderWaitingScreen",
    "renderPack","renderBurn","renderDraftComplete","hidePopover",
    "renderWaitingPack");

    this.renderDraftOptions();

    var self = this;
    EventHub.bind("draftCardClick",function(cardView){
      //don't remove cards if user is waiting for a new pack
      //i don't like these references to draft manager. should use an event instead.
      if(!self.draftManager.waiting && self.draftManager.playersPresent){
        cardView.remove();
      }
    });
    EventHub.bind("renderPack",this.renderPack);
    EventHub.bind("startDraft",this.startDraft);
    EventHub.bind("notEnoughDrafters",this.renderWaitingScreen);
    EventHub.bind("draftComplete",this.renderDraftComplete);
    EventHub.bind("hidePopover",this.hidePopover);
    EventHub.bind("waitingForPack",this.renderWaitingPack);
  },
  events:{
    "click .start-draft":function(){
      //this doesn't feel quite right does it
      draftManager = new DraftManager();
      this.collection = draftManager.draftPool;
      draftManager.addPlayer();
    },
    "click .restart-draft":"renderDraftOptions"
  },
  renderDraftOptions:function(){
    var $draftOptionsDiv = $("<div>").addClass("draft-options");
    var $glimpseDraftDiv = $("<button>").addClass("btn btn-primary start-draft").text("glimpse draft");

    //prepend could be problematic if they manage to click multiple times
    this.$el.html($draftOptionsDiv.append($glimpseDraftDiv));
  },
  renderCard:function(card){
    var newDraftCardView = new DraftCardView({model:card});
    this.$(".inner-draft-container").append(newDraftCardView.render().$el);
  },
  startDraft:function(draftManager){
    var self = this;

    //put draft elements on the screen
    self.renderDraft();
    //set the current draft mode
    this.draftManager = draftManager;
    this.listenTo(this.draftManager.draftPicks,"add",function(card){
      self.renderPick(card);
    });
    this.listenTo(this.draftManager.draftBurns,"add",function(card){
      self.renderBurn(card);
    })
  },
  renderDraft:function(){
    this.$el.html("");
    var $innerDraftContainer = $("<div>").addClass("inner-draft-container");
    var $picks = $("<div>").addClass("picks").append("<h1>picks</h1>");
    var $burns = $("<div>").addClass("burns").append("<h1>burns</h1>");

    this.$el.append($innerDraftContainer);
    this.$el.append($picks);
    this.$el.append($burns);
  },
  renderPick:function(card){
    //maybe consolidate this and renderBurn?
    var $pick = $("<img>").attr("src",card.get("image")).addClass("draft-card");
    this.$(".picks").append($pick);
  },
  renderBurn:function(card){
    var $burn = $("<img>").attr("src",card.get("image")).addClass("draft-card");
    this.$(".burns").append($burn);
  },
  renderWaitingScreen:function(){
    //this was written at 3 am, gimme a break
    this.$el.html($("<h1>").css("text-align","center").text("waiting for other player"));
  },
  renderPack:function(pack){
    var self = this;

    this.$(".inner-draft-container").html("");

    pack.each(function(card){
      //that one default card, fucking it all up again
      if(card.get("name") === "none"){
        return;
      }
      self.renderCard(card);
    });
  },
  renderDraftComplete:function(){
    //maybe put all these classes in the css file
    var $endHeader = $("<h1>").text("the draft has ended.").addClass("center-block");
    var $endSubHeader = $("<h3>").text("all your picks have been transferred to your mainboard.").addClass("center-block");
    var $restartButton = $("<button>").addClass("btn btn-primary restart-draft").text("draft again");
    var $completionContainer = $("<div>").addClass("completion-container").append($endHeader,$endSubHeader,$restartButton);

    this.$el.html($completionContainer);
  },
  hidePopover:function(){
    this.$(".inner-draft-container").find(".popover").remove();
  },
  renderWaitingPack:function(){
    this.$(".inner-draft-container").html($("<h1>").css("text-align","center").text("waiting for other drafter."));
  }
});
