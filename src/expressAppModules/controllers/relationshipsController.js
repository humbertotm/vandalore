// Require necessary models.
var User         = require('../models/userModel');

// Require mongoose and set bluebird to handle its promises.
var mongoose     = require('mongoose');
var Promise      = require('bluebird');
mongoose.Promise = Promise;

// Creates and responds with new relationship.
module.exports.create_relationship = function(req, res, next) {
    if(req.user) {
        var authUserId = req.user._id; // String
        var followedId = req.body.followedId; // String

        var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

        if(!checkForHexRegExp.test(authUserId) || !checkForHexRegExp.test(followedId)) {
            throw new Error('Bad parameters.');
        }

        var promises = [
            User.find({ '_id': { $in: [authUserId, followedId] } }).exec()
        ];

        function pushRel(doc) {
            if(owner === null) {
                throw new Error('Cannot operate on an undefined post/user.');
            }

            if(doc._id.toString() === authUserId) {
                doc.following.push(followedId);
                return doc.save();
            }

            doc.followers.push(authUserId);
            return doc.save();
        }

        return Promise.map(promises, pushRel).then(function() {
            res.json({
                message: 'Relationship successfully created.',
                followedId: followedId
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

// Deletes an existing relationship.
module.exports.delete_relationship_follower = function(req, res, next) {
    if(req.user) {
        var authUserId = req.user._id; // String
        var followedId = req.body.followedId; // String

        var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

        if(!checkForHexRegExp.test(authUserId) || !checkForHexRegExp.test(followedId)) {
            throw new Error('Bad parameters.');
        }

        return User.findById(authUserId).exec().then(function(user) {
            if(user === null) {
                return res.status(404).json({
                    message: 'User not found.'
                });
            }
            // var index = user.following.indexOf(mongoose.Types.ObjectId(followedId));
            var index = user.following.indexOf(followedId);

            if(index === -1) {
                return res.status(404).json({
                    message: 'Relationship not found.'
                });
            }

            user.following.splice(index, 1);
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

module.exports.delete_relationship_followed = function(req, res, next) {
    var followerId = req.user._id; // String
    var followedId = req.body.followedId; // String

    return User.findById(followedId).exec().then(function(user) {
        if(user === null) {
            return res.status(404).json({
                message: 'Relationship not found.'
            });
        }

        // var index = user.followers.indexOf(mongoose.Types.ObjectId(followerId));
        var index = user.followers.indexOf(followerId);

        if(index === -1) {
            return res.status(404).json({
                message: 'Relationship not found.'
            });
        }

        user.followers.splice(index, 1);
        return user.save().then(function() {
            res.json({
                message: 'Relationship successfully deleted.'
            });
        });
    }).catch(function(err) {
        next(err);
    });
}