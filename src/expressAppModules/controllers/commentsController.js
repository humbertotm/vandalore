// Require neccessary models.
var Comment = require('../models/commentModel');
var User = require('../models/userModel');
var Post = require('../models/postModel');

// Require mongoose and set bluebird to handle its promises.
var  mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

// Creates a comment and sends it in reponse..
module.exports.create_comment = function(req, res, next) {
    if(req.user) {
        var userId = req.user._id;
        var postId = req.body.postId;
        var content = req.body.content;

        var comment = new Comment();
        comment.postId = postId;
        comment.userId = userId;
        comment.content = content;

        return comment.save().then(function(createdComment) {
            res.json(createdComment);
            req.comment = createdComment;
            next();
        })
        .catch(function(err) {
            res.status(500).json(err);
        });
    } else {
        // If no user is authenticated
        res.status(401).json({
            message: 'Please authenticate.'
        });
    }
}

// Push and save newly created comment into user and post doc refs.
module.exports.push_and_save_comment = function(req, res) {
    var comment = req.comment;
    var userId = comment.userId;
    var postId = comment.postId;

    var promises = [
        User.findById(userId).exec(),
        Post.findById(postId).exec()
    ];

    var promisedDocs = Promise.all(promises);

    function pushAndSave(doc) {
        doc.comments.push(comment);
        return doc.save();
    }

    return promisedDocs.then(function(docs) {
        docs.map(pushAndSave);
    })
    .catch(function(err) {
        console.log(err);
    });
}

// Deletes a comment.
module.exports.delete_comment = function(req, res) {
    if(req.user) {
        var authUserId = req.user._id;
        var commentId = req.body._id;

        return Comment.findById(commentId).exec().then(function(comment) {
            if(comment.userId === authUserId) {
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
            // What about 404's?
            res.status(500).json(err);
        });
    } else {
        // If no authenticated user
        res.status(401).json({
            message: 'Please authenticate.'
        });
    }
}