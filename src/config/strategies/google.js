var configAuth = require('../auth');

var passport = require('passport');
var passportGoogle = require('passport-google-oauth');
var jwt = require('jsonwebtoken');

var GoogleStrategy = passportGoogle.OAuth2Strategy;

// How do we handle Google failing to find user with provided credentials?


// GOOGLE AUTHENTICATION =======================================
// =============================================================

var googleStrategy = configAuth.googleAuth;
googleStrategy.passReqToCallback = true;

passport.use(new GoogleStrategy(googleStrategy, function(req, accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
        // check if user is already logged in with express-jwt credentialsRequired: false
        if(!req.user) {
            User.findOne({'google.id': profile.id}, function(err, user) {
                if (err)
                    return done(err);

                if(user) {
                    // if there is a user id already but no token (user linked at one point and unlinked.)
                    if(!user.google.token) {
                        user.google.token = accessToken;
                        user.google.displayName = profile.displayName;
                        user.google.email = (profile.emails[0].value || '').toLowerCase();

                        user.save(function(err) {
                            if(err)
                                return done(err);

                            // Create a token and return it along with user.
                            var payload = {id: user._id};
                            var token = jwt.sign(payload, secret, algorithm);
                            return done(null, user, {
                                token: token,
                                message: 'Google account successfully connected.'
                            });
                        });
                    }

                    // user found, return that user.
                    var payload = {id: user._id};
                    var token = jwt.sign(payload, secret, algorithm);
                    return done(null, user, {
                        token: token,
                        message: 'Successfully logged in with Google credentials.'
                    });
                } else {
                    // if no user is found, create it.
                    var newUser = User();

                    newUser.google.id = profile.id;
                    newUser.google.token = accessToken;
                    newUser.google.displayName = profile.displayName;
                    newUser.username = profile.displayName;
                    newUser.google.email = (profile.emails[0].value || '').toLowerCase();

                    newUser.save(function(err) {
                        if(err)
                            return done(err);

                        var payload = {id: newUser._id};
                        var token = jwt.sign(payload, secret, algorithm);
                        return done(null, newUser, token);
                    });
                }
            });
        } else {
            // User is logged in (jwt in request headers), link accounts.
            var userId = req.user._id;

            User.findOne({'_id': userId}, function(err, user) {
                if(err)
                    return done(err);

                user.google.id = profile.id;
                user.google.token = accessToken;
                user.google.displayName = profile.displayName;
                user.google.email = (profile.email[0].value || '').toLowerCase();

                user.save(function(err) {
                    if(err)
                        return done(err);

                    return done(null, user);
                });
            });
        }
    });
}));