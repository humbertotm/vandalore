// Controller
var votes_controller = require('../controllers/votesController');

// express-jwt
var expressJWT = require('express-jwt');

var voteRoutes = require('express').Router();

voteRoutes.use(expressJWT({
    secret: 'secret'
}));

// Creates a new vote.
voteRoutes.post('/', votes_controller.create_vote);

// Deletes an existing vote.
voteRoutes.delete('/', votes_controller.delete_vote_user, votes_controller.delete_vote_post);

module.exports = voteRoutes;