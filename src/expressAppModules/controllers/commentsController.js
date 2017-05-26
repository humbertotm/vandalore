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

        var comment = new Comment();
        comment.postId = postId;
        comment.userId = userId;
        comment.content = content;

        return comment.save().then(function(createdComment) {
            res.json(createdComment);
        })
        .catch(function(err) {
            next(err);
        });
    } else {
        // If no user is authenticated
        res.status(401).json({
            message: 'Please authenticate.'
        });
    }
}

// Push and save newly created comment into user and post doc refs.
// Will be substituted by post('save') hook.
/*
module.exports.push_and_save_comment = function(req, res, next) {
    var comment = req.comment;
    var userId = comment.userId; // ObjectId
    var postId = comment.postId; // ObjectId

    var promises = [
        // What if any of these return null? Will the Promise reject?
        User.findById(userId).exec(),
        Post.findById(postId).exec()
    ];

    var promisedDocs = Promise.all(promises);

    function pushAndSave(doc) {
        // What if one of thses promises rejects? Will it be handled by .catch()?
        // Apparently not. Fix this.
        // Brute force way of fixing this: split it into two middleware functions.
        doc.comments.push(comment);
        return doc.save();
    }

    return promisedDocs.then(function(docs) {
        docs.map(pushAndSave);
    })
    .catch(function(err) {
        err.logToConsole = true;
        next(err);
    });
}
*/

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
        })
        .catch(function(err) {
            next(err);
        });
    } else {
        // If no authenticated user
        res.status(401).json({
            message: 'Please authenticate.'
        });
    }
}