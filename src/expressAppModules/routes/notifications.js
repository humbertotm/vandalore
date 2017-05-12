// Gets latest notifications for a user.
app.get('/users/:userId/notifications', /* passport.authenticate() */ notifications_controller.get_notifications);

// Updates a notification's status from unread to read.
app.put('/users/:userId/notifications/:notificationId', /* passport.authenticate() */ notifications_controller.mark_notification_as_read);