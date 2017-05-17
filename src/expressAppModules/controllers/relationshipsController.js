// Require necessary models.
var Relationship = require('../models/relationshipModel');
var User = require('../models/userModel');

// Require mongoose and set bluebird to handle its promises.
var  mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

// Creates and responds with new relationship.
module.exports.create_relationship = function(req, res, next) {
    if(req.user) {
        var authUserId = req.user._id;

        var relationship = new Relationship();
        relationship.followerId = authUserId;
        relationship.followedId = req.body.followedId;

        return relationship.save().then(function(createdRel) {
            res.json(createdRel);
            next(createdRel);
        })
        .catch(function(err) {
            res.status(500).json(err);
        });
    } else {
        // If no authenticated user
        res.status(401).json({
            message: 'Please authenticate.'
        });
    }
}

// Pushes and saves newly created relationship into
// follower.following and followed.followers.
module.exports.push_and_save_rel = function(rel) {
    var followerId = rel.followerId;
    var followedId = rel.followedId;

    var promises = [
        User.findById(followerId).exec(),
        User.findById(followedId).exec()
    ];

    var promisedDocs = Promise.all(promises);


    function pushIntoFollowingAndFollowers(doc) {
        if(doc._id === followerId) {
            doc.following.push(followedId);
            return doc.save();
        } else {
            doc.followers.push(followerId);
            return doc.save();
        }
    }

    return promisedDocs.then(function(docs) {
        docs.map(pushIntoFollowingAndFollowers);
    })
    .catch(function(err) {
        console.log(err);
    });
}

// Deletes an existing relationship.
module.exports.delete_relationship = function(req, res) {
    if(req.user) {
        var authUserId = req.user._id;
        var relationshipId = req.body._id;

        return Relationship.findById(relationshipId).exec().then(function(rel) {
            if(rel.followerId === authUserId) {
                return rel.remove().then(function() {
                    res.status(200).json({
                        message: 'Relationship successfully deleted.',
                        relationshipId: relationshipId
                    });
                });
            } else {
                // If authenticated user does not match owner of comment doc.
                res.status(403).json({
                    message: 'You are not authorized to perform this operation.'
                });
            }
        })
        .catch(function(err) {
            // What about 404's?
            res.status(500).json(err);
        });
    } else {
        // If no authenticated user
        res.status(401).json({
            message: 'Please authenticate.'
        });
    }
}