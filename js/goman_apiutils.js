/** @namespace */
var GoMan = GoMan 		|| {};

GoMan.APIUtils = function() {
};


GoMan.APIUtils.asyncGET  = function ( url, onLoaded, onError ) {

	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function () {

		if ( xhr.readyState === 4 ) {

			if ( xhr.status === 200 || xhr.status === 0 ) {

				var fileData = xhr.responseText;
				
				onLoaded(fileData);

			} else {

				var errorDesc = "GoMan.APIUtils.asyncGET: Error getting [" + url + "] [" + xhr.status + "]";
				onError(errorDesc);

			}

		}

	};
	
	xhr.open( "GET", url, true );
	xhr.send( null );
	
};

GoMan.APIUtils.asyncPOST  = function ( url, body, onLoaded, onError ) {

	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function () {

		if ( xhr.readyState === 4 ) {

			if ( xhr.status === 200 || xhr.status === 0 ) {

				var fileData = xhr.responseText;
				
				onLoaded(fileData);

			} else {

				var errorDesc = "GoMan.APIUtils.asyncGET: Error getting [" + url + "] [" + xhr.status + "]";
				onError(errorDesc);

			}

		}

	};
	
	xhr.open( "POST", url, true );
	xhr.send( null );
	
};