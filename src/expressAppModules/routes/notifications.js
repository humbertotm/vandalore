var notifRoutes = require('express').Router();

notifRoutes.use(/* */);

// Gets latest notifications for a user.
notifRoutes.get('/users/:userId/notifications', /* passport.authenticate() */ notifications_controller.get_notifications);

// Updates a notification's status from unread to read.
notifRoutes.put('/users/:userId/notifications/:notificationId', /* passport.authenticate() */ notifications_controller.mark_notification_as_read);

module.exports = notifRoutes;