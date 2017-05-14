// Controller
var relationships_controller = require('../controllers/relationshipsController');

var relationshipRoutes = require('express').Router();

relationshipRoutes.use(/* Set up required middleware for this routes. */);

// Create a new relationship.
relationshipRoutes.post('/relationships', relationships_controller.create_relationship);

// Delete an existing relationship.
relationshipRoutes.delete('/relationships', relationships_controller.delete_relationship);

module.exports = relationshipRoutes;