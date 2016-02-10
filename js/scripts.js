$(function(){
  var splitCardSelection = function(selectionsStr){
    //extract card amount and name from string
    var cardSelections = selectionsStr.split("\n");

    console.log(cardSelections);
    return cardSelections.map(function(cardSelection){
      var splitSelection = cardSelection.split(" ");
      var amount = isNaN(parseInt(cardSelections[0])) === true ? NaN : parseInt(splitSelection.splice(0,1));

      return {"amount": amount,"name": splitSelection.join(" ")}
    });
  }

  $(".add-to-pool").click(function(){
    console.log(splitCardSelection($(".pool-builder textarea").val()));
    $(".pool-builder textarea").val("");
  });
});
