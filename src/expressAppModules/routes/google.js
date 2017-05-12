// Send to google to do the authentication.
app.get('/auth/google', passport.authenticate('google', { scope: 'email', session: false }));

// Handle callback after google has authenticated the user.
app.get('/auth/google/callback', passport.authenticate('google'));

app.get('/auth/google/callback', function(req, res, next) {
    passport.authenticate('google', { session: false }, function(err, user, info) {

    });
});

// How will the connection of g+ account to local account be handled? Another route?