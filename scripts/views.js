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
    "click .log-in":"logIn"
  },
  logIn:function(){
    var $username = $(".username").val();
    var $userPassword = $(".password").val();
    var userInfo = {};
    var self = this;

    userInfo[$username] = {password: $userPassword};

    users.child($username).once("value",function(snapshot){
      if(!snapshot.exists()){
        alert("account created!");
        users.update(userInfo);
        self.fadeOut();
      } else if ($userPassword === snapshot.val().password){
        alert("welcome back!");
        self.fadeOut();
      } else {
        alert("invalid username or password.");
      }
    });
  },
  fadeOut:function(){
    this.$(".log-in-screen").fadeOut(1000);
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
    _.each(GlobalGame.get("cardPool"),function(color,colorName){
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
    this.listenTo(this.model.get("mainboard"),"add",this.addToMainboard);
    this.listenTo(this.model.get("mainboard"),"remove",this.addToSideboard);

    var self = this;
    EventHub.bind("clickedPoolItem",function(poolItem){
      if(poolItem.$el.attr("class") === "mainboard-item"){
        self.model.get("sideboard").push(self.model.get("mainboard").remove(poolItem.model));
      } else if(poolItem.$el.attr("class") === "sideboard-item"){
        self.model.get("mainboard").push(self.model.get("sideboard").remove(poolItem.model));
      } else {
        throw new "invalid board class name";
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
      var randPack = GlobalGame.randomPack(15);
      var self = this;

      randPack.each(function(card){
        self.model.get("mainboard").push(card);
      });
    }
  }
});
