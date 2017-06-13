// Require neccessary models.
var User         = require('../models/userModel'),
    Post         = require('../models/postModel'),
    Notification = require('../models/notificationModel');

// Require mongoose and set bluebird to handle its promises.
var mongoose     = require('mongoose');
var Promise      = require('bluebird');
mongoose.Promise = Promise;

var votesForHot  = require('../utils').votesForHot;

// Verify user and post of interest exist in the DB, for both create and delete actions.
module.exports.verify_docs = function(req, res, next) {
    if(req.user) {
        var userId = req.user._id; // String
        var postId = req.body.postId; // String

        var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

        if(!checkForHexRegExp.test(userId) || !checkForHexRegExp.test(postId)) {
            throw new Error('Bad parameters.');
        }

        var promises = [
            Post.findById(postId).exec(),
            User.findById(userId).exec()
        ];

        return Promise.all(promises).then(function(results) {
            var nullDoc = false;
            for(var i = 0; i < results.length; i++) {
                if(results[i] === null) {
                    nullDoc = true;
                    break;
                }

                if(results[i].constructor.modelName === 'Post') {
                    req.post = results[i];
                }

                req.user = results[i];
            }

            if(nullDoc) {
                return res.status(404).json({
                    message: 'User and/or Post not found.'
                });
            }

            next();
        }).catch(function(err) {
            next(err);
        });
    } else {
        // If no authenticated user
        res.status(401).json({
            message: 'Please authenticate.'
        });
    }
}

// Creates a vote.
module.exports.create_vote = function(req, res, next) {
    var post = req.post,
        user = req.user;

    var index = user.votedPosts.indexOf(post._id);
    if(index !== -1) {
        return res.status(309).json({
            message: 'A vote for this post already exists.'
        });
    }

    user.votedPosts.push(post._id);
    return user.save().then(function() {
        post.voteCount ++;
        post.postSaveHookEnabled = false;
        return post.save();
    }).then(function() {
        next();
    }).catch(function(err) {
        next(err);
    });
}

module.exports.vote_count = function(req, res, next) {
    var post = req.post;

    if(post.hot) {
        return res.json({
            message: 'Vote successfully created.'
        });
    }

    return votesForHot().then(function(hotVoteCount) {
        if(!post.hot && (post.voteCount > hotVoteCount)) {
            var noti = new Notification({
                userId: post.userId,
                postId: post._id,
                message: 'Your post has reached the Hot page!'
            });
            return noti.save().then(function() {
                res.json({
                    message: 'Vote successfully created.'
                });
            });
        }

        res.json({
            message: 'Vote successfully created.'
        });
    }).catch(function(err) {
        next(err);
    });
}

// Deletes a vote.
module.exports.delete_vote = function(req, res, next) {
    var user = req.user;
    var post = req.post;

    // Delete vote from user.
    var index = user.votedPosts.indexOf(post._id); // ObjectId

    if(index === -1) {
        return res.status(404).json({
            message: 'Vote not found.'
        });
    }

    user.votedPosts.splice(index, 1);
    return user.save().then(function() {
        post.voteCount --;
        post.postSaveHookEnabled = false;
        return post.save();
    }).then(function() {
        res.json({
            message: 'Vote successfully deleted.'
        });
    }).catch(function(err) {
        next(err);
    });
}