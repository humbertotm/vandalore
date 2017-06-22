// Require neccessary models.
var Comment      = require('../models/commentModel'),
    User         = require('../models/userModel'),
    Post         = require('../models/postModel');

// Require mongoose and set mongoose.Promise to Bluebird.
var mongoose     = require('mongoose');
var Promise      = require('bluebird');
mongoose.Promise = Promise;

/**
 * All these functions are middlewares to be employed as middlewares for
 * /comments routes.
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
 * This function verifies the user and post associated to the soon-to-be comment
 * exist in the database before proceeding to it.
 *
 * If there is no authenticated user (!req.user), respond with 401.
 *
 * If there is an authenticated user (req.user as set by previous expressJWT
 * middleware):
 *
 * Throw an Error if req.user._id or req.body.postId is not a string representing
 * a 12 byte hex number.
 *
 * Find both, user and post.
 * If one or both are null (do not exist in the DB), respond with 404.
 *
 * If both are found, set req.user and req.post respectively, and call next().
 *
 * If there is an I/O error along the way, call next(err) to handle it
 * appropriately.
*/
module.exports.verify_docs_create = function(req, res, next) {
    if(req.user) {
        var userId = req.user._id; // String
        var postId = req.body.postId; // String

        var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

        if(!checkForHexRegExp.test(userId) || !checkForHexRegExp.test(postId)) {
            throw new Error('Bad parameters.');
        }

        var promises = [
            Post.findById(postId).exec(),
            User.findById(userId).exec()
        ];

        return Promise.all(promises).then(function(results) {
            var nullDoc = false;
            for(var i = 0; i < results.length; i++) {
                if(results[i] === null) {
                    nullDoc = true;
                    break;
                }

                if(results[i].constructor.modelName === 'Post') {
                    req.post = results[i];
                }

                req.user = results[i];
            }

            if(nullDoc) {
                return res.status(404).json({
                    message: 'User and/or Post not found.'
                });
            }

            next();
        }).catch(function(err) {
            next(err);
        });
    } else {
        res.status(401).json({
            message: 'Please authenticate.'
        });
    }
}

/**
 * Creates new comment setting userId and postId to req.user._id and
 * req.post._id, respectively.
 *
 * Once comment is saved, push comment._id to req.user.comments and
 * req.post.comments, and save both docs in parallel.
 *
 * Once this is done, responds with newly created comment, having previously
 * populated the user field.
 *
 * If there is an I/O error along the way, call next(err) to handle it
 * appropriately.
*/
module.exports.create_comment = function(req, res, next) {
    var user = req.user;
    var post = req.post;

    post.postSaveHookEnabled = false;

    var comment = new Comment({
        userId: user._id,
        postId: post._id,
        content: req.body.content
    });

    // Not quite sure this code works.
    var commSave = comment.save();
    var userAndPostSave = commSave.then(function(comment) {
        post.comments.push(comment._id);
        user.comments.push(comment._id);
        return Promise.all([post.save(), user.save()]);
    });

    return Promise.join(commSave, userAndPostSave, function(comment, results) {
        return comment.populate({
            path: 'userId',
            select: '_id username profilePic activated -admin -password'
        }).then(function(comment) {
            res.json({
                entities: {
                    comments: comment
                }
            });
        });
    }).catch(function(err) {
        next(err);
    });
}

/**
 * This function verifies the user, post, and comment exist in the database
 * before proceeding to delete it.
 *
 * If there is no authenticated user (!req.user), respond with 401.
 *
 * If there is an authenticated user (req.user as set by previous expressJWT
 * middleware):
 *
 * Throw an Error if req.user._id, req.body.postId or req.body.commentId
 * is not a string representing a 12 byte hex number.
 *
 * Find user and post, and comment.
 * If at least one of the docs is null (do not exist in the DB), respond with 404.
 *
 * If all docs are found, set req.user, req.post, and req.comment respectively,
 * and call next().
 *
 * If there is an I/O error along the way, call next(err) to handle it
 * appropriately.
*/
module.exports.verify_docs_delete = function(req, res, next) {
    if(req.user) {
        var userId    = req.user._id; // String
        var postId    = req.body.postId;
        var commentId = req.body.commentId; // String

        var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

        if(!checkForHexRegExp.test(userId) || !checkForHexRegExp.test(commentId) || !checkForHexRegExp.test(postId)) {
            throw new Error('Bad parameters.');
        }

        var promises = [
            Comment.findById(commentId).exec(),
            User.findById(userId).exec(),
            Post.findById(postId).exec()
        ];

        return Promise.all(promises).then(function(results) {
            var nullDoc = false;
            for(var i = 0; i < results.length; i++) {
                if(results[i] === null) {
                    nullDoc = true;
                    break;
                }

                if(results[i].constructor.modelName === 'Comment') {
                    req.comment = results[i];
                }

                if(results[i].constructor.modelName === 'Post') {
                    req.post = results[i];
                }

                req.user = results[i];
            }

            if(nullDoc) {
                return res.status(404).json({
                    message: 'User and/or Comment and/or Post not found.'
                });
            }

            next();
        }).catch(function(err) {
            next(err);
        });
    } else {
        res.status(401).json({
            message: 'Please authenticate.'
        });
    }
}

/**
 * Responds with 403 if req.comment.userId does not match req.user._id.
 *
 * Remove comment, and remove it from references in user, and post.
 * Save any modified docs.
 *
 * Handle all cases where a reference to the comment at hand is not found
 * in associated user and/or post docs.
 *
 * If there is an I/O error along the way, call next(err) to handle it
 * appropriately.
*/
module.exports.delete_comment = function(req, res, next) {
    var comment = req.comment;
    var post    = req.post;
    var user    = req.user;

    post.postSaveHookEnabled = false;

    if(comment.userId !== user._id) {
        return res.status(403).json({
            message: 'You are not authorized to perform this operation.'
        });
    }

    var indexPost = post.comments.indexOf(comment._id);
    var indexUser = user.comments.indexOf(comment._id);

    if(indexPost === -1 && indexUser === -1) {
        return comment.remove().then(function() {
            res.json({
                message: 'Comment successfully deleted.'
            });
        }).catch(function(err) {
            next(err);
        });
    }

    if(indexPost !== -1 && indexUser === -1) {
        return comment.remove().then(function() {
            post.comments.splice(indexPost, 1);
            return post.save();
        }).then(function() {
            res.json({
                message: 'Comment successfully deleted.'
            });
        }).catch(function(err) {
            next(err);
        });
    }

    if(indexPost === -1 && indexUser !== -1) {
        return comment.remove().then(function() {
            user.comments.splice(indexUser, 1);
            return user.save();
        }).then(function() {
            res.json({
                message: 'Comment successfully deleted.'
            });
        }).catch(function(err) {
            next(err);
        });
    }

    return comment.remove().then(function() {
        post.comments.splice(indexPost, 1);
        user.comments.splice(indexUser, 1);
        return Promise.all([post.save(), user.save()]);
    }).then(function() {
        res.json({
            message: 'Comment successfully deleted.'
        });
    }).catch(function(err) {
        next(err);
    });
}