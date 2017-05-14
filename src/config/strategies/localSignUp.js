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

// LOCAL SIGN UP ==============================================
// ============================================================

passport.use('local-signup', new LocalStrategy(localOpts, function(req, email, password, done) {
    var username = req.body.username;
    var email = email.toLowerCase();
    var password = password;
    var passwordConfirmation = req.body.passwordConfirmation;

    // I migth use express-jwt with credentialsRequired: false
    // var jwtToken = req.get('Authorization');  Check if there is a token in headers.

    process.nextTick(function() {
        // First, we'll check there is no logged in user.
        if(!req.user) {
            if(!(password === passwordConfirmation))
                return done(null, false, { message: 'Password confirmation does not match password.' });

            User.findOne({ 'local.email': email }, function(err, user) {
                if(err)
                    return done(err);

                // If user with provided email already exists.
                if(user) {
                    return done(null, false, { message: 'Email already in use.' });
                } else {
                    // Create new user.
                    var newUser = new User();
                    newUser.username = username;
                    newUser.local.email = email;
                    newUser.local.password = hashPassword(password);

                    newUser.save(function(err) {
                        if(err)
                            return done(err);

                        var payload = {id: newUser._id};
                        var token = jwt.sign(payload, getSecretFromSomewhere, Algorithm);

                        return done(null, newUser, token);
                    });
                }
            });
        } else {
            // Logged in user, presumably linking account to local credentials.
            // We might be able to secure /connect/local with express-jwt
            // to set req.user after authenticated.
            var userId = req.user._id;

            if(!(password === passwordConfirmation)) {
                return done(null, false, { message: 'Password does not match password confirmation.' });
            }

            User.findOne({'local.email': email}, function(err, user) {
                if(err)
                    return done(err);

                // If a user with such email is found, return message: 'Email taken.'
                if(user) {
                    return done(null, false, { message: 'Email already in use.' });
                } else {
                    User.findById(userId, function(err, user) {
                        if(err)
                            return done(err);

                        user.local.email = email;
                        user.local.password = hashPassword(password);
                        user.username = username;

                        save.user(function(err) {
                            if(err)
                                return done(err);

                            return done(null, user, { message: 'Social credentials successfully connected.' });
                        });
                    });

                }
            });
        }
    });
}));