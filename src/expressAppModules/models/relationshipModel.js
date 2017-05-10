var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.Promise = require('bluebird');
	
var relationshipSchema = new Schema({	
	followedId: { type: Schema.Types.ObjectId, ref: 'User', 
								required: true },

	followerId: { type: Schema.Types.ObjectId, ref: 'User',
								required: true, index: true }
}, 
{
	timestamps: true
});

relationshipSchema.index({ followedId: 1, followerId: 1}, { unique: true });

// Export model.
module.exports = mongoose.model('Relationship', relationshipSchema);
