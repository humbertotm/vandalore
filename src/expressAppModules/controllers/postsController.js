// Require necessary models.
var Post         = require('../models/postModel'),
    User         = require('../models/userModel'),
    Category     = require('../../../src/expressAppModules/models/categoryModel');

// Require mongoose and set bluebird to handle its promises.
var mongoose     = require('mongoose');
var Promise      = require('bluebird');
mongoose.Promise = Promise;

// Creates and responds with a new post.
module.exports.create_post = function(req, res, next) {
    if(req.user) {
        var userId = req.user._id; // String

        var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

        if(!checkForHexRegExp.test(userId)) {
            throw new Error('Bad parameters.');
        }

        return User.findById(userId).exec().then(function(user) {
            if(user === null) {
                return res.status(404).json({
                    message: 'User not found.'
                });
            }

            var post = new Post();
            post.title = req.body.title;
            post.description = req.body.description;
            post.imageUrl = req.file.location;
            post.category = req.body.category;
            post.userId = user._id;

            return post.save();
        }).then(function(post) {
            res.json({
                entities: {
                    posts: post
                }
            });
        }).catch(function(err) {
            next(err);
        });
    } else {
        // User not authenticated
        res.status(401).json({
            message: 'Please authenticate.'
        });
    }
}

// Deletes a post.
module.exports.delete_post_user = function(req, res, next) {
    if(req.user) {
        var authUserId = req.user._id; // String
        var postId = req.body._id; // String

        var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

        if(!checkForHexRegExp.test(authUserId) || !checkForHexRegExp.test(postId)) {
            throw new Error('Bad parameters.');
        }

        // First, we remove it from user.posts.
        return User.findById(authUserId).exec().then(function(user) {
            if(user === null) {
                return res.status(404).json({
                    message: 'User not found.'
                });
            }

            // var index = user.posts.indexOf(mongoose.Types.ObjectId(postId));
            var index = user.posts.indexOf(postId);
            if(index === -1) {
                return res.status(403).json({
                    message: 'You are not authorized to perform this operation.'
                });
            }

            user.posts.splice(index, 1);
            user.save().then(function() {
                next();
            });
        }).catch(function(err) {
            next(err);
        });
    } else {
        // If no user is authenticated
        res.status(401).json({
            message: 'Please authenticate.'
        });
    }
}

// This complements post.remove middleware.
module.exports.delete_post = function(req, res, next) {
    var postId = req.body._id; // String

    return Post.findById(postId).then(function(post) {
        if(post === null) {
            return res.status(404).json({
                message: 'Post not found.'
            });
        }

        return post.remove().then(function() {
            res.json({
                message: 'Post successfully deleted.',
                postId: postId
            });
        });
    }).catch(function(err) {
        next(err);
    });
}

// Gets a post.
module.exports.get_post = function(req, res, next) {
    var postId = req.params.postId; // String

    var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

    if(!checkForHexRegExp.test(postId)) {
        throw new Error('Bad parameters.');
    }

    // Maybe a cursor for streaming would work better?
    return Post.findById(postId).populate({
        path: 'comments',
        options: { limit: 20 }
    }).populate({
        path: 'user'
    }).exec().then(function(post) {
        if(post === null) {
            return res.status(404).json({
                message: 'Post not found.'
            });
        }

        res.json({
            entities: {
                posts: post,
                comments: post.comments
            }
        });
    }).catch(function(err) {
        next(err);
    });
}

// Gets a post's comments.
module.exports.get_post_comments = function(req, res, next) {
    var postId = req.params.postId; // String

    var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

    if(!checkForHexRegExp.test(postId)) {
        throw new Error('postId provided is not an instance of ObjectId.');
    }

    // Maybe a cursos for streaming would work better here?
    return Post.findById(postId).populate({
        path: 'comments',
        options: { limit: 20 },
        populate: {
            path: 'user',
            select: 'username miniProfilePic _id'
        }
    }).exec().then(function(post) {
        if(post === null) {
            return res.status(404).json({
                message: 'Post not found.'
            });
        }

        var comments = post.comments;
        var postComms = [];
        comments.forEach(function(comm) {
            if(comm.user !== null) {
                postComms.push(comm);
            }
        });

        res.json({
            entities: {
                comments: postComms
            }
        });
    }).catch(function(err) {
        next(err);
    });
}