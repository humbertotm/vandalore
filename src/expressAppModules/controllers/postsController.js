// Require necessary models.
var Post = require('../models/postModel');
var User = require('../models/userModel');
var Category = require('../../../src/expressAppModules/models/categoryModel');

// Require mongoose and set bluebird to handle its promises.
var  mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

// Creates and responds with a new post.
module.exports.create_post = function(req, res, next) {
	if(req.user) {
		var userId = req.user._id;

		var post = new Post();
		post.title = req.body.title;
		post.description = req.body.description;
		// This is provisional. 
		// Don't know yet how image uploading will be handled.
		post.image = req.body.image;
		post.category = req.body.category;
		post.userId = userId;

		return post.save().then(function(createdPost) {
			res.json(createdPost);
			next(createdPost);
		})
		.catch(function(err) {
			res.status(500).json(err);
		});
	} else {
		// User not authenticated
		res.status(401).json({
			message: 'Please authenticate.'
		});	
	}	
}

// Pushes and saves new post in corresponding user and category ref.
module.exports.push_and_save_post = function(post) {
	var userId = post.userId;
	var categoryId = post.category;

	var promises = [
		User.findById(userId).exec(),
		Category.findById(categoryId).exec()
	];

	var promisedDocs = Promise.all(promises);

	function pushAndSave(doc) {
		doc.posts.push(post);
		return doc.save();
	}

	return promisedDocs.then(function(docs) {
		docs.map(pushAndSave);
	})
	.catch(function(err) {
		console.log(err);
	});
}

// Deletes a post.
module.exports.delete_post = function(req, res) {
	if(req.user) {
		var authUserId = req.user._id;
		var postId = req.body.post._id;

		return Post.findById(postId).exec().then(function(post) {
			if(post.userId === authUserId) {
				return post.remove().then(function(removedPost) {
					res.json({
						message: 'Post successfully deleted.',
						post: removedPost
					});
				});
			} else {
				// If authenticated user does not match owner of post.
				res.status(403).json({
					message: 'You are not authorized to perform this operation.'
				});	
			}
		})
		.catch(function(err) {
			res.status(500).json(err);
		});
	} else {
		// If no user is authenticated
		res.status(401).json({
			message: 'Please authenticate.'
		});	
	}
}

// Gets a post.
module.exports.get_post = function(req, res) {
	var postId = req.params.postId;

	return Post.findById(postId).populate({
		path: 'comments',
		options: { limit: 20 }
	}).exec().then(function(post) {
		res.json(post);
	})
	.catch(function(err) {
		res.status(500).json(err);
	});
}

// Gets a post's comments.
module.exports.get_post_comments = function(req, res) {
	var postId = req.params.postId;

	return Post.findById(postId).populate({
		path: 'comments',
		options: { limit: 20 }
	}).exec().then(function(post) {
		res.json(post.comments);
	})
	.catch(function(err) {
		res.status(500).json(err);
	});
}