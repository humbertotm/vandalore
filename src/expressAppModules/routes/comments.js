// Controller
var comments_controller = require('../controllers/commentsController');

var commentRoutes = require('express').Router();

commentRoutes.use(/* */);

// Creates a new comment.
commentRoutes.post('/comments', comments_controller.create_comment);

// Deletes an existing comment.
commentRoutes.delete('/comments', comments_controller.delete_comment);

module.exports = commentRoutes;