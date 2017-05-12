// *** Both of these routes should be intercepted by JWT middleware to auth ***

// Create a new relationship.
app.post('/relationships', relationships_controller.create_relationship);

// Delete an existing relationship.
app.delete('/relationships', relationships_controller.delete_relationship);