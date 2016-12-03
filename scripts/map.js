var map;
var service;
var actualPosition;
var markers = [];
var defaultMarkerColor = "FE7569";
var somePlaceIsSelected = false;


function initMap() {
    var myLatLng = {lat: 52.54063980000001, lng: -1.8916148000000703};
    var mapDiv = document.getElementById('map');
    map = new google.maps.Map(mapDiv, {
        center: myLatLng,
        zoom: 16
    });

    var infoWindow = new google.maps.InfoWindow({map: map});

    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            actualPosition = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            createMarkerOnMap(actualPosition, "Vaše poloha", "FFFFFF");

            map.setCenter(actualPosition);
            console.log("map initialized");


        }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
}

function clearMap(){

    for( var i = 0; i < markers.length; i++ ) {
        markers[i].marker.setMap(null);
    }
    markers = [];
}

function getNearbyLocations() {
    //clear previous markers
    clearMap();
    //unselect selected place
    clearTable();
    //make request for new radius
    var request = {
        location: actualPosition,
        radius: document.getElementById('radius-input').value,
        types: ['restaurant'],
    };
    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, markNearbyPlaces);
}

function markNearbyPlaces(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        var userId = localStorage.getItem("id");
        var userPlaces;
        if(userId != null && userId != undefined){
            makeCorsRequest("GET", "https://ivebeenthereapi-matyapav.rhcloud.com/userPlaces/"+userId, null, function (responseText) {
                if(responseText){
                    userPlaces = JSON.parse(responseText);
                }
                results.forEach(function (v,i) {
                    var place = results[i];
                    var color = null;
                    var clickedColor = null;
                    var isInUsersPlaces = false;
                    userPlaces.forEach(function (userPlace) {
                        if(userPlace != null) {
                            if (encodeURIComponent(userPlace.name) == encodeURIComponent(place.name)) {
                                isInUsersPlaces = true;
                            }
                        }
                    });
                    if(isInUsersPlaces){
                        color = "00ff00";
                        clickedColor = "006400";
                    }else{
                        color = defaultMarkerColor;
                        clickedColor = "ff0000";
                    }
                    var marker = createMarkerOnMap(place.geometry.location, place.name, color);
                    markers.push({marker: marker, color: color});
                    marker.addListener('click', function(){
                        markers.forEach(function (v,i) {
                            setMarkerColor(markers[i].marker, markers[i].color);
                        });
                        setMarkerColor(marker, clickedColor)
                        showInfoAboutPlace(place, marker, isInUsersPlaces);
                    });
                });
            });
        }
    }
}

function createMarkerOnMap(position, title, pinColor) {
    var pinImage = new google.maps.MarkerImage("https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34));
    var pinShadow = new google.maps.MarkerImage("https://chart.apis.google.com/chart?chst=d_map_pin_shadow",
        new google.maps.Size(40, 37),
        new google.maps.Point(0, 0),
        new google.maps.Point(12, 35));

    var marker = new google.maps.Marker({
        position: position,
        map: map,
        icon: pinImage,
        shadow: pinShadow,
        title: title
    });
    return marker;
}

function setPlaceTable(place) {
    //show information in table
    clearTable();
    document.getElementById('place-name').innerText = place.name;
    document.getElementById('place-address').innerText = place.vicinity;
    if(place.opening_hours != null){
        document.getElementById('place-open').innerText = place.opening_hours.open_now? 'Ano':'Ne';
    }else{
        document.getElementById('place-open').innerText = "-";
    }
    document.getElementById('actions').style = "display: table-row";

}

function showInfoAboutPlace(place,marker, alreadyVisited){
    console.log(place);
    setPlaceTable(place);
    somePlaceIsSelected = true;
    getFriendsWhichVisitedPlace(place.name, place.vicinity);
    //clone element in order to remove all action listeners on it
    var old_element = document.getElementById("iwasthere");
    var new_element = old_element.cloneNode(true);
    old_element.parentNode.replaceChild(new_element, old_element);

    var userId = localStorage.getItem("id");

    if(!alreadyVisited) {
        document.getElementById('iwasthere').innerHTML = "I've been there";
        document.getElementById('iwasthere').addEventListener('click', function () {
            connectPlaceAndUser(place, userId);
        })

    }else{
        document.getElementById('iwasthere').innerHTML = "I haven't been there";
        document.getElementById('iwasthere').addEventListener('click', function () {
            disconnectPlaceAndUser(place, userId);
        });
        document.getElementById('addNote').style = "display: block";
        document.getElementById('myNotes').style = "display: block; text-align: center";
        prepareNoteFormAndFillNotes(place.name);
    }
}

function connectPlaceAndUser(place, userId) {
    var placeObj = {name: place.name, address: place.vicinity};
    markPlaceForUser(placeObj, userId, getNearbyLocations);
}

function disconnectPlaceAndUser(place, userId){
    makeCorsRequest("GET", "https://ivebeenthereapi-matyapav.rhcloud.com/userPlaces/"+userId, null, function (responseText) {
        if(responseText){
            var places = JSON.parse(responseText);
            console.log(places);
            console.log(place);
            var placeId = null;
            places.forEach(function (p) {
                if(p.name == place.name && p.address == place.vicinity){
                    placeId = p._id;
                }
            });
            if(placeId != null){
                makeCorsRequest("POST", "https://ivebeenthereapi-matyapav.rhcloud.com/disconnectPlaceAndUser/"+placeId+"/user/"+userId, null, function (responseText) {
                    if(responseText){
                        console.log(JSON.parse(responseText).message);
                        getNearbyLocations();
                    }
                });
            }
        }
    });
}

function clearTable() {
    document.getElementById('place-name').innerText = "-";
    document.getElementById('place-address').innerText = "-";
    document.getElementById('place-open').innerText = "-";
    document.getElementById('place-friends').innerText="-";
    document.getElementById('actions').style = "display: none";
    document.getElementById('addNote').style = "display: none";
    document.getElementById('addNoteDiv').style = "display: none";
    document.getElementById('addNoteDiv').innerHTML = "";
    document.getElementById('myNotes').innerHTML = "";
    document.getElementById('myNotes').style = "display: none";
    somePlaceIsSelected = false;
}

function setMarkerColor(marker, color) {
    marker.setIcon(new google.maps.MarkerImage("https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|"+color ,
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34)));
}