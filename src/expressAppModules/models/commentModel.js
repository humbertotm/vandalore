var mongoose     = require('mongoose');
mongoose.Promise = require('bluebird');
var Schema       = mongoose.Schema;

var commentSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    postId: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
        index: true
    },

    content: {
        type: String,
        maxlength: 140,
        required: true
    }
},
{
    timestamps: true
});

commentSchema.post('save', function(doc, next) {
    /*
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
    */
});

commentSchema.post('remove', function(doc, next) {
    /*
    var promises = [
        Post.findById(doc.postId).exec(),
        User.findById(doc.userId).exec()
    ];

    function removeFromOwner(owner) {
        // Remove from owner.comments();
        return owner.save();
    }

    return Promise.map(promises, removeFromOwner).then(function() {
        next();
    }).catch(function(err) {
        next(err);
    });
    */
});

// Concurrency edge cases for hooks.

// Export model.
module.exports = mongoose.model('Comment', commentSchema);
