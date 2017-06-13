var Post         = require('../postModel');

var mongoose     = require('mongoose');
var Promise      = require('bluebird');
mongoose.Promise = Promise;

module.exports.postRemove = function(doc, next) {
    // If I'm right, this will return an array of docs.
    var promise = Post.find({ '_id': { $in: doc.posts } }).exec();
    return Promise.map(promise, function(post) {
        return post.remove();
    }).then(function() {
        next();
    }).catch(function(err) {
        next();
    });
}

