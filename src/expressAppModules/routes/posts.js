// Controller
var posts_controller = require('../controllers/postsController');

// express-jet
var expressJWT = require('express-jwt');

var postRoutes = require('express').Router();

postRoutes.use(expressJWT());

// Create a new post.
postRoutes.post('/', posts_controller.create_post);

// Delete an existing post.
postRoutes.delete('/', posts_controller.delete_post);

// Get a post.
// Do not need authenticated user.
postRoutes.get('/:postId', posts_controller.get_post);

// *** Get a post's comments.
// Do not need authenticated user.
postRoutes.get('/:postId/comments', posts_controller.get_post_comments);

module.exports = postRoutes;