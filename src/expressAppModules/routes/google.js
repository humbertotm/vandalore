

// Send to google to do the authentication.
app.get('/auth/google', passport.authenticate('google', { session: false, scope: [/* Required google APIs */], session: false }));

// Handle callback after google has authenticated the user.
app.get('/auth/google/callback', function(req, res) {
    passport.authenticate('google', { session: false }, function(err, user, info) {

    })(res, res);
});

// How will the connection of g+ account to local account be handled? Another route?