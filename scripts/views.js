var CardPoolItemView = Backbone.View.extend({
  tagName:"li",
  initialize:function(){
    _.bindAll(this,"render");
  },
  render:function(){
    console.log(this.model);
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
    this.listenTo(this.model,"change:mainboard",this.updateMainboard)
  },
  updateMainboard:function(change){
    change.get("mainboard").each(function(card){
      var cardItemView = new CardPoolItemView({model:card});
      this.$(".mainboard").append(cardItemView.render().$el);
    })
  },
  events:{
    "click .randMainboard":function(){
      this.model.set({mainboard: GlobalGame.randomPack(15,this.model)});
    }
  }
});
