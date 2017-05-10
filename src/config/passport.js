// Vandalorian
// passportConfig

/*

var passport = require('passport');
var passportJwt = require('passport-jwt');
var jwt = require('jsonwebtoken');

var JwtStrategy = passportJwt.Strategy;
var ExtractJwt = passportJwt.ExtractJwt;

var jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeader();
jwtOptions.secretOrKey = 'someString';
jwtOptions.passReqToCallback = true;

// AUTHENTICATE REQUESTS WITH JWT =============================
// ============================================================

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

// LOCAL SIGN UP ==============================================
// ============================================================

passport.use('local-signup', new JwtStrategy(jwtOptions, function(req, jwtPayload, done) {
	var username = req.body.username;
	var email = req.body.email.toLowerCase();
	var password = req.body.password;
	var passwordConfirmation = req.body.passwordConfirmation;

	var jwtToken = req.headers.token;

	process.nextTick(function() {
		// First, we'll check there is no logged in user.
		if(!jwtToken) {}
			User.findOne({ 'local.email': email }, function(err, user) {
				if(err)
					return done(err);

				// If user with provided mail already exists.
				if(user) {
					return done(null, false, {message: 'Email already in use.'});
				} else {
					// Create new user.
					var newUser = new User();
					newUser.local.username = username;
					newUser.local.email = email;
					newUser.local.password = password;
					newUser.local.passwordConfirmation = passwordConfirmation;

					newUser.save(function(err) {
						if(err)
							return done(err);

						var payload = {id: newUser.id};
						var token = jwt.sign(payload, jwtOptions.secretOrKey);	

						return done(null, newUser, token);
					});
				}			
			});
		} else {
			// Logged in user, presumably linking account to local credentials.
			var userId = jwtToken.id;
			User.findOne({'local.email': email}, function(err, user) {
				if(err)
					return done(err);
				
				// If a user with such email is found, return message: 'Email taken.'
				if(user) { 
					return done(null, false, {message: 'Email already in use.'});
				} else {
					// If no user with that email is found, add creds to user.local
					User.findOne({'id:' userId}, function(err, user) {
						if(err)
							return done(err);

						if(user) {
							user.local.username = username;
							user.local.email = email.toLowerCase();
							user.local.password = generateHash(password);

							save.user(function(err) {
								if(err)
									return done(err);

								return done(null, user);
							});
						}
					});
				}
			});
		}
	});
}));

// LOCAL LOG IN ==============================================
// ============================================================

// Just need to know how to pass the objects this middleware returns 
// to the next function to send them in the res.

passport.use('local-login', new JwtStrategy(jwtOptions, function(req, jwtPayload, done) {
	var email = req.body.email.toLowerCase();
	var password = req.body.password;

	if(!(email && password)) {
		return done(null, false, {message: 'Enter email and password.'});
	}

	process.nextTick(function() {
		User.findOne({'local.email': email}, function(err, user) {
			if(err)
				return done(err);

			if(!user) 
				return done(null, false, {message: 'User not found.'});

			if(!user.validPassword(password))
				return done(null, false, {message: 'Incorrect password.'});
			
			else
				var payload = {id: user.id};
				var token = jwt.sign(payload, jwtOptions.secretOrKey);
				return done(null, user, token);
		})
	});
}));

// FACEBOOK AUTHENTICATION =====================================
// =============================================================

var fbStrategy = configAuth.facebookAuth;
fbStrategy.passReqToCallback = true;

passport.use(new FacebookStrategy(fbStrategy, 
function(req, token, refreshToken, profile, done) {
	// Extract token from req.headers if there is one.
	var jwtToken = req.headers.token;

	process.nextTick(function() {
		// check if user is already logged in.
		if(!jwtToken) {
			User.findOne({'facebook.id: profile.id'}, function(err, user){
				if(err)
					return done(err);

				if(user) {
					// if there is a user id already but no token (user linked at one point and unlinked.)
					if(!user.facebook.token) {
						user.facebook.token = token;
            user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
            user.facebook.email = (profile.emails[0].value || '').toLowerCase();

            user.save(function(err) {
							if(err)
								return done(err);

							return done(null, user);
            });
					}

					// user found, return that user.
					return done(null, user);
				} else {
					// if no user is found, create it.
					var newUser = new User();

					newUser.facebook.id = profile.id;
					newUser.facebook.token = token;
					newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
					newUser.facebook.email = (profile.emails[0].value || '').toLowerCase();

					newUser.save(function(err) {
						if(err)
							return done(err);

						var payload = {id: newUser.id};
						var token = jwt.sign(payload, jwtOptions.secretOrKey);
						return done(null, newUser, token);
					});
				}
			});
		} else {
			// User is logged in (jwt in request headers), link accounts.
			process.nextTick(function() {
				// Extract userId from jwt.
				var userId = req.headers.token.id;

				User.findOne({'id': userId}, function(err, user) {
					if(err)
						return done(err);

					user.facebook.id = profile.id;
          user.facebook.token = token;
          user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
          user.facebook.email = (profile.emails[0].value || '').toLowerCase();

          user.save(function(err) {
						if(err)
							return done(err);

						return done(null, user);
          });
				});
			});
		}
	});
}));


// GOOGLE AUTHENTICATION =======================================
// =============================================================

var googleStrategy = configAuth.googleAuth;
googleStrategy.passReqToCallback = true;

passport.use(new GoogleStrategy(googleStrategy, 
	// set callbackURL to hit the API
function(req, token, refreshToken, profile, done) {
	// Extract token from req.headers if there is one.
	var jwtToken = req.headers.token;

	process.nextTick(function() {
		// check if user is already logged in.
		if(!jwtToken) {
			User.findOne({'google.id': profile.id}, function(err, user) {
				if (err)
					return done(err);

				if(user) {
					// if there is a user id already but no token (user linked at one point and unlinked.)
					if(!user.google.token) {
						user.google.token = token;
						user.google.name = profile.displayName;
						user.google.email = (profile.emails[0].value || '').toLowerCase();

						user.save(function(err) {
							if(err)
								return done(err);

							return done(null, user);
						});
					}

					// user found, return that user.
					return done(null, user);
				} else {
					// if no user is found, create it.
					var newUser = User();

					newUser.google.id = profile.id;
					newUser.google.token = token;
					newUser.google.name = profile.displayName;
					newUser.google.email = (profile.emails[0].value || '').toLoweCase();

					newUser.save(function(err) {
						if(err)
							return done(err);

						var payload = {id: newUser.id};
						var token = jwt.sign(payload, jwtOptions.secretOrKey);
						return done(null newUser, token);
					});
				}
			});
		} else {
			// User is logged in (jwt in request headers), link accounts.
			process.nextTick(function() {
				// Extract userId from token.
				var userId = req.header.token.id;
				User.findOne({'id': userId}, function(err, user) {
					if(err)
						return done(err);

					user.google.id = profile.id;
					user.google.token = token;
					user.google.name = profile.displayName;
					user.google.email = (profile.email[0].value || '').toLoweCase();

					user.save(function(err) {
						if(err)
							return done(err);

						return done(null, user);
					});
				});
			});
		}
	});
}));

/*