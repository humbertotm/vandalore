var User         = require('../userModel');

var mongoose     = require('mongoose');
var Promise      = require('bluebird');
mongoose.Promise = Promise;

module.exports.postSave = function(doc, next) {
    return User.findById(doc.userId).exec().then(function(user) {
        user.notifications.push(doc);
        return user.save().then(function() {
            next();
        });
    }).catch(function(err) {
        next(err);
    });
}