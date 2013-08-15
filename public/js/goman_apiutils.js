/** @namespace */
var GoMan = GoMan 		|| {};

GoMan.APIUtils = function() {
};


GoMan.APIUtils.asyncGET  = function ( url, onLoaded, onError ) {

	var xhr = new XMLHttpRequest();


	xhr.onreadystatechange = function () {

		if ( xhr.readyState === 4 ) {

			if ( xhr.status === 200 ) {

				var fileData = xhr.responseText;
				
				onLoaded(fileData);

			} else {

				var errorDesc = "GoMan.APIUtils.asyncGET: Error getting [" + url + "] [" + xhr.status + "]";
				onError(errorDesc);

			}

		}

	};
	
	xhr.open( "GET", url, true );
	//xhr.setRequestHeader('Origin', 'localhost');
	xhr.send( null );
	
};

GoMan.APIUtils.asyncPOST  = function ( url, body, onLoaded, onError ) {


	var xhr = new XMLHttpRequest();

	var jsonBody = JSON.stringify(body);

	xhr.onreadystatechange = function () {

		if ( xhr.readyState === 4 ) {

			if ( xhr.status === 200 ) {

				var fileData = xhr.responseText;
				
				onLoaded(fileData);

			} else {

				var errorDesc = "GoMan.APIUtils.asyncPOST: Error creating [" + url + "] [" + xhr.status + "]"+ xhr.responseText;
				onError(errorDesc);

			}

		}

	};
	
	xhr.open( "POST", url, true );
	xhr.setRequestHeader('Content-Type', 'application/json');
	//xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
	xhr.send( jsonBody );
};

GoMan.APIUtils.asyncPUT  = function ( url, body, onLoaded, onError ) {

	var xhr = new XMLHttpRequest();

	var jsonBody = JSON.stringify(body);

	xhr.onreadystatechange = function () {

		if ( xhr.readyState === 4 ) {

			if ( xhr.status === 200) {

				var fileData = xhr.responseText;
				
				onLoaded(fileData);

			} else if ( xhr.status === 400) {

				// do nothing move was not valid
				waitingForMoveResponse = false;

				
			} else {

				var errorDesc = "GoMan.APIUtils.asyncPUT: Error updating [" + url + "] [" + xhr.status + "]" + xhr.responseText;
				onError(errorDesc);

			}

		}

	};
	
	xhr.open( "PUT", url, true );
	xhr.setRequestHeader('Content-Type', 'application/json');
	//xhr.setRequestHeader('Origin', 'localhost');
	xhr.send( jsonBody );
	
};