// Gets posts from specified category.
app.get('/categories/:categoryId', categories_controller.get_posts);

// Gets more posts from specified category starting at provided maxId.
app.get('/categories/:categoryId/:maxId', categories_controller.get_more_posts);