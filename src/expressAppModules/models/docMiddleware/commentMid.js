/*

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
        if(owner === null) {
            throw new Error('Cannot operate on an undefined post/user.');
        }

        if(owner.constructor.modelName === 'Post') {
            owner.comments.push(doc);
            owner.postSaveHookEnabled = false;
            return owner.save();
        }

        owner.comments.push(doc);
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
        if(owner === null) {
            throw new Error('Cannot operate on an undefined post/user.');
        }

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
*/