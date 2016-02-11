var cardPoolToTable = function(cardPool){
  //highly inefficient, but by god it works
  var $cardTable = $("<table>").addClass("table");
  var $tableRow;
  var sortedCardNames = sortCardNamesABC(currentPool);
  //sorts in rows, not columns

  sortedCardNames.forEach(function(cardName,index){
    //not displaying property when there are only two cards
    if(index === 0){
      $tableRow = $("<tr>")
    }

    $tableRow.append($("<td>").text(cardName));

    if(index % 3 === 0 && index !== 0 || index === sortedCardNames.length - 1){
      console.log(index);
      $cardTable.append($tableRow);
      $tableRow = $("<tr>");
    }
  });
  return $cardTable;
}

var cardPoolToObjects = function(selectionsStr){
  //extract card amount and name from string
  var cardSelections = selectionsStr.split("\n");

  return cardSelections.map(function(cardSelection){
    var splitSelection = cardSelection.split(" ");
    var amount = isNaN(parseInt(cardSelections[0])) === true ? NaN : parseInt(splitSelection.splice(0,1));

    return {"amount": amount,"name": splitSelection.join(" ")}
  });
}
