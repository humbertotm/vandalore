var Post = require('../postModel'),
    User = require('../userModel');

var mongoose     = require('mongoose');
var Promise      = require('bluebird');
mongoose.Promise = Promise;

module.exports.postSave = function(doc, next) {
    var promises = [
        Post.findById(doc.postId).exec(),
        User.findById(doc.userId).exec()
    ];

    function pushAndSave(owner) {
        owner.comments.push(doc);
        owner.hookEnabled = false;
        return owner.save();
    }

    return Promise.map(promises, pushAndSave).then(function() {
        next();
    }).catch(function(err) {
        next(err);
    });
}

module.exports.postRemove = function(doc, next) {
    var promises = [
        Post.findById(doc.postId).exec(),
        User.findById(doc.userId).exec()
    ];

    function removeFromOwner(owner) {
        // Remove from owner.comments();
        var index = owner.comments.indexOf(doc._id);
        owner.comments.splice(index, 1);
        return owner.save();
    }

    return Promise.map(promises, removeFromOwner).then(function() {
        next();
    }).catch(function(err) {
        next(err);
    });
}