var mongoose     = require('mongoose');
mongoose.Promise = require('bluebird');
var Schema       = mongoose.Schema;

var notiMid      = require('./docMiddleware/notificationMid');

var notificationSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    postId: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },

    read: {
        type: Boolean,
        default: false,
        required: true
    },

    message: {
        type: String,
        required: true
    }
},
{
    timestamps: true
});

notificationSchema.post('save', notiMid.postSave);

// Concurrency edge cases for hooks.

// Export model.
module.exports = mongoose.model('Notification', notificationSchema);
