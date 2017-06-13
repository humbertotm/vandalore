var express       = require('express'),
    app           = express(),
    mongoose      = require('mongoose'),
    morgan        = require('morgan'),
    bodyParser    = require('body-parser');

// DB config
// !!! The file required shall never go to GitHub. Sensitive info.
var configDB      = require('../../DBConfig/dbConfig.js');

// Import routes
var auth          = require('./expressAppModules/routes/auth'),
    categories    = require('./expressAppModules/routes/categories'),
    users         = require('./expressAppModules/routes/users'),
    votes         = require('./expressAppModules/routes/votes'),
    posts         = require('./expressAppModules/routes/posts'),
    comments      = require('./expressAppModules/routes/comments'),
    relationships = require('./expressAppModules/routes/relationships');

var port = 3000;

// Connect to Db
mongoose.connect(configDB.url);

// Double check the middleware used.
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: 'application/json' }));
// Error handling middleware
// Move it to a separate file and test it.
app.use(function(err, req, res, next) {
    // Think about what else could be added here.
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

// Or we could push this operation to another server.
// This one will serve the app.
// All server-side rendering will happen here.
app.get('/', function(req, res) {
    res.send('Welcome to app, homie!');
});



app.listen(port, function() {
    console.log('Listening on port ' + port);
});
