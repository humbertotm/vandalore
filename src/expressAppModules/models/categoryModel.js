var mongoose     = require('mongoose');
mongoose.Promise = require('bluebird');
var Schema       = mongoose.Schema;

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
    }],

    hookEnabled: {
        type: Boolean,
        default: true,
        required: false
    }
});

// Export model.
module.exports = mongoose.model('Category', categorySchema);