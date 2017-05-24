var mongoose     = require('mongoose');
mongoose.Promise = require('bluebird');
var Schema       = mongoose.Schema;

var postSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    title: {
        type: String,
        required: true,
        maxlength: 140
    },

    description: {
        type: String,
        maxlength: 1024
    },

    imageUrl: {
        type: String,
        required: true
    },

    category: {
        type: Number,
        ref: 'Category',
        required: true
    },

    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment',
        default: []
    }],

    votes: [{
        type: Schema.Types.ObjectId,
        ref: 'Vote',
        default: []
    }],

    hot: {
        type: Boolean,
        default: false,
        required: false
    },

    hookEnabled: {
        type: Boolean,
        default: true,
        required: false
    }
},
{
    timestamps: true
});

postSchema.post('save', function(doc, next) {
    /*
    if(doc.hookEnabled) {
        var promises = [
            Category.findById(doc.category).exec(),
            Category.findById(freshId).exec(),
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
    */
});

postSchema.post('remove', function(doc, next) {
    /*
    var promises;
    if(doc.hot) {
        promises = [
            // Less queries?
            User.findById(doc.userId).exec(),
            Category.findById(doc.category).exec(),
            Category.findById(freshId).exec(),
            Category.findById(hotId).exec()
        ];
    }

    promises = [
        User.findById(doc.userId).exec(),
        Category.findById(doc.category).exec(),
        Category.findById(freshId).exec()
    ];

    function removeFromOwner(owner) {
        // Eliminate post from owner.posts;
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
module.exports = mongoose.model('Post', postSchema);
