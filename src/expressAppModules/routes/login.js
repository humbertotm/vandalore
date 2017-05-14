// Log in a user with local strategy.
app.post('/login', function(req, res) {
    passport.authenticate('local-login', function(err, user, info) {
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