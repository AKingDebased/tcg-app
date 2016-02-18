var CardPoolView = Backbone.View.extend({
  el: ".draft-pool-container",
  initialize: function(){
    _.bindAll(this,"render");
  },
  render:function(){
    
  }

});

var CardPoolWhiteView = Backbone.View.extend({});

var CardPoolBlackView = Backbone.View.extend({});

var CardPoolRedView = Backbone.View.extend({});

var CardPoolGreenView = Backbone.View.extend({});

var CardPoolBlueView = Backbone.View.extend({});

var CardPoolColorlessView = Backbone.View.extend({});

var CardPoolMultiView = Backbone.View.extend({});

var PoolItemView = Backbone.View.extend({
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
