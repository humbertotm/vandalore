// Controller
var relationships_controller = require('../controllers/relationshipsController');

// express-jwt
var expressJWT = require('express-jwt');

var relationshipRoutes = require('express').Router();

relationshipRoutes.use(expressJWT({
    secret: 'secret'
}));

// Create a new relationship.
relationshipRoutes.post('/', relationships_controller.create_relationship);

// Delete an existing relationship.
relationshipRoutes.delete('/', relationships_controller.delete_relationship_follower,
                               relationships_controller.delete_relationship_followed);

module.exports = relationshipRoutes;