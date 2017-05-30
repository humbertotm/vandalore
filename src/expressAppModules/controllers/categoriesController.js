// require Category model.
var Category     = require('../models/categoryModel');

// require mongoose and set promises to Bluebird.
var mongoose     = require('mongoose');
var Promise      = require('bluebird');
mongoose.Promise = Promise;

module.exports.get_posts = function(req, res, next) {
    var categoryId = req.params.categoryId;

    if(isNaN(categoryId)) {
        throw new Error('Id provided is not a Number.');
    }

    return Category.findById(categoryId).populate({
        path: 'posts',
        select: '-comments -postSaveHookEnabled -postRemoveHookEnabled',
        // I want them to be in reverse order in which thew were pushed.
        options: { limit: 20. sort: -1 },
        populate: {
            path: 'user',
            select: '_id username miniProfilePicUrl activated -admin'
        }
    }).exec().then(function(category) {
        if(category === null) {
            res.status(404).json({
                message: 'Category not found.'
            });
        }

        var posts = category.posts;
        var catPosts = [];
        posts.forEach(function(post) {
            if(post.user !== null) {
                catPosts.push(post);
            }
        });

        res.json({
            entities: {
                posts: catPosts
            }
        });
    }).catch(function(err) {
        return next(err);
    });
}

module.exports.get_more_posts = function(req, res, next) {
    var categoryId = req.params.categoryId; // String
    var maxId = req.params.maxId;  // String

    var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

    // Make sure this is correctly formulated.
    if(!checkForHexRegExp.test(maxId) || isNaN(categoryId)) {
        throw new Error('Bad parameters.');
    }

    return Category.findById(categoryId).exec().then(function(cat) {
        if(cat === null) {
            res.status(404).json({
                message: 'Category not found.'
            });
        }

        // Keep an eye here.
        // Not sure if maxId as a String will work here.
        // If it doesn't:
        // var toSkip = cat.posts.indexOf(mongoose.Types.ObjectId(maxId));
        var toSkip = cat.posts.indexOf(maxId);
        return cat.populate({
            path: 'posts',
            select: '-comments -postSaveHookEnabled -postRemoveHookEnabled',
            options: {
                // Watch out for the end where it starts skipping.
                skip: toSkip,
                limit: 20,
                sort: -1
            },
            // Make sure this works within a doc.populate();
            // !!! What if population fails here? Does cat.populate() reject?
            populate: {
                path: 'user',
                select: '_id username miniProfilePicUrl activated -admin'
            }
        }).execPopulate().then(function(popCat) {
            var catPosts = [];
            var posts = popCat.posts;
            posts.forEach(function(post) {
                if(post.user !== null) {
                    catPosts.push(post);
                }
            });

            res.json({
                entities: {
                    posts: catPosts
                }
            });
        });
    }).catch(function(err) {
        next(err);
    });
}