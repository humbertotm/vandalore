// Log in a user with local strategy.
app.post('/login', function(req, res, next) {
    passport.authenticate('local-login', { session: false }, function(err, user, info) {

    });
});