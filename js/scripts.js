$(function(){
  var splitCardSelection = function(cardSelections){
    //extract card amount and name from string
    return cardSelections.map(function(cardSelection){
      var splitSelection = cardSelection.split(" ");
      var amount = parseInt(splitSelection.splice(0,1));

      return {"amount": amount,"name": splitSelection.join(" ")}
    });
  }

  $(".add-to-deck").click(function(){
    var cardSelections = $(".deck-builder textarea").val().split("\n");
    console.log(splitCardSelection(cardSelections));
  });
});
