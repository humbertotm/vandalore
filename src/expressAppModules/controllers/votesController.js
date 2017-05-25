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

/*
// Decomissioned middleware. Substituted by the function below.
// Creates a new vote and sends it in response.
module.exports.create_vote = function(req, res, next) {
    if(req.user) {
        var userId = req.user._id; // String
        var postId = req.body.postId; // String

        var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

        if(!checkForHexRegExp.test(userId) || !checkForHexRegExp.test(postId)) {
            throw new Error('Bad parameters.');
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
            next(err);
        });
    } else {
        // If no authenticated user
        res.status(401).json({
            message: 'Please authenticate.'
        });
    }
}
*/

module.exports.create_vote = function(req, res, next) {
    if(req.user) {
        var userId = req.user._id; // String
        var postId = req.body.postId; // String

        var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

        if(!checkForHexRegExp.test(userId) || !checkForHexRegExp.test(postId)) {
            throw new Error('Bad parameters.');
        }

        var promises = [
            // What if any of these resolves to null?
            Post.findById(postId).exec(),
            User.findById(userId).exec()
        ];

        function addVote(owner) {
            if(owner.constructor.modelName == 'Post') {
                owner.voteCount ++;
                owner.hookEnabled = false;
                return owner.save();
            }

            // If user
            owner.votedPosts.push(postId);
            owner.hookEnabled = false;
            return owner.save();
        }

        return Promise.map(promises, addVote).then(function() {
            // What are the results returned by Promise.map?
            // How can I set req.post?
            res.json({
                message: 'Vote successfully created.'
            });
            next();
        })
        .catch(function(err) {
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
    var postId = req.body.postId;

    return Post.findById(postId).then(function(post) {
        if(post.hot) {
            return;
          // watch out for asynchronicity here.
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

/*
// Pushes newly created vote into refs in user and post docs.
module.exports.push_and_save_vote = function(req, res, next) {
    var vote = req.vote;
    var userId = vote.userId; // ObjectId
    var postId = vote.postId; // ObjectId

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
        err.logToConsole = true;
        next(err);
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
            err.logToConsole = true;
            next(err);
        });
    } else {
        return;
    }
}

// Pushes and saves newly created notification to corresponding user.
module.exports.push_and_save_notification = function(req, res, next) {
    var notification = req.notification;
    var userId = notification.userId; // ObjectId

    return User.findById(userId).exec().then(function(user) {
        if(user === null) {
            // What do we do here? This is middleware.
        }

        user.notifications.push(notification);
        return user.save();
    })
    .catch(function(err) {
        err.logToConsole = true;
        next(err);
    });
}
*/

// Deletes a vote.
// Refactor this shit.
module.exports.delete_vote_user = function(req, res, next) {
    if(req.user) {
        var authUserId = req.user._id; // String
        var postId     = req.body.postId; // String

        var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

        if(!checkForHexRegExp.test(authUserId) || !checkForHexRegExp.test(postId)) {
            throw new Error('Bad parameters.');
        }

        return User.findById(authUserId).exec().then(function(user) {
            // Remember, postId is a String
            if(user.votedPosts.indexOf(postId) === -1) {
                return res.status(403).json({
                    message: 'You are not authorized to perform this operation.'
                });
            }

            // Remove postId from user.votedPosts
            user.enableHook = false;
            return user.save().then(function() {
                next();
            });
        })
        .catch(function(err) {
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
        post.enableHook = false;
        return post.save().then(function() {
            res.json({
                message: 'Vote successfully deleted.'
            });
        });
    })
    .catch(function(err) {
        next(err);
    });
}