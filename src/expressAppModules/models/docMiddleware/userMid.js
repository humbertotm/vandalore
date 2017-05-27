var Category     = require('../categoryModel'),
    User         = require('../userModel'),
    Post         = require('../postModel'),
    Relationship = require('../relationshipModel'),
    Comment      = require('../commentModel');

var mongoose     = require('mongoose');
var Promise      = require('bluebird');
mongoose.Promise = Promise;

module.exports.postRemove = function(doc, next) {
    // If I'm right, this will return an array of docs.
    var promise = Post.find({ '_id': { $in: doc.posts } }).exec();
    return Promise.map(promise, function(doc) {
        return doc.remove();
    }).then(function() {
        next();
    }).catch(function(err) {
        next();
    });
}



// How do we avoid the loop that comes into being when user.postRemove calls
// post.remove and triggers post.postRemove, that in turn will trigger user.postRemove,
// and so on.

