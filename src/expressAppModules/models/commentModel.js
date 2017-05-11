var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.Promise = require('bluebird');

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

// add methods to remove deleted docs from references in other docs.

// Export model.
module.exports = mongoose.model('Comment', commentSchema);
