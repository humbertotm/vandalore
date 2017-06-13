// Require necessary models.
var User         = require('../models/userModel');

// Require mongoose and set bluebird to handle its promises.
var mongoose     = require('mongoose');
var Promise      = require('bluebird');
mongoose.Promise = Promise;

// Verify docs exist in DB for both create and delete actions.
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
        // If no authenticated user
        res.status(401).json({
            message: 'Please authenticate.'
        });
    }
}

// Creates and responds with new relationship.
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

// Deletes an existing relationship.
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