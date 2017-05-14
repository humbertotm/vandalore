// Controller
var posts_controller = require('../controllers/postsController');

var postRoutes = require('express').Router();

// Create a new post.
postRoutes.post('/posts', posts_controller.create_post);

// Delete an existing post.
postRoutes.delete('/posts', posts_controller.delete_post);

// Get a post.
postRoutes.get('/posts/:postId', posts_controller.get_post);

// *** Get a post's comments.
postRoutes.get('/posts/:postId/comments', posts_controller.get_post_comments);

module.exports = postRoutes;