// Controller
var categories_controller = require('../controllers/categoriesController');

var categoryRoutes = require('express').Router();

// categoryRoutes.use(/* */);

// Gets posts from specified category.
categoryRoutes.get('/:categoryId', categories_controller.get_posts);

// Gets more posts from specified category starting at provided maxId.
categoryRoutes.get('/:categoryId/:maxId', categories_controller.get_more_posts);

// Create a category.
// Did this because it was the quickest way to create the categories,
// given the fact that I do not know how to do it through the mono shell, yet.
categoryRoutes.post('/', categories_controller.create_category);

module.exports = categoryRoutes;