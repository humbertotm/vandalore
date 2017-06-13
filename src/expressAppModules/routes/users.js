var path = require('path');
// Controllers
var users_controller = require('../controllers/usersController');
var notifications_controller = require('../controllers/notificationsController');

// express-jwt
var expressJWT = require('express-jwt');

// multer
var aws = require('aws-sdk');
var multer = require('multer');

// This path is relative to the working directory, not the path of this file.
// Won't work if I run the server from another path different than /src.

var storage = multer.diskStorage({
    // create dir beforehand
    destination: '../public/images',
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now().toString() + '.jpg');
    }
});

var upload = multer({ storage: storage });

var userRoutes = require('express').Router();

// Set up middleware for these routes.
userRoutes.use(expressJWT({
    secret: 'secret'
}));

// Deletes an existing user.
userRoutes.delete('/', expressJWT({
    secret: 'secret'
}), users_controller.delete_user);

// Updates an existing user profile.
userRoutes.put('/profile', expressJWT({
    secret: 'secret'
}), users_controller.update_user_profile);

// Updates user's profile picture.
userRoutes.put('/profile_picture', expressJWT({
    secret: 'secret',
}), upload.single('profile-pic'), users_controller.verify_user,
                                  users_controller.image_versioning,
                                  users_controller.store_in_s3,
                                  users_controller.delete_local_files,
                                  users_controller.update_profile_pic
);

// Updates a user's local email.
userRoutes.put('/email', expressJWT({
    secret: 'secret'
}), users_controller.update_user_local_email);

// Updates a user's password.
userRoutes.put('/password', expressJWT({
    secret: 'secret'
}), users_controller.update_user_password);

// Get a user.
userRoutes.get('/:userId', users_controller.get_user);

// Get a user's posts.
// Do not need auth to access route.
userRoutes.get('/:userId/posts', users_controller.get_user_posts);

// *** Get a user's feed posts.
userRoutes.get('/:userId/feed', expressJWT({
    secret: 'secret'
}), users_controller.get_user_feed_posts);

// Gets latest notifications for a user.
userRoutes.get('/:userId/notifications', expressJWT({
    secret: 'secret'
}), notifications_controller.get_notifications);

// Updates a notification's status from unread to read.
userRoutes.put('/:userId/notifications', expressJWT({
    secret: 'secret'
}), notifications_controller.mark_notification_as_read);

module.exports = userRoutes;