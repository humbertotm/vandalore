// Require User model.
var User = require('../models/usersModel');

// Require hashPassword util function.
var hashPassword = require('../utils').hashPassword;

/*
export.create_user_local = function(req, res) {
		*** This is for local strategy. ***

		Store new instance of User with key values provided 
		in req.body.

		Save new document in Users collection.

		On success:
			Return newly created User document as JSON.

		On error: 
			Return error message.
};
*/


export.delete_user = function(req, res) {
	if(req.user) {
		var authUserId = req.user._id;
		var userId = req.body.user._id;

		User.findById(userId).exec().then(function(user) {
			if(user._id === authUserId) {
				return user.remove().then(function(removedUser) {
					res.status(200).json({
						message: 'User successfully deleted.',
						user: removedUser
					});
				});
			}

			// If authenticated user does not match owner of user doc.
			res.status(403).json({
				message: 'You are not authorized to perform this operation.'
			});
		})
		.catch(function(err) {
			res.json(err);
		});
	}

	// If no authenticated user
	res.status(401).json({
		message: 'Please authenticate.'
	});
}

export.update_user_profile = function(req, res) {
	if(req.user) {
		var authUserId = req.user._id;
		var userId = req.body.user._id;

		User.findById(userId).exec().then(function(user) {
			if(user._id === authUserId) {
				user.username === req.body.user.username || user.username;
				user.profilePic === req.body.user.profilePic || user.profilePic;
				user.bio === req.body.user.bio || user.bio;

				return user.save().then(function(updatedUser) {
					res.json({
						message: 'Profile successfully updated!',
						user: updatedUser
					});
				});
			}

			// If authenticated user does not match owner of user doc.
			res.status(403).json({
				message: 'You are not authorized to perform this operation.'
			});
		})
		.catch(function(err) {
			res.json(err);
		});
	}

	// If no authenticated user
	res.status(401).json({
		message: 'Please authenticate.'
	});
}

export.update_user_local_email = function(req, res) {
	if(req.user) {
		var authUserId = req.user._id;
		var userId = req.body.userId;

		User.findById(userId).exec().then(function(user) {
			if(user._id === authUserId) {
				if(user.local) {
					user.local.email = req.user.email || user.local.email;
					return user.save().then(function(updatedUser) {
						res.json({
							message: 'Email successfully updated.',
							user: updatedUser
						});
					});
				}

				// If user has no local credentials
				res.status(403).json({
					message: 'You have not set any local credentials.'
				});
			}

			// If authenticated user does not match owner of user doc.
			res.status(403).json({
				message: 'You are not authorized to perform this operation.'
			});
		})
		.catch(function(err) {
			res.json(err);
		});
	}

	// If no authenticated user
	res.status(401).json({
		message: 'Please authenticate.'
	});
}

export.update_user_password = function(req, res) {
	if(req.user) {
		var authUserId = req.user._id;
		var userId = req.body.userId;

		User.findById(userId).exec().then(function(user) {
			if(user._id === authUserId) {
				if(user.local) {
					if(req.body.password && req.body.passwordConfirmation) {
						if(req.body.password === req.body.passwordConfirmation) {
							user.password === hashPassword(req.body.password, /* cb */);
							user.save().then(function(updatedUser) {
								res.status(200).json({
									message: 'Password successfully updated.'
								});
							});
						}
						// Handle password and passwordConfirmation not matching.
					}
					// Handle password or passwordConfirmation missing.
				}

				// If user has no local credentials
				res.status(403).json({
					message: 'You have not set any local credentials.'
				});
			}

			// If authenticated user does not match owner of user doc.
			res.status(403).json({
				message: 'You are not authorized to perform this operation.'
			});
		})
		.catch(function(err) {
			res.json(err);
		})
	}

	// If no authenticated user
	res.status(401).json({
		message: 'Please authenticate.'
	});
}

export.get_user = function(req, res) {
	var userId = req.params.userId;

	User.findById(userId).exec().then(function(user) {
		res.json(user);
	})
	.catch(function(err) {
		res.json(err);
	});
}

export.get_user_votes = function(req, res) {
	if(req.user) {
		var authUserId = req.user._id;

		User.findById(authUserId).populate({
			path: 'votes'
			// options: { limit: 100 }
		}).exec().then(function(user) {
			res.json(user.votes);
		})
		.catch(function(err) {
			res.json(err);
		});
	}

	// If no authenticated user
	res.status(401).json({
		message: 'Please authenticate.'
	});
}

export.get_user_posts = function(req, res) {
	var userId = req.params.userId;

	User.findById(userId).populate({
		path: 'posts',
		options: { limit: 100 }
	}).exec().then(function(user) {
		res.json(user.posts);
	})
	.catch(function(err) {
		res.json(err);
	});
}

export.get_user_feed_posts = function(req, res) {
	/*
		*** 
			This is a more complex piece of code.
			Will get back to it later.
		***
	*/
}