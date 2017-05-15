var passport = require('passport');
var expressJWT = require('express-jwt');
// What else do I need to properly set up passport strategies here?

var authRoutes = require('express').Router();

authRoutes.use(expressJWT({ credentialsRequired: false }));

// ======FACEBOOK=======================

// Send to facebook to do the authentication.
authRoutes.get('/facebook', passport.authenticate('facebook', { session: false, scope: ['email'] }));

// Connect facebook credentials to existing account.
authRoutes.get('/connect/facebook', passport.authenticate('facebook', { session: false, scope: ['email'] }));

// Handle callback after facebook has authenticated the user.
authRoutes.get('/facebook/callback', function(req, res) {
    passport.authenticate('facebook', function(err, user, info) {

    })(req, res);
});

// =======GOOGLE=========================

// Send to google to do the authentication.
authRoutes.get('/google', passport.authenticate('google', { session: false, scope: [/* Required google APIs */] }));

// Connect google credentials to existing account.
authRoutes.get('/connect/google', passport.authenticate('google', { session: false, scope: [/* Required google APIs */] }));

// Handle callback after google has authenticated the user.
authRoutes.get('/google/callback', function(req, res) {
    passport.authenticate('google', { session: false }, function(err, user, info) {

    })(req, res);
});

// =======LOCAL=============================

// Sign up a user with local strategy.
authRoutes.post('/local/signup', function(req, res) {
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
authRoutes.post('/connect/local', function(req, res) {
    passport.authenticate('local-signup', function(err, user, info) {
        // Something cool.
    })(req, res);
});

// Log in a user with local strategy.
authRoutes.post('/local/login', function(req, res) {
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


module.exports = authRoutes;