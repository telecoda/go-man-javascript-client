/** @namespace */
var GoMan = GoMan 		|| {};

GoMan.GameLogic = function() {
};


var gameHost = localStorage.getItem('gameHost');

if (gameHost == undefined) {
	gameHost = "http://localhost:8080"
}

var gameBoard;
var boardCells;
var gameId = localStorage.getItem('gameId');

var stats = new Stats();
var asciiBoard;
var frameCounter=0;

var gameName = "Dummy Game Name";
var playerName = "Dummy Player Name";
var playerType = "GoMan";
var playerId = localStorage.getItem('playerId');

var myPlayer;

var upKey = 'w'.charCodeAt(0);
var downKey = 's'.charCodeAt(0);
var leftKey = 'a'.charCodeAt(0);
var rightKey ='d'.charCodeAt(0);

var keyAlreadyPressed = false;

var myOnKeyPress = function(event) {

		if(keyAlreadyPressed) {
			return;
		}

		keyAlreadyPressed = true;

		console.log("key pressed");
		switch(event.which) {
			case downKey:
				moveDown();
				break;
			case upKey:
				moveUp();
				break;
			case leftKey:
				moveLeft();
				break;
			case rightKey:
				moveRight();
				break;

		}
	
}

GoMan.GameLogic.showCreateGameDialog = function() {

	// setup buttons
	$("#startGameActionButton").unbind('click');
	$("#startGameActionButton").click(GoMan.GameLogic.createNewGameClicked);

	$("#cancelStartActionButton").unbind('click');
	$("#cancelStartActionButton").click(GoMan.GameLogic.cancelStartActionClicked);
	
	$("#new-game-name").val(gameName)
	$("#new-player-name").val(playerName)

	$("#newGameDialogBox").modal("show");

}

GoMan.GameLogic.startShowJoinGameDialog = function(joinGameId) {

	// fetch game details
	url = gameHost+'/games/' + gameId;
	// fetch game data to join game
	GoMan.APIUtils.asyncGET(url, GoMan.GameLogic.showJoinGameDialog
		, GoMan.GameLogic.onError);

}

GoMan.GameLogic.showJoinGameDialog = function(gameData) {

	// convert json to an object
	gameBoard = JSON.parse(gameData);

	// setup buttons
	$("#joinGameActionButton").unbind('click');
	$("#joinGameActionButton").click(GoMan.GameLogic.joinGameClicked);

	$("#cancelJoinActionButton").unbind('click');
	$("#cancelJoinActionButton").click(GoMan.GameLogic.cancelJoinActionClicked);
	
	$("#join-game-id").val(gameBoard.Id)
	
	$("#join-game-name").val(gameBoard.Name)

	goMenCount = GoMan.GameLogic.countGoMen(gameBoard.Players);
	goGhostCount = GoMan.GameLogic.countGoGhosts(gameBoard.Players);
	
	$("#join-gomen-count").val(goMenCount + "/" + gameBoard.MaxGoMenAllowed)
	$("#join-goghost-count").val(goGhostCount+ "/" + gameBoard.MaxGoGhostsAllowed)

	$("#join-player-name").val(playerName)

	$("#joinGameDialogBox").modal("show");

}


GoMan.GameLogic.cancelStartActionClicked = function() {
	// hide dialog
	$("#newGameDialogBox").modal("hide");

}

GoMan.GameLogic.cancelJoinActionClicked = function() {
	// hide dialog
	$("#joinGameDialogBox").modal("hide");

}


GoMan.GameLogic.createNewGameClicked = function() {
	
	$("#newGameDialogBox").modal("hide");

	// get details
	gameName = $("#new-game-name").val();
	playerName = $("#new-player-name").val();
	playerType = $('input:radio[name=newPlayerType]:checked').val()
	console.log("New game:" + gameName);
	console.log("for Player:" + playerName);
	console.log("Player Type:" + playerType);


	// request a new game from server
	url = gameHost+'/games';

	GoMan.APIUtils.asyncPOST(url, null, GoMan.GameLogic.onGameCreated
		, GoMan.GameLogic.onError);

		
}

GoMan.GameLogic.joinGameClicked = function() {
	
	$("#joinGameDialogBox").modal("hide");

	// get details
	gameName = $("#join-game-name").val();
	gameId = $("#join-game-id").val();
	playerName = $("#join-player-name").val();
	playerType = $('input:radio[name=joinPlayerType]:checked').val()
	console.log("Join game:" + gameName);
	console.log("for Player:" + playerName);
	console.log("Player Type:" + playerType);


	// save gameId in local storage
	localStorage.setItem('gameId',gameId);

	GoMan.GameLogic.addPlayerToGame(gameId, gameName, playerName, playerType);
		
}



