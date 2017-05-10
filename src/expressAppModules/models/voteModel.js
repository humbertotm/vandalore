var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.Promise = require('bluebird');

var voteSchema = new Schema({
	userId: { type: Schema.Types.ObjectId, ref: 'User', 
						required: true, index: true },
	
	postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true }
},
{
	timestamps: true
});

voteSchema.index({ userId: 1, postId: 1 }, { unique: true });

// Export model.
module.exports = mongoose.model('Vote', voteSchema);
