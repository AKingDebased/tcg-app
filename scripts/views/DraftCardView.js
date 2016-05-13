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
    //cards don't work when sourced from HTTPS
    this.$el.attr("src",this.model.get("image").replace('ps:','p:')).addClass("draft-card");
    return this;
  }
});