GoMan.GameLogic.startGame = function() {
	
	stats.setMode(0); // 0: fps, 1: ms

	// Align top-left
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.left = '0px';
	stats.domElement.style.top = '0px';

	document.body.appendChild( stats.domElement );

	// hide start button
	$("#startButton").addClass("hide");
	
	console.log("Keypress setup")
	document.removeEventListener('keypress', myOnKeyPress, false);
	document.addEventListener('keypress', myOnKeyPress, false);

	url = gameHost+'/games/' + gameId;
	// fetch game data for newly created game
	GoMan.APIUtils.asyncGET(url, GoMan.GameLogic.onGameStart
		, GoMan.GameLogic.onError);

		
} 

GoMan.GameLogic.fetchGameList = function(filterByState) {
	

	

	// get a list of games from the server
	url = gameHost+'/games';

	if(filterByState) {
		url += "?state=" + filterByState;
	}

	GoMan.APIUtils.asyncGET(url, GoMan.GameLogic.onGameListLoaded
		, GoMan.GameLogic.onError);

		
}

renderGame = function() {
	stats.begin();

	// fetch gameState from server
	GoMan.GameLogic.getGameById(gameId);

	// allow another keypress now
	keyAlreadyPressed = false;

    stats.end();

	// start render loop
	requestAnimationFrame(renderGame);

}


moveRight = function() {
	console.log("move right");

	myPlayer.Location.X++;

	url = gameHost+'/games/'+gameId+"/players/"+playerId;

	console.log("Putting to url:" + url);
	GoMan.APIUtils.asyncPUT(url, myPlayer , GoMan.GameLogic.onGameUpdate
		, GoMan.GameLogic.onError);

}


moveLeft = function() {
	console.log("move left");	


	myPlayer.Location.X--;

	url = gameHost+'/games/'+gameId+"/players/"+playerId;

	console.log("Putting to url:" + url);
	GoMan.APIUtils.asyncPUT(url, myPlayer , GoMan.GameLogic.onGameUpdate
		, GoMan.GameLogic.onError);

}


moveUp = function() {
	console.log("move up");

	myPlayer.Location.Y--;

	url = gameHost+'/games/'+gameId+"/players/"+playerId;

	console.log("Putting to url:" + url);
	GoMan.APIUtils.asyncPUT(url, myPlayer , GoMan.GameLogic.onGameUpdate
		, GoMan.GameLogic.onError);

}


moveDown = function() {
	console.log("move down");

	myPlayer.Location.Y++;

	url = gameHost+'/games/'+gameId+"/players/"+playerId;

	console.log("Putting to url:" + url);
	GoMan.APIUtils.asyncPUT(url, myPlayer , GoMan.GameLogic.onGameUpdate
		, GoMan.GameLogic.onError);

}


GoMan.GameLogic.getGameById = function(id) {
	
	url = gameHost+'/games/'+id;

	GoMan.APIUtils.asyncGET(url, GoMan.GameLogic.onGameUpdate
		, GoMan.GameLogic.onError);
		
}

// called when game loaded
GoMan.GameLogic.onGameListLoaded = function(gameSummaryData) {

	// convert json to an object
	gameListSummary = JSON.parse(gameSummaryData);
	
	$("#gameListTable tbody").remove();
	$("#gameListTable").append("<tbody></tbody>");

	for(var i=0;i<gameListSummary.length;i++) {
		var game = gameListSummary[i];
		// count players in game
		totalGoMen = GoMan.GameLogic.countGoMen(game.Players);
		totalGoGhosts =GoMan.GameLogic.countGoGhosts(game.Players);
		
		gameHTML = "<tr>"
			+ "<td>"+game.Id +"</td>"
			+ "<td><a id=\"joinGameButton\" class=\"btn btn-small btn-primary\" href=\"#\" onclick=GoMan.GameLogic.startShowJoinGameDialog(\""+game.Id+"\")>Join</a></td>"
			+ "<td>"+game.State +"</td>"
			+ "<td>"+totalGoMen +"/" + game.MaxGoMenAllowed+"</td>"
			+ "<td>"+totalGoGhosts +"/" + game.MaxGoGhostsAllowed+"</td>"
			//+ "<td>"+game.GameStartTime +"</td>"
			+ "<td>"+parseInt((Date.parse(game.GameStartTime) - Date.now() )/1000 )+" seconds </td>"
						+ "</tr>";

		$("#gameListTable tbody").append(gameHTML); 

	}

}

GoMan.GameLogic.countGoGhosts = function(players) {
	totalGoGhosts = 0;
	for (id in Object(players))  {
		var player = players[id];
		if (player.Type == "goghost") {
			totalGoGhosts++;
		}
	}
	return totalGoGhosts;
}

