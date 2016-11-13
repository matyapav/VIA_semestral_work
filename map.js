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
            createMarkerOnMap(actualPosition, "Vaše poloha", "FFFFFF")

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

function getNearbyLocations() {
    for( var i = 0; i < markers.length; i++ ) {
        markers[i].marker.setMap(null);
    }
    markers = [];
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
                    var marker = null;
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

function showInfoAboutPlace(place,marker, alreadyVisited){

    document.getElementById('place-name').innerText = place.name;
    document.getElementById('place-address').innerText = place.vicinity;
    if(place.opening_hours != null){
        document.getElementById('place-open').innerText = place.opening_hours.open_now? 'Ano':'Ne';
    }else{
        document.getElementById('place-open').innerText = "-";
    }

    document.getElementById('actions').style = "visibility: visible";

    somePlaceIsSelected = true;
    console.log(place)
    if(!alreadyVisited) {
        document.getElementById('iwasthere').innerHTML = "Byl jsem tu.";
        document.getElementById('iwasthere').removeEventListener('click');
        document.getElementById('iwasthere').addEventListener('click', function () {
            var placeObj = {name: place.name, address: place.vicinity};
            userId = localStorage.getItem("id");
            markPlaceForUser(placeObj, userId);
            getNearbyLocations();
        })
    }else{
        document.getElementById('iwasthere').innerHTML = "Nebyl jsem tady.";
        //TODO unseen place
    }
}

function setMarkerColor(marker, color) {
    marker.setIcon(new google.maps.MarkerImage("https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|"+color ,
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34)));
}