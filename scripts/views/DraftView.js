var DraftView = Marionette.ItemView.extend({
  attributes:{
    "class":"draft"
  },
  initialize:function(){
    console.log("draft view online");
    var self = this;

    this.listenTo(App.vent,"renderPack",this.renderPack);
  },
  ui:{
    pack:".pack"
  },
  renderCard:function(card){
    var newDraftCardView = new DraftCardView({card:card});
    return newDraftCardView.render().$el;
  },
  renderPack:function(pack){
    var self = this;

    this.ui.pack.html("");

    pack.each(function(card){
      self.ui.pack.append(self.renderCard(card));
    });
  }
});
