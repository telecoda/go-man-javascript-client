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

var gameName = "<game name>";
var playerName = "<your name>";
var playerType = "GoMan";
var playerId = localStorage.getItem('playerId');

var myPlayer;

var upKey = 'w'.charCodeAt(0);
var downKey = 's'.charCodeAt(0);
var leftKey = 'a'.charCodeAt(0);
var rightKey ='d'.charCodeAt(0);

var keyAlreadyPressed = false;

var canvas;
var context;
var spriteImages = {};
var spriteWidth=32;
var spriteHeight=32;

var boardImage;


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
	url = gameHost+'/games/' + joinGameId;
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
	maxGoMen = $("#new-max-gomen").val();
	maxGoGhosts = $("#new-max-goghosts").val();
	waitForPlayersSeconds = $("#new-wait-for-players-seconds").val();
	playerName = $("#new-player-name").val();
	playerType = $('input:radio[name=newPlayerType]:checked').val()
	
	var newGame = {};

	newGame['Name'] = gameName;
	newGame['MaxGoMenAllowed'] = parseInt(maxGoMen);
	newGame['MaxGoGhostsAllowed'] = parseInt(maxGoGhosts);
	newGame['WaitForPlayersSeconds'] = parseInt(waitForPlayersSeconds);

	// request a new game from server
	url = gameHost+'/games';

	GoMan.APIUtils.asyncPOST(url, newGame, GoMan.GameLogic.onGameCreated
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

	GoMan.GameLogic.addPlayerToGame(gameId, playerName, playerType);
		
}



GoMan.GameLogic.startGame = function() {
	
	stats.setMode(0); // 0: fps, 1: ms

	// Align top-left
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.left = '0px';
	stats.domElement.style.top = '0px';

	document.body.appendChild( stats.domElement );

	GoMan.GameLogic.initImages();	

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

GoMan.GameLogic.initImages = function() {

	// setup canvas
	canvas = document.getElementById('canvas');
	context = canvas.getContext('2d');

	boardImage = new Image();
	boardImage.src = 'images/board.png';


	gomanImage = new Image();
	gomanImage.src = 'images/go-man-32.png';

	gomanDeadImage = new Image();
	gomanDeadImage.src = 'images/go-man-red-32.png';

	spriteImages['m'] = gomanImage;
	spriteImages['M'] = gomanImage;
	spriteImages['d'] = gomanDeadImage;

	ghostImage = new Image();
	ghostImage.src = 'images/go-man-ghost-32.png';

	spriteImages['g'] = ghostImage;

	redGhostImage = new Image();
	redGhostImage.src = 'images/go-man-ghost-red-32.png';

	spriteImages['G'] = redGhostImage;

	//wallImage = new Image();
	//wallImage.src = 'images/wall-32.png';

	//spriteImages['#'] = wallImage;

	pillImage = new Image();
	pillImage.src = 'images/pill-32.png';

	spriteImages['.'] = pillImage;

	powerPillImage = new Image();
	powerPillImage.src = 'images/power-pill-32.png';

	spriteImages['P'] = powerPillImage;


}

GoMan.GameLogic.renderCanvas = function(gameBoard, boardCells) {

	// clear canvas
	//context.fillStyle = "grey";
	//context.fillRect(0, 0, canvas.width, canvas.height);
	context.drawImage(boardImage, 0, 0);
	// update 2D array with players positions
	GoMan.GameLogic.renderBoard(boardCells);
	GoMan.GameLogic.renderHUD(gameBoard);


}

GoMan.GameLogic.renderBoard = function(boardCells) {

	for (var r = 0;r<boardCells.length; r++) {
		for (var c=0; c<boardCells[r].length; c++) {
			var spriteId = boardCells[r][c];
			if(spriteImages[spriteId] != undefined) {
				context.drawImage(spriteImages[spriteId], c * spriteWidth, r * spriteHeight);
			}

		}
	}

}

GoMan.GameLogic.renderHUD = function(gameBoard) {

	
	GoMan.GameLogic.renderScores(gameBoard.Players);

	GoMan.GameLogic.renderPlayers(gameBoard.Players);

	GoMan.GameLogic.renderGameState(gameBoard);

}

GoMan.GameLogic.renderScores = function(players) {

	var scores = "";
	var yourScore = "";

	for (id in Object(players))  {
		var player = players[id];


		if(player.Id == playerId) {
			yourScore +=player.Name + ":(" + player.Score + ") - Lives:" +player.Lives;
		} else {
			scores +=" " +player.Name + ":(" + player.Score + ")";
		}

	}

	context.fillStyle = "yellow";
  	context.font = "bold 16px Arial";
  	context.fillText(yourScore, 15, 20);
  	var metrics = context.measureText(yourScore);
	  	
	context.fillStyle = "red";
  	context.font = "bold 16px Arial";
  	context.fillText(scores, 15 + metrics.width, 20);
}

GoMan.GameLogic.renderGameState = function(gameBoard) {

	if(gameBoard.State!="playing") {
  		var statusWidth = 200;
  		var statusHeight = 100;
  		var borderWidth = 10;
  		// draw a status box
  		context.fillStyle = "blue";
  		context.fillRect(canvas.width/2 - statusWidth/2,
  						 canvas.height/2 - statusHeight/2,
  						 statusWidth, 
  						 statusHeight);
  		context.fillStyle = "black";
  		context.fillRect(canvas.width/2 - statusWidth/2 + borderWidth,
  						 canvas.height/2 - statusHeight/2 + borderWidth,
  						 statusWidth - borderWidth*2,
  						 statusHeight - borderWidth*2);

  		var statusString;

  		if(gameBoard.State=="waiting") {
  			statusString = "Waiting: " + GoMan.GameLogic.getSecondsTilStart(gameBoard.GameStartTime) +" seconds"; 
  		} else if(gameBoard.State=="over") {
  			statusString = "Game Over"; 
  		} else if(gameBoard.State=="won") {
  			statusString = "Level Complete!"; 
  		}else {
  			statusString = gameBoard.State;
  		}

	  	context.fillStyle = "yellow";
	  	context.font = "bold 16px Arial";
	  	metrics = context.measureText(statusString);
	  	context.fillText(statusString,
	  					canvas.width/2 - metrics.width/2, 
	  					canvas.height/2 );
  		

  	}
}

GoMan.GameLogic.renderPlayers = function(players) {

	// render player names below players
  	context.font = "bold 8px Arial";

	for (id in Object(players))  {
		var player = players[id];


		if(player.Id == playerId) {
			context.fillStyle = "yellow";
		} else {
			context.fillStyle = "red";
		}
	  	var metrics = context.measureText(player.Name);
	  	var x = player.Location.X * spriteWidth;
	  	var y = player.Location.Y * spriteHeight;
	  	context.fillText(player.Name, x+spriteWidth/2-metrics.width/2, y+spriteHeight+8);

	}

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
		
		gameHTML = "<tr><td>"+game.Id +"</td>";

		if (game.State=="waiting") {

			gameHTML += "<td><a id=\"joinGameButton\" class=\"btn btn-small btn-primary\" href=\"#\" onclick=GoMan.GameLogic.startShowJoinGameDialog(\""+game.Id+"\")>Join</a></td>";

		} else {

			gameHTML += "<td></td>";

		}

		gameHTML +="<td>"+game.State +"</td>"
			+ "<td>"+totalGoMen +"/" + game.MaxGoMenAllowed+"</td>"
			+ "<td>"+totalGoGhosts +"/" + game.MaxGoGhostsAllowed+"</td>"
			//+ "<td>"+game.GameStartTime +"</td>"
			+ "<td>"+GoMan.GameLogic.getSecondsTilStart(game.GameStartTime) +" seconds </td>"
			+ "</tr>";

		$("#gameListTable tbody").append(gameHTML); 

	}

}

