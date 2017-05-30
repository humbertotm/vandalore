// Require neccessary models.
var Vote         = require('../models/voteModel'),
    User         = require('../models/userModel'),
    Post         = require('../models/postModel'),
    Notification = require('../models/notificationModel');

// Require mongoose and set bluebird to handle its promises.
var mongoose     = require('mongoose');
var Promise      = require('bluebird');
mongoose.Promise = Promise;

var votesForHot  = require('../utils').votesForHot;

module.exports.create_vote = function(req, res, next) {
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

        function addVote(owner) {
            if(owner === null) {
                throw new Error('Cannot operate on an undefined post/user.');
            }

            if(owner.constructor.modelName === 'Post') {
                owner.voteCount ++;
                owner.postSaveHookEnabled = false;
                return owner.save();
            }

            // If user
            owner.votedPosts.push(postId);
            return owner.save();
        }

        return Promise.map(promises, addVote).then(function() {
            // What are the results returned by Promise.map?
            // How can I set req.post?
            res.json({
                message: 'Vote successfully created.'
            });
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

module.exports.vote_count = function(req, res, next) {
    // No need to handle nulls as you cannot get here without an existing post's id.
    var postId = req.body.postId;

    return Post.findById(postId).then(function(post) {
        if(post.hot) {
            return;
          // watch out for asynchronicity here.
          // It most certainly will, as votesForHot will have to access DB.
        } else if(!post.hot && (post.voteCount > votesForHot())) {
            var noti = new Notification({
                userId: post.userId,
                postId: post._id,
                message: 'Your post has reached the Hot page!'
            });
            return noti.save();
        } else {
            return;
        }
    }).catch(function(err) {
        next(err);
    });
}

// Deletes a vote.
module.exports.delete_vote_user = function(req, res, next) {
    if(req.user) {
        var authUserId = req.user._id; // String
        var postId     = req.body.postId; // String

        var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

        if(!checkForHexRegExp.test(authUserId) || !checkForHexRegExp.test(postId)) {
            throw new Error('Bad parameters.');
        }

        return User.findById(authUserId).exec().then(function(user) {
            if(user === null) {
                return res.status(404).json({
                    message: 'User not found.'
                });
            }
            // var index = user.votedPosts.indexOf(mongoose.Types.ObjectId(postId));
            // Might be a good place to insert a search algorithm?
            var index = user.votePosts.indexOf(postId);

            if(index === -1) {
                return res.status(403).json({
                    message: 'You are not authorized to perform this operation.'
                });
            }

            // Remove postId from user.votedPosts
            user.votedPosts.splice(index, 1);
            return user.save().then(function() {
                next();
            });
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

module.exports.delete_vote_post = function(req, res, next) {
    var postId = req.body.postId;

    return Post.findById(postId).exec().then(function(post) {
        post.voteCount --;
        post.postSaveHookEnabled = false;
        return post.save().then(function() {
            res.json({
                message: 'Vote successfully deleted.'
            });
        });
    }).catch(function(err) {
        next(err);
    });
}