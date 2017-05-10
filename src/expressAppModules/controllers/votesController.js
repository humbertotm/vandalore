// Require neccessary models.
var Vote = require('../models/voteModel');
var User = require('../models/userModel');
var Post = require('../models/postModel');
var Notification = require('../models/notificationModel');

// Require mongoose and set bluebird to handle its promises.
var  mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var votesForHot = require('../utils').votesForHot;

// Creates a new vote and sends it in response.
module.exports.create_vote = function(req, res, next) {
	if(req.user) {
		var userId = req.user._id;
		var postId = req.body.postId;
		
		var vote = new Vote();
		vote.userId = userId;
		vote.postId = postId;

		return vote.save().then(function(createdVote) {
			res.json(createdVote);
			next(createdVote);
		})		
		.catch(function(err) {
			res.status(500).json(err);
		});
	} else {
		// If no authenticated user
		res.status(401).json({
			message: 'Please authenticate.'
		});
	}
}

// Pushes newly created vote into refs in user and post docs.
module.exports.push_and_save_vote = function(vote, next) {
	var userId = vote.userId;
	var postId = vote.postId;

	var promises = [
		User.findById(userId).exec(),
		Post.findById(postId).exec()
	];

	var promisedDocs = Promise.all(promises);

	function pushAndSave(doc) {
		doc.votes.push(vote);
		return doc.save();
	}

	function passPostToNext(doc) {
		if(doc.constructor.modelName === 'Post') {
			next(doc);
		} else {
			return;
		}
	}

	return promisedDocs.then(function(docs) {
		docs.map(pushAndSave);
		docs.map(passPostToNext);
	})
	.catch(function(err) {
		// Verify that logging this errors is 
		// not an expensive operation performance-wise.
		console.log(err);
	});
}

// Checks the vote count for post to verify if there is
// a need to create a notification.
module.exports.check_vote_count = function(post, next) {
	var voteCount = post.votes.length;

	if(voteCount > votesForHot()) {
		var notification = new Notification();
		notification.userId = post.userId;
		notification.postId = post._id;
		notification.message = 'Your post has reached the Hot Page!';

		return notification.save().then(function(notification) {
			next(notification);
		})
		.catch(function(err) {
			console.log(err);
		});
	} else {
		return;
	}
}

// Pushes and saves newly created notification to corresponding user.
module.exports.push_and_save_notification = function(notification) {
	var userId = notification.userId;

	return User.findById(userId).exec().then(function(user) {
		user.notifications.push(notification);
		return user.save();
	})
	.catch(function(err) {
		console.log(err);
	});
}

// Deletes a vote.
module.exports.delete_vote = function(req, res) {
	if(req.user) {
		var authUserId = req.user._id;
		var voteId = req.body.vote._id;

		return Vote.findById(voteId).exec().then(function(vote) {
			if(vote.userId === authUserId) {
				return vote.remove().then(function(removedVote) {
					res.json({
						message: "Vote successfully deleted.",
						vote: removedVote
					});
				});
			} else {
				// If authenticated user does not match owner of vote doc.
				res.status(403).json({
					message: 'You are not authorized to perform this operation.'
				});	
			}
		})
		.catch(function(err) {
			res.status(500).json(err);
		})
	} else {
		// If no authenticated user
		res.status(401).json({
			message: 'Please authenticate.'
		});	
	}
}