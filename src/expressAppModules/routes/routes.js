// Require controllers.

module.exports = function(app, passport) {
        /* LOG IN */

    // Log in a user with local strategy.
    app.post('/login', passport.authenticate('local-login', { sessions: false }));

    /* SIGN UP */

    // Sign up a user with local strategy.
    app.post('/signup', passport.authenticate('local-signup', { sessions: false }));

    /* FACEBOOK */

    // Send to facebook to do the authentication.
    app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email', session: false }));

    // Handle callback after facebook has authenticated the user.
    app.get('/auth/facebook/callback', passport.authenticate('facebook'));

    /* GOOGLE */

    // Log in a user with Google strategy.
    app.get('/auth/google', passport.authenticate('google', { scope: 'email', session: false }));

    // Handle callback after google has authenticated the user.
    app.get('/auth/google/callback', passport.authenticate('google'));

    /* CONNECT SOCIAL ACCOUNTS */


    /* VOTES */

    // Creates a new vote.
    app.post('/votes', /* passport.authenticate() */ votes_controller.create_vote);

    // Deletes an existing vote.
    app.delete('/votes/:voteId', /* passport.authenticate() */ votes_controller.delete_vote);

    /* COMMENTS */

    // Creates a new comment.
    app.post('/comments/:postId/:userId', /* passport.authenticate() */ comments_controller.create_comment);

    // Deletes an existing comment.
    app.delete('/comments/:commentId', /* passport.authenticate() */ comments_controller.delete_comment);

    /* RELATIONSHIPS */

    // Create a new relationship.
    app.post('/relationships/:followerId/:followedId', /* passport.authenticate() */ relationships_controller.create_relationship);

    // Delete an existing relationship.
    app.delete('/relationships/:relationshipId', /* passport.authenticate() */ relationships_controller.delete_relationship);

    /* POSTS */

    // Create a new post.
    app.post('/posts', /* passport.authenticate() */ posts_controller.create_post);

    // Delete an existing post.
    app.delete('/posts/:postId', /* passport.authenticate() */ posts_controller.delete_post);

    // Get a post.
    app.get('/posts/:postId', posts_controller.get_post);

    // *** Get a post's comments.
    app.get('/posts/:postId/comments', posts_controller.get_post_comments);

    /* USERS */

    // Create a new user with local strategy.
    // This is handled in signupController.
    // app.post('/users', users_controller.create_user_local);

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

    /* CATEGORIES */

    // Gets posts from specified category.
    app.get('/categories/:categoryId', categories_controller.get_posts);

    // Gets more posts from specified category starting at provided maxId.
    app.get('/categories/:categoryId/:maxId', categories_controller.get_more_posts);

    /* NOTIFICATIONS */

    // Gets latest notifications for a user.
    app.get('/users/:userId/notifications', /* passport.authenticate() */ notifications_controller.get_notifications);

    // Updates a notification's status from unread to read.
    app.put('/users/:userId/notifications/:notificationId', /* passport.authenticate() */ notifications_controller.mark_notification_as_read);
}

