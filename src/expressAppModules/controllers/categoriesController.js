// require Category model.
var Category = require('../models/categoryModel');

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

module.exports.get_posts = function(req, res) {
    var categoryId = req.params.categoryId;

    if(isNaN(categoryId)) {
        throw new Error('Id provided is not a Number.');
    }

    return Category.findById(categoryId).populate({
        path: 'posts',
        options: { limit: 20 }
    }).exec().then(function(category) {
        if(category === null) {
            res.status(404).json({
                message: 'Category not found.'
            });
        }

        res.json(category.posts);
    })
    .catch(function(err) {
        // Fix this with error handling middleware.
        res.status(500).json(err);
    });
}

module.exports.get_more_posts = function(req, res) {
    var categoryId = req.params.categoryId;
    var maxId = req.params.maxId;

    var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

    if(!checkForHexRegExp.test(maxId)) {
        throw new Error('maxId provided is not an instance of ObjectId.');
    }

    if(isNaN(categoryId)) {
        throw new Error('categoryId provided is not a Number.');
    }

    return Category.findById(categoryId).exec().then(function(cat) {
        if(cat === null) {
            res.status(404).json({
                message: 'Category not found.'
            });
        }

        var toSkip = cat.posts.indexOf(maxId);
        return cat.populate({
            path: 'posts',
            options: {
                skip: toSkip,
                limit: 20
            }
        }).execPopulate().then(function(popCat) {
            res.json(popCat.posts);
        });
    })
    .catch(function(err) {
        // Fix this with error handling middleware.
        res.status(500).json(err);
    });
}