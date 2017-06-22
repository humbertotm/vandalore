// Require neccessary models.
var User         = require('../models/userModel'),
    Post         = require('../models/postModel'),
    Notification = require('../models/notificationModel');

// Require mongoose and set mongoose.Promise to Bluebird.
var mongoose     = require('mongoose');
var Promise      = require('bluebird');
mongoose.Promise = Promise;

var votesForHot  = require('../utils').votesForHot;

/**
 * All these functions are middlewares to be employed as middlewares for
 * /votes routes.
 * All these functions take req, res, and next as params.

 * @param {Object} req Express req object, containing the incoming request data.
 *
 * @param {Object} res Express res object, containing the data to be sent in
 * in the response.
 *
 * @param {Function} next Function that passes flow control to the next middleware
 * in the chain when called with no arguments. When next(err) is called, flow
 * control is passed directly to the error handling middleware set up for the route.
*/

/**
 * This function verifies the user and post associated to the soon-to-be comment
 * exist in the database before proceeding to it.
 *
 * If there is no authenticated user (!req.user), respond with 401.
 *
 * If there is an authenticated user (req.user as set by previous expressJWT
 * middleware):
 *
 * Throw an Error if req.user._id or req.body.postId is not a string representing
 * a 12 byte hex number.
 *
 * Find both, user and post.
 * If one or both are null (do not exist in the DB), respond with 404.
 *
 * If both are found, set req.user and req.post respectively, and call next().
 *
 * If there is an I/O error along the way, call next(err) to handle it
 * appropriately.
*/
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
        res.status(401).json({
            message: 'Please authenticate.'
        });
    }
}

/**
 * Respond with 309 if post._id already exists in user.votedPosts.
 *
 * Push post's id into user voted posts, and save user.
 * Once it is save, increase post's vote count by 1 and save it.
 *
 * Pass control flow to the next middleware in the chain.
 *
 * If there is an I/O error along the way, call next(err) to handle it
 * appropriately.
*/
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

/**
 * If post is already hot, respond with 200.
 *
 * If post is not hot, and vote count surpasses the vote count required for hot,
 * create a new notification , ans save, and respond with 200.
 *
 * Else, respond with 200.
 *
 * If there is an I/O error along the way, call next(err) to handle it
 * appropriately.
*/
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

/**
 * If post's id is not found among user voted posts, respond with 404.
 *
 * Remove post's id from user voted posts, and save. Then decrease post's
 * vote count by 1 and save post.
 *
 * Respond with 200/
 *
 * If there is an I/O error along the way, call next(err) to handle it
 * appropriately.
*/
module.exports.delete_vote = function(req, res, next) {
    var user = req.user;
    var post = req.post;

    var index = user.votedPosts.indexOf(mongoose.types.ObjectId(post._id));

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