var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.Promise = require('bluebird');

var categories = ['hot', 'fresh', 'tattoo', 'urban', 'photography', 'illustration', 'design', 'sculpture', 'other'];
var categorySchema = new Schema({
    _id: Number,

    categoryName: {
        type: String,
        required: true,
        enum: categories
    },

    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'Post'
    }]
});

// Export model.
module.exports = mongoose.model('Category', categorySchema);