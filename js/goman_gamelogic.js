/** @namespace */
var GoMan = GoMan 		|| {};

GoMan.GameLogic = function() {
};


var gameBoard;
var gameId;
var stats = new Stats();
var asciiBoard;
var frameCounter=0;

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


GoMan.GameLogic.startNewGame = function() {
	
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

	// request a new game from server
	url = 'http://localhost:8080/games';

	GoMan.APIUtils.asyncPOST(url, null, GoMan.GameLogic.onGameStart
		, GoMan.GameLogic.onError);

		
}

GoMan.GameLogic.fetchGameList = function(filterByState) {
	

	

	// get a list of games from the server
	url = 'http://localhost:8080/games';

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

	gameBoard.MainPlayer.Location.X++;

	url = 'http://localhost:8080/games/'+gameId;

	GoMan.APIUtils.asyncPUT(url, gameBoard.MainPlayer , GoMan.GameLogic.onGameUpdate
		, GoMan.GameLogic.onError);

}


moveLeft = function() {
	console.log("move left");	

	gameBoard.MainPlayer.Location.X--;

	url = 'http://localhost:8080/games/'+gameId;

	GoMan.APIUtils.asyncPUT(url, gameBoard.MainPlayer , GoMan.GameLogic.onGameUpdate
		, GoMan.GameLogic.onError);

}


moveUp = function() {
		console.log("move up");

		gameBoard.MainPlayer.Location.Y--;

		url = 'http://localhost:8080/games/'+gameId;

		GoMan.APIUtils.asyncPUT(url, gameBoard.MainPlayer , GoMan.GameLogic.onGameUpdate
			, GoMan.GameLogic.onError);

}


moveDown = function() {
		console.log("move down");

		gameBoard.MainPlayer.Location.Y++;

		url = 'http://localhost:8080/games/'+gameId;

		GoMan.APIUtils.asyncPUT(url, gameBoard.MainPlayer , GoMan.GameLogic.onGameUpdate
			, GoMan.GameLogic.onError);

}


GoMan.GameLogic.getGameById = function(id) {
	

	url = 'http://localhost:8080/games/'+id;

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
		if(game.Players) {
			totalPlayers = game.Players.length;
		} else {
			totalPlayers = 0;
		}
		gameHTML = "<tr>"
			+ "<td>"+game.Id +"</td>"
			+ "<td>"+game.State +"</td>"
			+ "<td>"+game.CreatedTime +"</td>"
			+ "<td>"+totalPlayers +"</td>"
			+ "<td>"+game.GameStartTime +"</td>"
			+ "</tr>";

		$("#gameListTable tbody").append(gameHTML); 

	}


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

		asciiBoard = GoMan.GameLogic.convertBoardToASCII(gameBoard);

		$("#gameboard").text(asciiBoard);
}

GoMan.GameLogic.onError = function(error) {
	alert(error)
}

GoMan.GameLogic.convertBoardToASCII = function(gameBoard) {

	// player location
	var playerX = gameBoard.MainPlayer.Location.X;
	var playerY = gameBoard.MainPlayer.Location.Y;

	var asciiString ="";
	asciiString = "GameId:" + gameId + "\n";
	asciiString += "FrameCount:" + frameCounter + "\n";
	asciiString += "Pills Remaining:" + gameBoard.PillsRemaining + "\n";
	asciiString += "Score:" + gameBoard.Score + "\n";
	asciiString += "Lives:" + gameBoard.Lives + "\n";
	asciiString += "GameState:" + gameBoard.State + "\n";
	asciiString += "PlayerState:" + gameBoard.MainPlayer.State + "\n";

	for (var r = 0;r<gameBoard.BoardCells.length; r++) {
		// process row
		var row = gameBoard.BoardCells[r];
		for (var c=0; c<row.length; c++) {
			// process cells
			if(r==playerY && c==playerX) {
				asciiString+= "G";
			} else {
				asciiString+= String.fromCharCode(row[c]);
			}
		}
		// newline
		asciiString+="\n";
	}

	return asciiString;
}