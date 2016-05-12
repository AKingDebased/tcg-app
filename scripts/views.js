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

var UploadPoolView = Marionette.ItemView.extend({
  attributes:{
    class:"upload-pool"
  },
  initialize:function(){
    console.log("upload pool view online");
    this.listenTo(App.vent,"clearPoolEl",this.clearPoolEl)
  },
  ui:{
    poolUploader:".pool-uploader"
  },
  events:{
    "click .upload-button":function(){
      //console.log(this.ui.poolUploader)
      this.model.uploadCards($(".pool-uploader").val());
    }
  },
  clearPoolEl:function(){
    $(".pool-uploader").val("");
  },
  render:function(){
    $.get('templates/upload-pool.html', function (data) {
      $(".upload-pool").html(_.template(data));
    }, 'html');
  }
});

var DraftView = Backbone.View.extend({});

var GatekeeperView = Marionette.ItemView.extend({
  attributes:{
    class:"gatekeeper"
  },
  ui:{
    activeDrafters:".activeDrafters",
    maxDrafters:".maxDrafters",
    enterDraft:".enter-draft",
    waitingLabel:".waiting-label"
  },
  //template needs to be loaded externally
  template:_.template($("#gatekeeper-template").html()),
  modelEvents:{
    "sync":"changeNumDrafters draftReady"
  },
  events:{
    "click .enter-draft":"startDraft"
  },
  changeNumDrafters:function(data){
    this.ui.activeDrafters.text(Object.keys(data.get("activeDrafters")).length);
    this.ui.maxDrafters.text(data.get("maxDrafters"));
  },
  draftReady:function(data){
    //if all drafters are present
    if(Object.keys(data.get("activeDrafters")).length === data.get("maxDrafters")){
      this.ui.enterDraft.removeAttr("disabled");
      this.ui.waitingLabel.text("all drafters present!");
    }
  },
  startDraft:function(){
    App.rootLayout.mainRegion.empty();
    App.poolUploadModel = new PoolUploadModel();
    App.rootLayout.mainRegion.show(new UploadPoolView({
      model:App.poolUploadModel
    }));
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

        var myStatus = {};
        myStatus[firebase.getAuth().uid] = true;

        App.gatekeeperView = new GatekeeperView({
          model: new GatekeeperModel()
        });

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
    //TODO
  },
  displayWinstonInfo:function(){
    //TODO
  },
  displayWinchesterInfo:function(){
    //TODO
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
    _.each(App.gameManager.cardPool,function(color,colorName){
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
