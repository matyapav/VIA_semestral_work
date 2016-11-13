/**
 * Created by Pavel on 13.11.2016.
 */

function createCORSRequest(method, url) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
        // XHR for Chrome/Firefox/Opera/Safari.
        xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined") {
        // XDomainRequest for IE.
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } else {
        // CORS not supported.
        xhr = null;
        console.log("CORS are not supported by this browser");
    }
    return xhr;
}

function makeCorsRequest(method, url, data, callback) {
    var xhr = createCORSRequest(method, url);
    if (!xhr) {
        alert('CORS not supported');
        return null;
    }

    xhr.onload = function() {
        callback(xhr.responseText);
    };

    xhr.onerror = function() {
        alert('Woops, there was an error making the request.');
        return null;
    };

    if(data && method == "POST"){
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send(data)
    }else{
        xhr.send();
    }

}

function markPlaceForUser(place, user_id) {
    if(place != null && place != undefined && user_id != null && user_id != undefined){
        checkIfPlaceAlreadyExistsInDb(place.name, function (place_id) {
            if(place_id == null || place_id == undefined){
                insertPlaceIntoDB(place, function (place_id) {
                    makeCorsRequest("POST", "https://ivebeenthereapi-matyapav.rhcloud.com/connectPlaceToUser/"+place_id+"/user/"+user_id, null, function (responseText) {
                        if(responseText){
                            console.log(JSON.parse(responseText).message);
                        }
                    });
                });
            }else{
                makeCorsRequest("GET", "https://ivebeenthereapi-matyapav.rhcloud.com/connectPlaceToUser/"+place_id+"/user/"+user_id, null, function (responseText) {
                    if(responseText){
                        console.log(JSON.parse(responseText).message);
                    }
                });
            }
        });
    }
}

function checkIfPlaceAlreadyExistsInDb(placeName, callback) {
    makeCorsRequest("GET", "https://ivebeenthereapi-matyapav.rhcloud.com/places", null, function (responseText) {
        var placeId = null;
        if(responseText){
            var places = JSON.parse(responseText);
            for (id in places){
                if(places[id] != null && places[id] != undefined) {
                    if (encodeURIComponent(places[id].name) == encodeURIComponent(placeName)) {
                        placeId = places[id]._id;
                    }
                }
            }
        }
        callback(placeId)
    });
}

function insertPlaceIntoDB(place, callback) {
    var data = "name="+encodeURIComponent(place.name)+"&address="+encodeURIComponent(place.address);
    makeCorsRequest("POST", "https://ivebeenthereapi-matyapav.rhcloud.com/places", data, function (responseText) {
        console.log(JSON.parse(responseText).message);
        callback(JSON.parse(responseText).id);
    })
}