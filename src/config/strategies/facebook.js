var configAuth = require('../auth');

var passport = require('passport');
var passportFacebook = require('passport-facebook');
var jwt = require('jsonwebtoken');

var FacebookStrategy = passportFacebook.Strategy;

// How do we handle Facebook failing to find user with provided credentials?


// FACEBOOK AUTHENTICATION =====================================
// =============================================================

var fbStrategy = configAuth.facebookAuth;
fbStrategy.passReqToCallback = true;

passport.use(new FacebookStrategy(fbStrategy,
function(req, accessToken, refreshToken, profile, done) {

    process.nextTick(function() {
        // check if user is already logged in with express-jwt credentialsRequired: false
        if(!req.user) {
            User.findOne({'facebook.id': profile.id}, function(err, user){
                if(err)
                    return done(err);

                if(user) {
                    // if there is a user id already but no token (user linked at one point and unlinked.)
                    if(!user.facebook.token) {
                        user.facebook.token = accessToken;
                        user.facebook.displayName  = profile.displayName;
                        user.facebook.email = (profile.emails[0].value || '').toLowerCase();

                        user.save(function(err) {
                            if(err)
                                return done(err);

                            // Create a token and return it along with user.
                            var payload = {id: user._id};
                            var token = jwt.sign(payload, 'secret');
                            return done(null, user, {
                                token: token,
                                message: 'Facebook account successfully connected.'
                            });
                        });
                    }

                    // user found, return that user.
                    var payload = {id: user._id};
                    var token = jwt.sign(payload, secret, algorithm);
                    return done(null, user, {
                        token: token,
                        message: 'Successfully logged in with Facebook credentials.'
                    });
                } else {
                    // if no user is found, create it.
                    var newUser = new User();

                    newUser.facebook.id = profile.id;
                    newUser.facebook.token = accessToken;
                    newUser.facebook.displayName = profile.displayName;
                    newUser.username = profile.displayName;
                    newUser.facebook.email = (profile.emails[0].value || '').toLowerCase();

                    newUser.save(function(err) {
                        if(err)
                            return done(err);

                        var payload = {id: newUser._id};
                        var token = jwt.sign(payload, 'secret');
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

                user.facebook.id = profile.id;
                user.facebook.token = accessToken;
                user.facebook.displayName  = profile.displayName;
                user.facebook.email = (profile.emails[0].value || '').toLowerCase();

                user.save(function(err) {
                    if(err)
                        return done(err);

                    return done(null, user);
                });
            });
        }
    });
}));