$(function(){
  var splitCardSelection = function(selectionsStr){
    //extract card amount and name from string
    var cardSelections = selectionsStr.split("\n");

    return cardSelections.map(function(cardSelection){
      var splitSelection = cardSelection.split(" ");
      var amount = parseInt(splitSelection.splice(0,1));

      return {"amount": amount,"name": splitSelection.join(" ")}
    });
  }

  $(".add-to-deck").click(function(){
    splitCardSelection($(".deck-builder textarea").val());
    $(".deck-builder textarea").val("");
  });
});
