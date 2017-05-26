var Category     = require('../categoryModel'),
    User         = require('../userModel');

var mongoose     = require('mongoose');
var Promise      = require('bluebird');
mongoose.Promise = Promise;

module.exports.postSave = function(doc, next) {
    if(doc.hookEnabled) {
        var promises = [
            Category.findById(doc.category).exec(),
            Category.findById(2).exec(),
            User.findById(doc.userId).exec()
        ];

        function pushAndSave(owner) {
            owner.posts.push(doc);
            owner.hookEnabled = false;
            return owner.save();
        }

        return Promise.map(promises, pushAndSave).then(function() {
            next();
        }).catch(function(err) {
            next(err);
        });
    } else {
        next();
    }
}

module.exports.postRemove = function(doc, next) {
    var promises;
    if(doc.hot) {
        promises = [
            // Less queries?
            User.findById(doc.userId).exec(),
            Category.findById(doc.category).exec(),
            Category.findById(2).exec(),
            Category.findById(1).exec()
        ];
    }

    promises = [
        User.findById(doc.userId).exec(),
        Category.findById(doc.category).exec(),
        Category.findById(2).exec()
    ];

    function removeFromOwner(owner) {
        // Eliminate post from owner.posts;
        var index = owner.posts.indexOf(doc._id);
        owner.posts.splice(index, 1);
        return owner.save();
    }

    return Promise.map(promises, removeFromOwner).then(function() {
        next();
    }).catch(function(err) {
        next(err);
    });
}