GoMan.GameLogic.getSecondsTilStart = function(startTime) {
	return parseInt((Date.parse(startTime) - Date.now() )/1000 );
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

	GoMan.GameLogic.addPlayerToGame(gameId, playerName, playerType);

}

GoMan.GameLogic.addPlayerToGame = function(gameId, playerName, playerType) {

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

	// render board + players
	GoMan.GameLogic.renderCanvas(gameBoard, boardCells);
	
	var detailsString = GoMan.GameLogic.getGameDetailsString(gameBoard);
	var playerDetailsString = GoMan.GameLogic.getPlayerDetailsString(gameBoard.Players, playerId);

	asciiBoard = GoMan.GameLogic.convertBoardCellsToASCII(boardCells);

	$("#gameboard").text(asciiBoard);
	$("#gamestatus").text(detailsString + playerDetailsString);


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
		if(gameBoard.PowerPillsActive > 0) {
			// powerpill active
			if (player.Type == "goman") {
				if(player.State=="dying") {
					boardCells[y][x]="d";
				} else {
					boardCells[y][x] = "M";					
				}
			} else {
				// must be a ghost
				boardCells[y][x] = "g";
			}

		} else {
			// powerpill not active
			if (player.Type == "goman") {
				if(player.State=="dying") {
					boardCells[y][x]="d";
				} else {
					boardCells[y][x] = "m";
				}
			} else {
				// must be a ghost
				boardCells[y][x] = "G";
			}

		}
	}

	return boardCells;
}

GoMan.GameLogic.getGameDetailsString = function(gameBoard) {

var detailsString ="";
	detailsString = "GameId:" + gameId + "\n";
	detailsString += "GameName:" + gameBoard.Name + "\n";
	detailsString += "FrameCount:" + frameCounter + "\n";
	detailsString += "Pills Remaining:" + gameBoard.PillsRemaining + "\n";
	detailsString += "GameState:" + gameBoard.State + "\n";		
	if(gameBoard.State=="waiting") {
		detailsString += GoMan.GameLogic.getSecondsTilStart(gameBoard.GameStartTime) +" seconds \n";
	} 
	detailsString += "PowerPillsActive:" + gameBoard.PowerPillsActive + "\n";

	return detailsString;	
}

GoMan.GameLogic.getPlayerDetailsString = function(players, myPlayerId) {

	var playerDetailsString ="Players\n";
	playerDetailsString += "=======\n";

	for (id in Object(players))  {
		var player = players[id];

		playerDetailsString +="Player:" + player.Name + " - (" +player.Type + ")";

		if(player.Id == playerId) {
			playerDetailsString += "<--(you)\n"
		} else {
			playerDetailsString += "\n";
		}
	playerDetailsString +="Score:" + player.Score + " - Lives:" +player.Lives + "\n";

	}
	return playerDetailsString;	
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