var mongoose     = require('mongoose');
var Promise      = require('bluebird');
mongoose.Promise = Promise;
var Schema       = mongoose.Schema;

var User         = require('./userModel'),
    Post         = require('./postModel');

var commentMid   = require('./docMiddleware/commentMid');

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

// Concurrency edge cases for hooks.

// Export model.
module.exports = mongoose.model('Comment', commentSchema);
