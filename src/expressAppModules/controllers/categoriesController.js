// require Category model.
var Category     = require('../models/categoryModel');

// require mongoose and set mongoose.Promise to Bluebird.
var mongoose     = require('mongoose');
var Promise      = require('bluebird');
mongoose.Promise = Promise;

/**
 * All these functions are middlewares to be employed as middlewares for
 * /categories routes.
 * All these functions take req, res, and next as params.

 * @param {Object} req Express req object, containing the incoming request data.
 *
 * @param {Object} res Express res object, containing the data to be sent in
 * in the response.
 *
 * @param {Function} next Function that passes flow control to the next middleware
 * in the chain when called with no arguments. When next(err) is called, flow
 * control is passed directly to the error handling middleware set up for the route.
*/

/**
 * Gets posts for the category specified in req.params.categoryId.
 *
 * Will throw an Error if req.params.categoryId is not a Number
 * (see Category model's _id).
 *
 * Find Category by req.params.categoryId and populate its first 20 posts
 * in reverse order (newer first). All fields for each post will be required
 * except for comments, and postSave/Remove hooks.
 *
 * Nested user population for each post will be required.
 * Fields to be populated are _id, username, profilePic, activated.
 * Exclude everything else.
 *
 * Once Category is found, if it is null, respond with 404.
 *
 * Only posts for which the populated user is not null shall be sent in response.
 *
 * If there is an I/O error along the way, call next(err) to handle it
 * appropriately.
*/
module.exports.get_posts = function(req, res, next) {
    var categoryId = req.params.categoryId;

    if(isNaN(categoryId)) {
        throw new Error('Id provided is not a Number.');
    }

    return Category.findById(categoryId).populate({
        path: 'posts',
        select: '-comments -postSaveHookEnabled -postRemoveHookEnabled',
        options: { limit: 20, sort: -1 },
        populate: {
            path: 'user',
            select: '_id username miniProfilePicUrl activated -admin -password'
        }
    }).exec().then(function(category) {
        if(category === null) {
            return res.status(404).json({
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

/**
 * Gets more posts for the category specified in req.params.categoryId,
 * beginning at req.params.maxId.
 *
 * Will throw an Error if req.params.categoryId is not a Number
 * (see Category model's _id), or if req.params.maxId is not a 12 byte hex String.
 *
 * Find Category by req.params.categoryId and populate 20 posts in reverse
 * order (newer first), beginning at maxId. All fields for each post will be required
 * except for comments, and postSave/Remove hooks.
 *
 * Nested user population for each post will be required.
 * Fields to be populated are _id, username, profilePic, activated.
 * Exclude everything else.
 *
 * Once Category is found, if it is null, respond with 404.
 *
 * Only posts for which the populated user is not null shall be sent in response.
 *
 * If there is an I/O error along the way, call next(err) to handle it
 * appropriately.
*/
module.exports.get_more_posts = function(req, res, next) {
    var categoryId = req.params.categoryId; // String
    var maxId = req.params.maxId;  // String

    var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

    if(!checkForHexRegExp.test(maxId) || isNaN(categoryId)) {
        throw new Error('Bad parameters.');
    }

    return Category.findById(categoryId).exec().then(function(cat) {
        if(cat === null) {
            res.status(404).json({
                message: 'Category not found.'
            });
        }

        // Make sure this works, and find a more direct way of doing it.
        var reversedPosts = cat.posts.reverse();
        // What if this is -1?
        var toSkip = reversedPosts.indexOf(mongoose.Types.ObjectId(maxId));
        return cat.populate({
            path: 'posts',
            select: '-comments -postSaveHookEnabled -postRemoveHookEnabled',
            options: {
                skip: toSkip,
                limit: 20,
                sort: -1
            },
            // Make sure this works within a doc.populate();
            // !!! What if population fails here? Does cat.populate() reject?
            populate: {
                path: 'user',
                select: '_id username profilePic activated -admin -password'
            }
        }).execPopulate().then(function(popCat) {
            var catPosts = [];
            var posts = popCat.posts;
            posts.forEach(function(post) {
                // Are posts going to be only the populated docs or the whole array?
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

/**
 * Creates a new Category.
 *
 * Throws and Error if req.body._id is not a Number or req.body.name is
 * not a String.
 *
 * Responds with newly created category name and id.
*/
module.exports.create_category = function(req, res, next) {
    var id = req.body._id; // String
    var catName = req.body.name; // String

    if(isNaN(categoryId) || typeof catName !== 'string') {
        throw new Error('Bad parameters.');
    }

    var category = new Category({
        _id: id,
        categoryName: catName
    });

    return category.save().then(function(cat) {
        res.json({
            categoryName: cat.categoryName,
            categoryId: cat._id
        });
    }).catch(function(err) {
        next(err);
    });
}