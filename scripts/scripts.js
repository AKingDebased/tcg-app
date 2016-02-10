$(function(){
  //temporary global variable to contain card pool
  //should eventually be on firebase
  var currentPool;
  var fetchedCards = [];

  var splitCardSelection = function(selectionsStr){
    //extract card amount and name from string
    var cardSelections = selectionsStr.split("\n");

    return cardSelections.map(function(cardSelection){
      var splitSelection = cardSelection.split(" ");
      var amount = isNaN(parseInt(cardSelections[0])) === true ? NaN : parseInt(splitSelection.splice(0,1));

      return {"amount": amount,"name": splitSelection.join(" ")}
    });
  }

  var formatForAJAX = function(card){
    //commas need to be handled
    if(card.name.includes("'")){
      //deckbrew replaces apostrophes with empty string
      return card.name.replace(/'/g, '').toLowerCase().split(" ").join("-"); //HOW DOES REGEX WORK SEND HELP
    }
    return card.name.toLowerCase().split(" ").join("-");
  }

  var cardPoolToTable = function(cardPool){
    //highly inefficient, but by god it works
    var $cardTable = $("<table>").addClass("table");
    var tableData = [];
    var $tableRow;
    var sortedCardNames = sortCardNamesABC(currentPool);
    //sorts in rows, not columns

    sortedCardNames.forEach(function(cardName,index){
      tableData.push($("<td>").text(cardName));

      if((index + 1) % 3 === 0){
        $tableRow = $("<tr>");

        tableData.forEach(function(cardTD){
          $tableRow.append(cardTD).appendTo($cardTable);
        });

        tableData = [];
      }
    });
    return $cardTable;
  }

  var sortCardNamesABC = function(cards){
    //expects array of card objects, returns new array of sorted string names
    var cardNames = [];

    cards.forEach(function(card){
      cardNames.push(card.name);
    })
    cardNames.sort();
    return cardNames;
  }

  $(".add-to-pool").click(function(){
    currentPool = splitCardSelection($(".pool-builder textarea").val());
    $(".pool-builder textarea").val("");

    currentPool.forEach(function(currentCard){
      //asynchronicity needs to be handled. maybe use a promise?
      $.get("https://api.deckbrew.com/mtg/cards/" + formatForAJAX(currentCard),function(fetchedCard){
        fetchedCards.push(fetchedCard);
      });
    });
  });

  $(".builder-view").click(function(){
    //repeatedly adds pool to builder
    $(".draft-pool").html(cardPoolToTable(currentPool));
  });

  $(".log-fetched").click(function(){
    console.log(fetchedCards);
  });
});