GoMan.GameLogic.countGoMen = function(players) {
totalGoMen = 0;
	for (id in Object(players))  {
		var player = players[id];
		if (player.Type == "goman") {
			totalGoMen++;
		}
	}
	return totalGoMen;	
}


GoMan.GameLogic.onGameCreated = function(gameData) {
		
	// convert json to an object
	gameBoard = JSON.parse(gameData);

	gameId = gameBoard.Id;

	// save gameId in local storage
	localStorage.setItem('gameId',gameId);

	GoMan.GameLogic.addPlayerToGame(gameId, gameName, playerName, playerType);

}

GoMan.GameLogic.addPlayerToGame = function(gameId, gameName, playerName, playerType) {

	// now add first player to game
	url = gameHost+'/games/'+gameId + "/players";

	var newPlayer = {};

	newPlayer['Name'] = playerName;
	newPlayer['Type'] = playerType;

	GoMan.APIUtils.asyncPOST(url, newPlayer , GoMan.GameLogic.onPlayerAdded
		, GoMan.GameLogic.onError);

}

GoMan.GameLogic.onPlayerAdded = function(playerAdded) {

	// convert json to an object
	player = JSON.parse(playerAdded);

	// player has been added, save id
	localStorage.setItem('playerId',player.Id);
	// redirect to game board

	window.location.replace('game.html');

}


// called at the beginning of the game
GoMan.GameLogic.onGameStart = function(gameData) {
		
	// convert json to an object
	gameBoard = JSON.parse(gameData);

	gameId = gameBoard.Id;
	frameCounter=0;

	// start render loop
	requestAnimationFrame(renderGame);

}


// called every update
GoMan.GameLogic.onGameUpdate = function(gameData) {
		
	// convert json to an object
	gameBoard = JSON.parse(gameData);

	frameCounter++;

	// retrieve myPlayer
	myPlayer = GoMan.GameLogic.getMyPlayer(gameBoard,playerId);
	// convert game data to 2d array
	boardCells = GoMan.GameLogic.convertBoardTo2DArray(gameBoard);

	// overlay players positions on boardCells
	boardCells = GoMan.GameLogic.addPlayersToBoardCells(gameBoard,boardCells);
	
	// create header details
	var detailsString = GoMan.GameLogic.getGameDetailsString(gameBoard);
	// merge player po
	asciiBoard = GoMan.GameLogic.convertBoardCellsToASCII(boardCells);

	$("#gameboard").text(detailsString + asciiBoard);
}

GoMan.GameLogic.onError = function(error) {
	alert(error)
}

GoMan.GameLogic.getMyPlayer = function(gameBoard, playerId) {

	return gameBoard.Players[playerId];

}

GoMan.GameLogic.convertBoardTo2DArray = function(gameBoard) {

	var boardCells = new Array(gameBoard.BoardCells.length);
  	for (var r = 0; r < gameBoard.BoardCells.length; r++) {
		var row = gameBoard.BoardCells[r];

    	boardCells[r] = new Array(row.length);
    	for (var c=0; c<row.length; c++) {
			boardCells[r][c]= String.fromCharCode(row[c]);
		}

  	}

	return boardCells;
}

GoMan.GameLogic.addPlayersToBoardCells = function(gameBoard, boardCells) {

	// update 2D array with players positions

	for (id in Object(gameBoard.Players))  {
		var player = gameBoard.Players[id];

		var x = player.Location.X;
		var y = player.Location.Y;

		// note x,y co-ords are transposed because 2d array
		// contains row/column NOT column/row
		if (player.Type == "goman") {
			boardCells[y][x] = "M";
		} else {
			// must be a ghost
			boardCells[y][x] = "G";
		}
	}

	return boardCells;
}

GoMan.GameLogic.getGameDetailsString = function(gameBoard) {

var detailsString ="";
	detailsString = "GameId:" + gameId + "\n";
	detailsString += "FrameCount:" + frameCounter + "\n";
	detailsString += "Pills Remaining:" + gameBoard.PillsRemaining + "\n";
	detailsString += "Score:" + gameBoard.Score + "\n";
	detailsString += "Lives:" + gameBoard.Lives + "\n";
	detailsString += "GameState:" + gameBoard.State + "\n";
	detailsString += "PowerPillActive:" + gameBoard.PowerPillActive + "\n";
	//detailsString += "PlayerState:" + gameBoard.MainPlayer.State + "\n";

	return detailsString;	
}
GoMan.GameLogic.convertBoardCellsToASCII = function(boardCells) {

	var asciiString ="";

	for (var r = 0;r<boardCells.length; r++) {
		for (var c=0; c<boardCells[r].length; c++) {
			asciiString+= boardCells[r][c];
		}
		// newline
		asciiString+="\n";
	}
	return asciiString;
}