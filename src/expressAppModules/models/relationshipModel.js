var mongoose     = require('mongoose');
mongoose.Promise = require('bluebird');
var Schema       = mongoose.Schema;

var relMid       = require('./docMiddleware/relationshipMid');

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

relationshipSchema.post('save', relMid.postSave);

relationshipSchema.post('remove', relMid.postRemove);

// Concurrency edge cases for hooks.

// Export model.
module.exports = mongoose.model('Relationship', relationshipSchema);
