// Require necessary models.
var User         = require('../models/userModel');

// Require mongoose and set mongoose.Promise to Bluebird.
var mongoose     = require('mongoose');
var Promise      = require('bluebird');
mongoose.Promise = Promise;

/**
 * All these functions are middlewares to be employed as middlewares for
 * /relationships routes.
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
 * This function verifies the follower and the followed user associated to the
 * soon-to-be relationship exist in the database before proceeding to create it.
 *
 * If there is no authenticated user (!req.user), respond with 401.
 *
 * If there is an authenticated user (req.user as set by previous expressJWT
 * middleware):
 *
 * Throw an Error if req.user._id or req.user._id or req.body.followedId is not
 * a string representing a 12 byte hex number.
 *
 * Find both, follower and followed.
 * If one or both are null (do not exist in the DB), respond with 404.
 *
 * If both are found, set req.follower and req.followed respectively, and call next().
 *
 * If there is an I/O error along the way, call next(err) to handle it
 * appropriately.
*/
module.exports.verify_docs = function(req, res, next) {
    if(req.user) {
        var authUserId = req.user._id; //String
        var followedId = req.body.followedId; // String

        var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

        if(!checkForHexRegExp.test(authUserId) || !checkForHexRegExp.test(followedId)) {
            throw new Error('Bad parameters.');
        }

        var promises = [
            User.find({ '_id': { $in: [authUserId, followedId] } }).exec()
        ];

        return Promise.all(promises).then(function(results) {
            if(results.constructor !== Array || results.length < 2) {
                return res.status(404).json({
                    message: 'Follower and/or followed user not found.'
                });
            }

            var nullDoc = false;
            for(var i = 0; i < results.length; i++) {
                if(results[i] === null) {
                    nullDoc = true;
                    break;
                }

                if(results[i]._id.toString() === authUserId) {
                    req.follower = results[i];
                }

                req.followed = results[i];
            }

            if(nullDoc) {
                return res.status(404).json({
                    message: 'Follower and/or followed user not found.'
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
 * Creates a relationship by pushing follower and followed into the opposite.
 *
 * In cases where the followed user's id is already in follower.following, and
 * respond with 309, after filling gaps should there be any.
 *
 * In the rest of the cases, fill in the holes and respond with 200, and the
 * followed user's id.
 *
 * If there is an I/O error along the way, call next(err) to handle it
 * appropriately.
*/
module.exports.create_relationship = function(req, res, next) {
    var follower = req.follower;
    var followed = req.followed;

    var followedIndex = follower.following.indexOf(followed._id);
    var followerIndex = followed.followers.indexOf(follower._id);

    if(followedIndex !== -1 && followerIndex !== -1) {
        return res.status(309).json({
            message: 'A relationship between this users already exists.'
        });
    }

    if(followedIndex !== -1 && followerIndex === -1) {
        followed.followers.push(follower._id);
        return followed.save().then(function() {
            res.status(309).json({
                message: 'A relationship between this users already exists.'
            });
        }).catch(function(err) {
            next(err);
        });
    }

    if(followedIndex === -1 && followerIndex !== -1) {
        follower.following.push(followed._id);
        return follower.save().then(function() {
            res.json({
                message: 'Relationship successfully created.',
                followedId: followed._id
            });
        }).catch(function(err) {
            next(err);
        });
    }

    follower.following.push(followed._id);
    followed.followers.push(follower._id);

    return Promise.all([follower.save(), followed.save()]).then(function() {
        res.json({
            message: 'Relationship successfully created.',
            followedId: followed._id
        });
    }).catch(function(err) {
        next(err);
    });
}

/**
 * Delete relationship by removing follower and followed user's id from each
 * other.
 *
 * Respond with 404 if follower and followed user's id is not found in
 * the respoective counterpart.
 *
 * When followed user's index is found in follower.following, respond with
 * followedId, and fill in any gaps if there are any.
 *
 * If there is an I/O error along the way, call next(err) to handle it
 * appropriately.
*/
module.exports.delete_relationship = function(req, res, next) {
    var follower = req.follower;
    var followed = req.followed;

    var followedIndex = follower.following.indexOf(followed._id);
    var followerIndex = followed.followers.indexOf(follower._id);

    if(followedIndex === -1 && followerIndex === -1) {
        return res.status(404).json({
            message: 'Relationship not found.'
        });
    }

    if(followedIndex === -1 && followerIndex !== -1) {
        followed.followers.splice(followerIndex, 1);
        return followed.save().then(function() {
            res.status(404).json({
                message: 'Relationship not found.'
            });
        }).catch(function(err) {
            next(err);
        });
    }

    if(followedIndex !== -1 && followerIndex === -1) {
        follower.following.splice(followedIndex, 1);
        return follower.save().then(function() {
            res.json({
                message: 'Relationship successfully deleted.',
                followedId: followed._id
            });
        }).catch(function(err) {
            next(err);
        });
    }

    follower.following.splice(followedIndex, 1);
    followed.followers.splice(followerIndex, 1);

    return Promise.all([follower.save(), followed.save()]).then(function() {
        res.json({
            message: 'Relationship successfully deleted.',
            followedId: followed._id
        });
    }).catch(function(err) {
        next(err);
    });
}