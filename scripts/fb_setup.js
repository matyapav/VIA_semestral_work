
function statusChangeCallback(response) {
    console.log('statusChangeCallback');
    console.log(response);
    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    // Full docs on the response object can be found in the documentation
    // for FB.getLoginStatus().
    if (response.status === 'connected') {
        loginUserIntoApplication();
    } else if (response.status === 'not_authorized') {
        logout();
    } else {
        logout();
    }
}

function subscribeToEvents() {
    FB.Event.subscribe('auth.logout', logout_event);
}

function checkLoginState() {
    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });
}

window.fbAsyncInit = function() {
    FB.init({
        appId      : '177757152673157',
        cookie     : true,  // enable cookies to allow the server to access
                            // the session
        xfbml      : true,  // parse social plugins on this page
        version    : 'v2.5' // use graph api version 2.5
    });

    // Now that we've initialized the JavaScript SDK, we call
    // FB.getLoginStatus().  This function gets the state of the
    // person visiting this page and can return one of three states to
    // the callback you provide.  They can be:
    //
    // 1. Logged into your app ('connected')
    // 2. Logged into Facebook, but not your app ('not_authorized')
    // 3. Not logged into Facebook and can't tell if they are logged into
    //    your app or not.
    //
    // These three cases are handled in the callback function.

    if(localStorage.getItem("id")){
        checkLoginState();
    }else{
        performLogoutActions();
    }

};

(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function loginUserIntoApplication() {
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me',{ fields: 'name, email' }, function(response) {
        console.log('Successful login for: ' + response.name + " "+response.email);
        makeCorsRequest("GET", "https://ivebeenthereapi-matyapav.rhcloud.com/users", null, function (responseText) {
            var userIdByEmail = null;
            var alreadyExists = false;
            if(responseText){
                var users = JSON.parse(responseText);
                alreadyExists = checkIfUserAlreadyExists(users, response.email);
            }
            if(!alreadyExists){
                var data = "name="+response.name+"&email="+response.email;
                makeCorsRequest("POST", "https://ivebeenthereapi-matyapav.rhcloud.com/users", data, function (responseText) {
                    console.log(JSON.parse(responseText).message);
                    userIdByEmail = JSON.parse(responseText).id;
                    saveUserIdInLocalStorage(userIdByEmail);
                });
            }else{
                userIdByEmail = users[id]._id;
                saveUserIdInLocalStorage(userIdByEmail);
            }

            console.log(localStorage.getItem("id"));
            performLoginActions();
            document.getElementById('status').innerHTML =
                'Přihlášen jako, <a id="myBtn" onclick="showUserInfo()"> ' + response.name + '</a>!';

        });

    });
}

function checkIfUserAlreadyExists(users, email){
    for (id in users){
        if(users[id].email == email){
            return true;
        };
    }
    return false;
}

function  showUserInfo() {
    var userid = localStorage.getItem('id');
    if(userid){
        makeCorsRequest('GET', 'https://ivebeenthereapi-matyapav.rhcloud.com/users/'+userid, null, function (responseText) {
            initModal();
            var modalInfo = document.getElementById("modal-info");
            modalInfo.innerHTML = "Name: "+JSON.parse(responseText).name+"<br> Email: "+JSON.parse(responseText).email;
        })
    }

}

function saveUserIdInLocalStorage(user_id){
    // Check browser support
    if (typeof(Storage) !== "undefined") {
        // Store
        localStorage.setItem("id", user_id);

    } else {
        document.getElementById("result").innerHTML = "Sorry, your browser does not support Web Storage...";
    }
}

function fblogin() {
    FB.login(function (response) {
        if (response.authResponse) {
            checkLoginState();
        } else {
            console.log('User cancelled login or did not fully authorize.');
        }
    }, { scope: ['email', 'user_friends'] });
}

function logout(){
    if(confirm("Do you really want to logout?")){
        localStorage.removeItem("id");
        performLogoutActions();
    }
}

function getFriends(){
    FB.api('me/friends', { fields: 'id, first_name,picture', limit: 6 },function(response){
        console.log(response);
        var data = response.data;
        data.forEach(function (friend) {
            var photoUrl = friend.picture.data.url;
            FB.api('/'+friend.id,{ fields: 'email' }, function (response) {
                console.log(response);
            })
            document.getElementById("place-friends").innerText = "";
            document.getElementById("place-friends").innerHTML+= "<img src='"+photoUrl+"' style='width: 30px; padding: 3px'>"
        })

    });
}

function performLoginActions() {
    document.getElementById('login_btn').style = "display: none";
    document.getElementById('logout_btn').style = "display: block";
    if(somePlaceIsSelected){
        document.getElementById('actions').style = "visibility: visible";
    }
    document.getElementById('radius-input').addEventListener('change', getNearbyLocations);
    getNearbyLocations();
}

function performLogoutActions(){
    document.getElementById('status').innerHTML = 'Přihlašte se do této aplikace.';
    document.getElementById('login_btn').style = "display: block";
    document.getElementById('logout_btn').style = "display: none";
    document.getElementById('actions').style = "visibility: hidden";
    //clear previous markers
    clearMap();
    //unselect selected place
    clearTable();
}

var logout_event = function(response) {
    console.log("logout_event");
    console.log(response.status);
    console.log(response);
    checkLoginState();
}
