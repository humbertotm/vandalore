var passport = require('passport');
var jwt = require('jsonwebtoken');

// AUTHENTICATE REQUESTS WITH JWT =============================
// =================This will be handled by express-jwt========

/*
passport.use('jwt', new JwtStrategy(jwtOptions, function(req, jwtPayload, done) {
    var id = jwtPayload.id;

    process.nextTick(function() {
        User.findOne({'id': id}, function(err, user) {
            if(err)
                return done(err);

            if(!user)
                return done(null, false, {message: 'User not found.'});

            req.user = user;
            return done(null, user);
        });
    });
}));
*/

// LOCAL SIGN UP ==============================================
// ============================================================


// LOCAL LOG IN ==============================================
// ============================================================


// FACEBOOK AUTHENTICATION =====================================
// =============================================================


// GOOGLE AUTHENTICATION =======================================
// =============================================================
