// Controller
var categories_controller = require('../controllers/categoriesController');

var categoryRoutes = require('express').Router();

categoryRoutes.use(/* */);

// Gets posts from specified category.
categoryRoutes.get('/categories/:categoryId', categories_controller.get_posts);

// Gets more posts from specified category starting at provided maxId.
categoryRoutes.get('/categories/:categoryId/:maxId', categories_controller.get_more_posts);

module.exports = categoryRoutes;