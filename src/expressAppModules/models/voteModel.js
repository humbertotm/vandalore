var mongoose     = require('mongoose');
mongoose.Promise = require('bluebird');

var Schema       = mongoose.Schema;


var voteSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User',
              required: true, index: true },

    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true }
},
{
    timestamps: true
});

voteSchema.index({ userId: 1, postId: 1 }, { unique: true });

voteSchema.post('save', function(doc, next) {
    /*
    var promises = [
        Post.findById(doc.postId).exec(),
        User.findById(doc.userId).exec()
    ];

    function pushAndSave(owner) {
        if(owner instanceof User) {
            owner.votedPosts.push(doc.postId);
            owner.hookEnabled = false;
            return owner.save();
        }

        owner.votes.push(doc);
        owner.hookEnabled = false;
        return owner.save();
    }

    return Promise.map(promises, pushAndSave).then(function() {
        next();
    })
    .catch(function(err) {
        next(err);
    });
    */
});

voteSchema.post('save', function(doc, next) {
    /*
    Post.findById(doc.postId).then(function(post) {
        if(post.hot) {
            next();
        } else if(!post.hot && post.votes.length > votesForHot()) {
            var noti = new Notification({
                userId: '',
                postId: '',
                message: ''
            });
            return noti.save().then(function() {
                next();
            });
        } else {
            next();
        }
    })
    .catch(function(err) {
        next(err);
    });
    */
});

voteSchema.post('remove', function(doc, next) {
    /*
    var promises = [
        User.findById(doc.userId).exec(),
        Post.findById(doc.postId).exec()
    ];

    function removeFromOwner(owner) {
        if(owner instanceof User) {
            // Remove doc.postId from votedPosts
            owner.hookEnabled = false;
            return owner.save();
        }

        // Eliminate from owner.votes;
        owner.hookEnabled = false;
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
module.exports = mongoose.model('Vote', voteSchema);
