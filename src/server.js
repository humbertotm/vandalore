var express = require('express');
var app = express();
var mongoose = require('mongoose');
var morgan = require('morgan');
var bodyParser = require('body-parser');

// DB config
var configDB = require('./config/database');

// Import routes
var auth = require('./expressAppModules/routes/auth');
var categories = require('./expressAppModules/routes/categories');
var users = require('./expressAppModules/routes/users');
var votes = require('./expressAppModules/routes/votes');
var posts = require('./expressAppModules/routes/posts');
var comments = require('./expressAppModules/routes/comments');
var relationships = require('./expressAppModules/routes/relationships');

var port = 3000;

// Connect to Db
mongoose.connect(configDB.url);

// Double check the middleware used.
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: 'application/json'}));
// Error handling middleware
// Move it to a separate file and test it.
app.use(function(err, req, res, next) {
    if(err.logToConsole) {
        console.log(err.message);
        return;
    }

    res.status(err.status || 500);
    res.json(err.message);
});

// Routes
app.use('/auth', auth);
app.use('/categories', categories);
app.use('/users', users);
app.use('/votes', votes);
app.use('/posts', posts);
app.use('/comments', comments);
app.use('/relationships', relationships);

// This one will serve the app.
// All server-side rendering will happen here.
app.get('/', function(req, res) {
    res.send('Welcome to app, homie!');
});



app.listen(port, function() {
    console.log('Listening on port ' + port);
});
