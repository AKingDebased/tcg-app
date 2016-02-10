$(function(){
  var $testCard = $("<img>").addClass("center-block");

  $.get("https://api.deckbrew.com/mtg/cards/reflector-mage",function(cards){
    $testCard.attr("src",cards.editions[0].image_url);
    $(".container").append($testCard);
  });
});
