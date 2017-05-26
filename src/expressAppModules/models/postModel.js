var mongoose     = require('mongoose');
mongoose.Promise = require('bluebird');
var Schema       = mongoose.Schema;

var postMid      = require('./docMiddleware/postMid');

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

    voteCount: {
        type: Number,
        default: 0
    },

    /*
    votes: [{
        type: Schema.Types.ObjectId,
        ref: 'Vote',
        default: []
    }],
    */

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

postSchema.post('save', postMid.postSave);

postSchema.post('remove', postMid.postRemove);

// Concurrency edge cases for hooks.

// Export model.
module.exports = mongoose.model('Post', postSchema);
