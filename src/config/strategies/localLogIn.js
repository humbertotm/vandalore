var configAuth = require('../auth');

var passport = require('passport');
var passportLocal = require('passport-local');
var jwt = require('jsonwebtoken');
var LocalStrategy = passportLocal.Strategy;

var localOpts = {};
localOpts.usernameField = 'email';
localOpts.passwordField = 'password';
localOpts.passReqToCallback = true;
localOpts.session = false;

// LOCAL LOG IN ==============================================
// ============================================================

passport.use('local-login', new LocalStrategy(localOpts, function(req, email, password, done) {
    var email = email.toLowerCase();
    var password = password;
    var authToken = req.get('Authorization'); // Get token from header if there is one.

    if(authToken) {
        return done(null, false, { message: 'Already logged in.' });
    }

    if(!(email && password)) {
        return done(null, false, { message: 'Enter email and password.' });
    }

    process.nextTick(function() {
        User.findOne({'local.email': email}, function(err, user) {
            if(err)
                return done(err);

            if(!user)
                return done(null, false, { message: 'User not found.',
                                           status: 401 });

            if(!user.validPassword(password)) {
                return done(null, false, { message: 'Incorrect password.' });
            } else {
                var payload = {id: user._id};
                var token = jwt.sign(payload, 'secret');
                return done(null, user, token);
            }
        })
    });
}));