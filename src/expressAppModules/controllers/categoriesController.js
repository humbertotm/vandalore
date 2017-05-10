// require Category model.
var Category = require('../models/categoryModel');

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

module.exports.get_posts = function(req, res) {
	var categoryId = req.params.categoryId;

	return Category.findById(categoryId).populate({
		path: 'posts',
		options: { limit: 20 }
	}).exec().then(function(category) {
		res.json(category.posts);
	})
	.catch(function(err) {
		res.status(500).json(err); 
	});
}

module.exports.get_more_posts = function(req, res) {
	var categoryId = req.params.categoryId;
	var maxId = req.params.maxId;

	return Category.findById(categoryId).populate({
		path: 'posts',
		
	}).exec().then(function(category) {

	})
	.catch(function(err) {
		res.status(500).json(err);
	});
}