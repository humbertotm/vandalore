// Sign up a user with local strategy.
app.post('/signup', function(req, res) {
    passport.authenticate('local-signup', function(err, user, info) {
        if(err)
            res.status(500).json(err);

        if(user)
            res.json({
                user: user,
                token: info
            });

        res.status(/* info.status */).json(info.message);
    })(req, res);
});

// Connect local credentials to user account.
app.post('/connect/local', function(req, res) {
    passport.authenticate('local-signup', function(err, user, info) {
        // Something cool.
    });
});


