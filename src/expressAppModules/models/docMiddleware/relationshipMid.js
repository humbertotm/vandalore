var User         = require('../userModel'),
    Relationship = require('../relationshipModel');

var mongoose     = require('mongoose');
var Promise      = require('bluebird');
mongoose.Promise = Promise;

module.exports.postSave = function(doc, next) {
    var promises = [
        // Can I do this in a single query?
        User.findById(doc.followerId).exec(),
        User.findById(doc.followedId).exec()
    ];

    function pushIntoFollowingOrFollowers(user) {
        if(user._id === doc.followerId) {
            user.following.push(doc.followedId);
            user.postSaveHookEnabled = false;
            return user.save();
        } else {
            user.followers.push(followerId);
            user.postSaveHookEnabled = false;
            return user.save();
        }
    }

    return Promise.map(promises, pushIntoFollowingOrFollowers).then(function() {
        next();
    })
    .catch(function(err) {
        next(err);
    });
}

module.exports.postRemove = function(doc, next) {
    var promises = [
        // Can I do this in a single query?
        User.findById(doc.followerId).exec(),
        User.findById(doc.followedId).exec()
    ];

    function removeFromRelationships(user) {
        if(user._id === doc.followerId) {
            // Remove doc.followedId from user.following;
            var index = user.following.indexOf(doc.followedId);
            user.following.splice(index, 1);
            return user.save();
        }
        else {
            // Remove doc.followerId from user.followers;
            var index = user.followers.indexOf(doc.followerId);
            user.followers.splice(index, 1);
            return user.save();
        }
    }

    return Promise.map(promises, removeFromRelationships).then(function() {
        next();
    })
    .catch(function(err) {
        next(err);
    });
}