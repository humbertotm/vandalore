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
// follower.activeRelationships and followed.passiveRelationship.
module.exports.push_and_save_rel = function(rel) {
    var followerId = rel.followerId;
    var followedId = rel.followedId;

    var promises = [
        User.findById(followerId).exec(),
        User.findById(followedId).exec()
    ];

    var promisedDocs = Promise.all(promises);


    function pushIntoActiveAndPassiveRel(doc) {
        if(doc._id === followerId) {
            doc.activeRelationships.push(rel);
            return doc.save();
        } else {
            doc.passiveRelationships.push(rel);
            return doc.save();
        }
    }

    return promisedDocs.then(function(docs) {
        docs.map(pushIntoActiveAndPassiveRel);
    })
    .catch(function(err) {
        console.log(err);
    });
}

// Deletes an existing relationship.
module.exports.delete_relationship = function(req, res) {
    if(req.user) {
        var authUserId = req.user._id;
        var relationshipId = req.body.relationship._id;

        return Relationship.findById(relationshipId).exec().then(function(rel) {
            if(rel.followerId === authUserId) {
                return rel.remove().then(function(removedRel) {
                    res.status(200).json({
                        message: 'Relationship successfully deleted.',
                        relationship: removedRel
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
            res.status(500).json(err);
        });
    } else {
        // If no authenticated user
        res.status(401).json({
            message: 'Please authenticate.'
        });
    }
}