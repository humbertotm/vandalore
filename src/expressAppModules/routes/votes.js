// Creates a new vote.
app.post('/votes', /* passport.authenticate() */ votes_controller.create_vote);

// Deletes an existing vote.
app.delete('/votes/:voteId', /* passport.authenticate() */ votes_controller.delete_vote);