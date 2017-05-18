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

        var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

        if(!(checkForHexRegExp.test(userId) && checkForHexRegExp.test(postId))) {
            throw new Error('userId and/or postId provided is not an instance of ObjectId.');
        }

        var vote = new Vote();
        vote.userId = userId;
        vote.postId = postId;

        return vote.save().then(function(createdVote) {
            res.json(createdVote);
            req.vote = createdVote;
            next();
        })
        .catch(function(err) {
            // Send this to error handling middleware.
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
module.exports.push_and_save_vote = function(req, res, next) {
    var vote = req.vote;
    var userId = vote.userId;
    var postId = vote.postId;

    var promises = [
        // What if any of these return null? Will the Promise reject?
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
            req.post = doc;
            next();
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
        // Send this to error handling middleware.
        console.log(err);
    });
}

// Checks the vote count for post to verify if there is
// a need to create a notification.
module.exports.check_vote_count = function(req, res, next) {
    var post = req.post;
    var voteCount = post.votes.length;

    if(voteCount > votesForHot()) {
        var notification = new Notification();
        notification.userId = post.userId;
        notification.postId = post._id;
        notification.message = 'Your post has reached the Hot Page!';

        return notification.save().then(function(notification) {
            req.notification = notification;
            next();
        })
        .catch(function(err) {
            // Send this to error handling middleware.
            console.log(err);
        });
    } else {
        return;
    }
}

// Pushes and saves newly created notification to corresponding user.
module.exports.push_and_save_notification = function(req, res) {
    var notification = req.notification;
    var userId = notification.userId;

    return User.findById(userId).exec().then(function(user) {
        if(user === null) {
            // What do we do here? This is middleware.
        }

        user.notifications.push(notification);
        return user.save();
    })
    .catch(function(err) {
        // Send this to error handling middleware.
        console.log(err);
    });
}

// Deletes a vote.
module.exports.delete_vote = function(req, res) {
    if(req.user) {
        var authUserId = req.user._id;
        var voteId = req.body._id;

        var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

        if(!(checkForHexRegExp.test(authUserId) && checkForHexRegExp.test(voteId))) {
            throw new Error('authUserId and/or voteId provided is not an instance of ObjectId.');
        }

        return Vote.findById(voteId).exec().then(function(vote) {
            if(vote === null) {
                res.status(404).json({
                    message: 'Vote not found.'
                });
            }

            if(vote.userId === authUserId) {
                return vote.remove().then(function() {
                    res.json({
                        message: "Vote successfully deleted.",
                        voteId: voteId
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
            // Send this to error handling middleware.
            res.status(500).json(err);
        })
    } else {
        // If no authenticated user
        res.status(401).json({
            message: 'Please authenticate.'
        });
    }
}