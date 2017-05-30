// Require neccessary models.
var Comment      = require('../models/commentModel'),
    User         = require('../models/userModel'),
    Post         = require('../models/postModel');

// Require mongoose and set bluebird to handle its promises.
var mongoose     = require('mongoose');
var Promise      = require('bluebird');
mongoose.Promise = Promise;

// Creates a comment and sends it in reponse.
module.exports.create_comment = function(req, res, next) {
    if(req.user) {
        var userId = req.user._id; // String
        var postId = req.body.postId; // String
        var content = req.body.content; // String

        var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

        if(!checkForHexRegExp.test(userId) || !checkForHexRegExp.test(postId)) {
            throw new Error('Bad parameters.');
        }

        var promises = [
            User.findById(userId).exec(),
            Post.findById(postId).exec()
        ];

        return Promise.all(promises).then(function(docs) {
            var comment = new Comment();
            for(var i = 0; i < docs.length; i++) {
                if(docs[i] === null) {
                    return res.status(404).json({
                        message: 'User/Post not found.'
                    });
                    break;
                }
            }

            docs.forEach(function(doc) {
                if(doc.constructor.modelName === 'User') {
                    comment.userId = doc._id;
                }

                if(doc.constructor.modelName === 'Post') {
                    comment.postId = doc._id;
                }
            });

            comment.content = content;
            return comment.save();
        }).then(function(comment) {
            res.json({
                entities: {
                    comments: comment
                }
            });
        }).catch(function(err) {
            next(err);
        });
    } else {
        // If no user is authenticated
        res.status(401).json({
            message: 'Please authenticate.'
        });
    }
}

// Deletes a comment.
module.exports.delete_comment = function(req, res, next) {
    if(req.user) {
        var authUserId = req.user._id; // String
        var commentId = req.body._id; // String

        var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

        if(!checkForHexRegExp.test(authUserId) || !checkForHexRegExp.test(commentId)) {
            throw new Error('Bad parameters.');
        }

        return Comment.findById(commentId).exec().then(function(comment) {
            if(comment === null) {
                return res.status(404).json({
                    message: 'Comment not found.'
                });
            }

            if(comment.userId.toString() === authUserId) {
                return comment.remove().then(function() {
                    res.json({
                        message: 'Comment successfully deleted.',
                        commentId: commentId
                    });
                });
            } else {
                // If authenticated user does not match owner of comment doc.
                res.status(403).json({
                    message: 'You are not authorized to perform this operation.'
                });
            }
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