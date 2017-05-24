var mongoose     = require('mongoose');
mongoose.Promise = require('bluebird');
var Schema       = mongoose.Schema;

var relationshipSchema = new Schema({
    followedId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    followerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
},
{
    timestamps: true
});

relationshipSchema.index({ followedId: 1, followerId: 1}, { unique: true });

relationshipSchema.post('save', function(doc, next) {
    /*
    var promises = [
        // Can I do this in a single query?
        User.findById(doc.followerId).exec(),
        User.findById(doc.followedId).exec()
    ];

    function pushIntoFollowingOrFollowers(user) {
        if(user._id === doc.followerId) {
            user.following.push(doc.followedId);
            user.hookEnabled = false;
            return user.save();
        } else {
            user.followers.push(followerId);
            user.hookEnabled = false;
            return user.save();
        }
    }

    return Promise.map(promises, pushIntoFollowingOrFollowers).then(function() {
        next();
    })
    .catch(function(err) {
        next(err);
    });
    */
});

relationshipSchema.post('remove', function(doc, next) {
    /*
    var promises = [
        // Can I do this in a single query?
        User.findById(doc.followerId).exec(),
        User.findById(doc.followedId).exec()
    ];

    function removeFromRelationships(user) {
        if(user._id === doc.followerId) {
            // Remove doc.followedId from user.following;
            return user.save();
        }
        else {
            // Remove doc.followerId from user.followers;
            return user.save();
        }
    }

    return Promise.map(promises, removeFromRelationships).then(function() {
        next();
    })
    .catch(function(err) {
        next(err);
    });
    */
});

// Concurrency edge cases for hooks.

// Export model.
module.exports = mongoose.model('Relationship', relationshipSchema);
