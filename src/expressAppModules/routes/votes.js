// Controller
var votes_controller = require('../controllers/votesController');

var voteRoutes = require('express').Router();

voteRoutes.use(/* */);

// Creates a new vote.
voteRoutes.post('/votes', votes_controller.create_vote);

// Deletes an existing vote.
voteRoutes.delete('/votes', votes_controller.delete_vote);

module.exports = voteRoutes;