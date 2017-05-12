// Creates a new comment.
app.post('/comments/:postId/:userId', /* passport.authenticate() */ comments_controller.create_comment);

// Deletes an existing comment.
app.delete('/comments/:commentId', /* passport.authenticate() */ comments_controller.delete_comment);