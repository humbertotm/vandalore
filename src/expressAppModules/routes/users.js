var path = require('path');
// Controllers
var users_controller = require('../controllers/usersController');
var notifications_controller = require('../controllers/notificationsController');

// express-jwt
var expressJWT = require('express-jwt');

// multer
var aws = require('aws-sdk');
var multer = require('multer');
var multerS3 = require('multer-s3');

// This path is relative to the working directory, not the path of this file.
aws.config.loadFromPath('./config/AWS/aws-config.json');

var s3 = new aws.S3({ params: {
        Bucket: 'vandalore-test'
    }
});

var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'vandalore-test',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function(req, file, cb) {
            cb(null, {fieldName: file.fieldname});
        },
        key: function(req, file, cb) {
            cb(null, Date.now().toString() + '.JPG');
        }
    })
});

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
}), upload.single('profile-pic'), users_controller.update_user_profile);

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