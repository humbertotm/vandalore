// Create a new post.
app.post('/posts', /* passport.authenticate() */ posts_controller.create_post);

// Delete an existing post.
app.delete('/posts/:postId', /* passport.authenticate() */ posts_controller.delete_post);

// Get a post.
app.get('/posts/:postId', posts_controller.get_post);

// *** Get a post's comments.
app.get('/posts/:postId/comments', posts_controller.get_post_comments);