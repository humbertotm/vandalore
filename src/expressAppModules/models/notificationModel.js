var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.Promise = require('bluebird');

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

// Export model.
module.exports = mongoose.model('Notification', notificationSchema);
