var CardLIView = Backbone.View.extend({
  li:"li",
  initialize:function(){
    _.bindAll(this,"render");

    render();
  },
  render:function(){
    console.log(this.model);
    // $(this.el).html(this.model);
    return this;
  }
});
