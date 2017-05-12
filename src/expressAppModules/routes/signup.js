// Sign up a user with local strategy.
app.post('/signup', passport.authenticate('local-signup', { sessions: false }));

// Connect local credentials to user account.
app.post('/connect/local', passport.authorize('local-signup'));

app.post('/signup', function(req, res, next) {
    passport.authenticate('local-signup', { session: false }, function(err, user, info) {

    });
});