/** @namespace */
var GoMan = GoMan 		|| {};

GoMan.GameLogic = function() {
};


var gameBoard;
var gameId;
var asciiBoard;
var frameCounter=0;

var upKey = 'w'.charCodeAt(0);
var downKey = 's'.charCodeAt(0);
var leftKey = 'a'.charCodeAt(0);
var rightKey ='d'.charCodeAt(0);

var myOnKeyPress = function(event) {

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

renderGame = function() {
	// fetch gameState from server
	GoMan.GameLogic.getGameById(gameId);

	// start render loop
	requestAnimationFrame(renderGame);

}


moveRight = function() {
	console.log("move right");
}


moveLeft = function() {
	console.log("move left");	
}


moveUp = function() {
		console.log("move up");
}


moveDown = function() {
		console.log("move down");
}


GoMan.GameLogic.getGameById = function(id) {
	

	url = 'http://localhost:8080/games/'+id;

	GoMan.APIUtils.asyncGET(url, GoMan.GameLogic.onGameUpdate
		, GoMan.GameLogic.onError);
		
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

// called every updated
GoMan.GameLogic.onGameUpdate = function(gameData) {
		
		// convert json to an object
		gameBoard = JSON.parse(gameData);

		frameCounter++;

		asciiBoard = GoMan.GameLogic.convertBoardToASCII(gameBoard);

		$("#gameboard").text(asciiBoard);
}

GoMan.GameLogic.onError = function(error) {

}

GoMan.GameLogic.convertBoardToASCII = function(gameBoard) {

	var asciiString ="";
	asciiString = "GameId:" + gameId + "\n";
	asciiString += "FrameCount:" + frameCounter + "\n";

	for (var r = 0;r<gameBoard.BoardCells.length; r++) {
		// process row
		var row = gameBoard.BoardCells[r];
		for (var c=0; c<row.length; c++) {
			// process cells
			asciiString+= String.fromCharCode(row[c]);
		}
		// newline
		asciiString+="\n";
	}

	return asciiString;
}