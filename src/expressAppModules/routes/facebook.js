// Send to facebook to do the authentication.
app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email', session: false }));

// Handle callback after facebook has authenticated the user.
app.get('/auth/facebook/callback', function(req, res, next) {
    passport.authenticate('facebook', { session: false }, function(err, user, info) {

    });
});
// How will the connection of Fb account to local account be handled? Another route?