// Deletes an existing user with local strategy.
app.post('/users/:userId', /* passport.authenticate() */ users_controller.delete_user_local);

// Updates an existing user with local strategy.
app.put('/users/:userId', /* passport.authenticate() */ users_controller.update_user_local);

// Get a user.
app.get('/users/:userId', users_controller.get_user);

// *** Get each of a user's votes (with some restrictions).
app.get('/users/:userId/votes', /* passport.authenticate() */ users_controller.get_user_votes);

// Get a user's posts.
app.get('/users/:userId/posts', users_controller.get_user_posts);

// *** Get each of a user's active relationships.
app.get('/users/:userId/active_relationships', /* passport.authenticate() */ users_controller.get_user_active_relationships);

// *** Get a user's feed posts.
app.get('/users/:userId/feed', /* passport.authenticate() */ users_controller.get_user_feed_posts);