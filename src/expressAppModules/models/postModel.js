var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.Promise = require('bluebird');

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

	image: {
		// Incorporate file upload to AWS S3 bucket
		type: String,
		required: true
		// Add validation for file type (jpg, jpeg, gif, png)
		// Add validation for file size
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
	}]
},
{
	timestamps: true
});

// Export model.
module.exports = mongoose.model('Post', postSchema);
