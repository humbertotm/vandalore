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

// Export model.
module.exports = mongoose.model('Relationship', relationshipSchema);
