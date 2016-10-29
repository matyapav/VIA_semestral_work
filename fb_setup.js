var isLoggedIn = false;

// This is called with the results from from FB.getLoginStatus().

function statusChangeCallback(response) {
    console.log('statusChangeCallback');
    console.log(response);
    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    // Full docs on the response object can be found in the documentation
    // for FB.getLoginStatus().
    if (response.status === 'connected') {
        // Logged into your app and Facebook.
        loginUserIntoApplication();
        document.getElementById('login_btn').style = "display: none";
        document.getElementById('logout_btn').style = "display: block";
        if(somePlaceIsSelected){
            document.getElementById('actions').style = "visibility: visible";
        }
        isLoggedIn = true;

    } else if (response.status === 'not_authorized') {
        // The person is logged into Facebook, but not your app.
        document.getElementById('status').innerHTML = 'Přihlašte se do této aplikace.';
        document.getElementById('login_btn').style = "display: block";
        document.getElementById('logout_btn').style = "display: none";
        document.getElementById('actions').style = "visibility: hidden";
        isLoggedIn = false;

    } else {
        // The person is not logged into Facebook, so we're not sure if
        // they are logged into this app or not.
        document.getElementById('status').innerHTML = 'Přihlašte se pomocí Facebooku.';
        document.getElementById('login_btn').style = "display: block";
        document.getElementById('logout_btn').style = "display: none";
        document.getElementById('actions').style = "visibility: hidden";
        isLoggedIn = false;

    }
}

function subscribeToEvents() {
    FB.Event.subscribe('auth.logout', logout_event);
}

// This function is called when someone finishes with the Login
// Button.  See the onlogin handler attached to it in the sample
// code below.
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

    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });

};

// Load the SDK asynchronously
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
        var usersJSON = httpRequest("GET", "https://ivebeenthereapi-matyapav.rhcloud.com/users");
        var users = JSON.parse(usersJSON);
        alert(users);
        document.getElementById('status').innerHTML =
            'Přihlášen jako, ' + response.name + '!';
    });
}
function fblogin()
{

    FB.login(function (response) {
        if (response.authResponse) {
            checkLoginState();
        } else {
            console.log('User cancelled login or did not fully authorize.');
        }
    }, { scope: 'email' });

}

var logout_event = function(response) {
    console.log("logout_event");
    console.log(response.status);
    console.log(response);
    checkLoginState();
}

var httpRequest = function(method, url){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            return xmlHttp.responseText;
    }
    xmlHttp.open(method, url, true); // true for asynchronous
    xmlHttp.setRequestHeader('Access-Control-Allow-Origin', '*');
    xmlHttp.setRequestHeader('Content-Type', "application/json")
    xmlHttp.send(null);
}