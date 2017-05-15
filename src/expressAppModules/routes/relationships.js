// Controller
var relationships_controller = require('../controllers/relationshipsController');

// express-jwt
var expressJWT = require('express-jwt');

var relationshipRoutes = require('express').Router();

relationshipRoutes.use(expressJWT);

// Create a new relationship.
relationshipRoutes.post('/', relationships_controller.create_relationship);

// Delete an existing relationship.
relationshipRoutes.delete('/', relationships_controller.delete_relationship);

module.exports = relationshipRoutes;