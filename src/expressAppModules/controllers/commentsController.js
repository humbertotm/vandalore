// Require neccessary models.
var Comment      = require('../models/commentModel'),
    User         = require('../models/userModel'),
    Post         = require('../models/postModel');

// Require mongoose and set bluebird to handle its promises.
var mongoose     = require('mongoose');
var Promise      = require('bluebird');
mongoose.Promise = Promise;

// Verify user and post of interest exist in the DB, for both create action.
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
        // If no authenticated user
        res.status(401).json({
            message: 'Please authenticate.'
        });
    }
}

// Creates a comment and sends it in reponse.
// Passing but throwing a MongooseError.
module.exports.create_comment = function(req, res, next) {
    var user = req.user;
    var post = req.post;

    post.postSaveHookEnabled = false;

    var comment = new Comment({
        userId: user._id,
        postId: post._id,
        content: req.body.content
    });

    var commSave = comment.save();
    var userAndPostSave = commSave.then(function(comment) {
        post.comments.push(comment._id);
        user.comments.push(comment._id);
        return Promise.all([post.save(), user.save()]);
    });

    return Promise.join(commSave, userAndPostSave, function(comment, results) {
        res.json({
            entities: {
                comments: comment
            }
        });
    }).catch(function(err) {
        next(err);
    });

    /*

    var createdComm;

    return comment.save().then(function(comment) {
        createdComm = comment;

        user.comments.push(comment._id);
        post.comments.push(comment._id);

        return Promise.all([post.save(), user.save()]).then(function() {
            res.json({
                entities: {
                    comments: createdComm
                }
            });
        });
    }).catch(function(err) {
        next(err);
    });
*/
}

// Verify user and post of interest exist in the DB, for delete action.
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
        // If no authenticated user
        res.status(401).json({
            message: 'Please authenticate.'
        });
    }
}

// Deletes a comment.
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