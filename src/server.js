var express = require('express');
var app = express();
var mongoose = require('mongoose');
var morgan = require('morgan');
var bodyParser = require('body-parser');

// vote routes
var createVotePromise = require('./expressAppModules/controllers/votesController').create_vote_promise;

var port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: 'application/json'}));


app.get('/', function(req, res) {
    res.send('Welcome to app, homie!');
});

// app.post('/votes', createVotePromise);

app.listen(port, function() {
    console.log('Listening on port ' + port);
});



// For testing
// module.exports = app;