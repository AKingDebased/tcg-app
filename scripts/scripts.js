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
      //not displaying property when there are only two cards
      if(index % 3 === 0){
        $tableRow = $("<tr>");
        if(index !== 0){
          $cardTable.append($tableRow);
        }
        if(index !== sortedCardNames.length - 1){
          $tableRow = null;
        }
      }
      $tableRow.append($("<td>").text(cardName));
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

  var setActiveTab = function($tab,$pane,state){
    if(state === "active"){
      $tab.addClass(state);
      $pane.addClass(state);
    } else {
      $tab.removeClass("active");
      $pane.removeClass("active");
    }
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

    $(".draft-pool").html(cardPoolToTable(currentPool));
  });

  $(".pool-view").click(function(){
    setActiveTab($(".draft-pool-tab"),$(".draft-pool-container"),"active");
  });

  $(".builder-view").click(function(){
    setActiveTab($(".deck-builder-container"),$(".deck-builder-tab"),"active");
  });

  $(".log-fetched").click(function(){
    console.log(fetchedCards);
  });

  $(".draft-pool-tab").click(function(){
    $(this).tab('show');
  });

  $(".deck-builder-tab").click(function(){
    $(this).tab('show');
  });

  $('.myModal').on('hidden.bs.modal', function () {
    setActiveTab($(".draft-pool-tab"),$(".draft-pool-container"),"inactive");
    setActiveTab($(".deck-builder-container"),$(".deck-builder-tab"),"inactive");
  })
});
