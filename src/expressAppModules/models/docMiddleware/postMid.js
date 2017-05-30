var Category     = require('../categoryModel'),
    User         = require('../userModel');

var mongoose     = require('mongoose');
var Promise      = require('bluebird');
mongoose.Promise = Promise;

var freshCatId   = 2,
    hotCatId     = 1;

module.exports.postSave = function(doc, next) {
    if(doc.postSaveHookEnabled) {
        var promises = [
            Category.find({ '_id': { $in: [doc.category, freshCatId] } }).exec(),
            User.findById(doc.userId).exec()
        ];

        function pushAndSave(owner) {
            owner.posts.push(doc);
            owner.postSaveHookEnabled = false;
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
    // Comments will be orphaned. Just make sure no bugs precipitate from this
    // (besides the space employed in db).
    var promises;
    if(doc.hot) {
        promises = [
            Category.find({ '_id': { $in: [doc.category, freshCatId, hotCatId] } }).exec()
        ];
    }

    promises = [
        Category.find({ '_id': { $in: [doc.category, freshCatId] } }).exec()
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