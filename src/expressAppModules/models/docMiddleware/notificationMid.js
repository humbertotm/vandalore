var User         = require('../userModel');

var mongoose     = require('mongoose');
var Promise      = require('bluebird');
mongoose.Promise = Promise;

module.exports.postSave = function(doc, next) {
    return User.findById(doc.userId).exec().then(function(user) {
        if(user === null) {
            // Somehow, user does not exist.
            // This means the user was removed and the vote was emitted before
            // the post was removed. If we just return, on refresh the post will be
            // gone, or orphaned (if something does not work properly) and it will not
            // matter. So we just
            return next();
        }

        user.notifications.push(doc);
        return user.save();
    }).then(function() {
        next();
    }).catch(function(err) {
        next(err);
    });
}