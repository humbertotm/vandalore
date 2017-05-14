// Controllers
var users_controller = require('../controllers/usersController');
var notifications_controller = require('../controllers/notificationsController');

var userRoutes = require('express').Router();

// Set up middleware for these routes.
userRoutes.use(/* */);

// Deletes an existing user.
userRoutes.delete('/users', users_controller.delete_user_local);

// Updates an existing user.
userRoutes.put('/users', users_controller.update_user_local);

// Get a user.
userRoutes.get('/users/:userId', users_controller.get_user);

// *** Get each of a user's votes (with some restrictions).
userRoutes.get('/users/:userId/votes', users_controller.get_user_votes);

// Get a user's posts.
userRoutes.get('/users/:userId/posts', users_controller.get_user_posts);

// *** Get each of a user's active relationships.
userRoutes.get('/users/:userId/active_relationships', users_controller.get_user_active_relationships);

// *** Get a user's feed posts.
userRoutes.get('/users/:userId/feed', users_controller.get_user_feed_posts);

// Gets latest notifications for a user.
userRoutes.get('/users/:userId/notifications', notifications_controller.get_notifications);

// Updates a notification's status from unread to read.
notifRoutes.put('/users/:userId/notifications', notifications_controller.mark_notification_as_read);

module.exports = userRoutes;