window.addEventListener('load', function() {
    var idToken;
    var accessToken;
    var expiresAt;

    var webAuth = new auth0.WebAuth({
        domain: 'szabolcsadam.eu.auth0.com',
        clientID: 'Eub6vCvi6JR3Rq0kOiFPkKjJ3CLfIIw9',
        redirectUri: 'http://localhost:8080',
        responseType: 'token id_token',
        scope: 'openid',
        leeway: 60
    });

    var loginBtn = document.getElementById('qsLoginBtn');
    var logoutBtn = document.getElementById('qsLogoutBtn');

    loginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        webAuth.authorize();
    });

    logoutBtn.addEventListener('click', logout);

    function localLogin(authResult) {
        // Set isLoggedIn flag in localStorage
        localStorage.setItem('isLoggedIn', 'true');
        // Set the time that the access token will expire at
        expiresAt = JSON.stringify(
            authResult.expiresIn * 1000 + new Date().getTime()
        );
        accessToken = authResult.accessToken;
        idToken = authResult.idToken;
    }

    function renewTokens() {
        webAuth.checkSession({}, (err, authResult) => {
            if (authResult && authResult.accessToken && authResult.idToken) {
                localLogin(authResult);
            } else if (err) {
                alert(
                    'Could not get a new token '  + err.error + ':' + err.error_description + '.'
                );
                logout();
            }
            displayButtons();
        });
    }

    function logout() {
        // Remove isLoggedIn flag from localStorage
        localStorage.removeItem('isLoggedIn');
        // Remove tokens and expiry time
        accessToken = '';
        idToken = '';
        expiresAt = 0;

        webAuth.logout({
            return_to: window.location.origin
        });

        displayButtons();
    }

    function isAuthenticated() {
        // Check whether the current time is past the
        // access token's expiry time
        var expiration = parseInt(expiresAt) || 0;
        return localStorage.getItem('isLoggedIn') === 'true' && new Date().getTime() < expiration;
    }

    function handleAuthentication() {
        webAuth.parseHash(function(err, authResult) {
            if (authResult && authResult.accessToken && authResult.idToken) {
                window.location.hash = '';
                localLogin(authResult);
                loginBtn.style.display = 'none';
            } else if (err) {
                console.log(err);
                alert(
                    'Error: ' + err.error + '. Check the console for further details.'
                );
            }
            displayButtons();
        });
    }

    function displayButtons() {
        if (isAuthenticated()) {
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'inline-block';
        } else {
            loginBtn.style.display = 'inline-block';
            logoutBtn.style.display = 'none';
        }
    }

    if (localStorage.getItem('isLoggedIn') === 'true') {
        renewTokens();
    } else {
        handleAuthentication();
    }
});