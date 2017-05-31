// Controller
var comments_controller = require('../controllers/commentsController');

// express-jwt
var expressJWT = require('express-jwt');

var commentRoutes = require('express').Router();

commentRoutes.use(expressJWT({
    secret: 'secret'
}));

// Creates a new comment.
commentRoutes.post('/', comments_controller.create_comment);

// Deletes an existing comment.
commentRoutes.delete('/', comments_controller.delete_comment);

module.exports = commentRoutes;