// Controllers
var users_controller = require('../controllers/usersController');
var notifications_controller = require('../controllers/notificationsController');

// express-jwt
var expressJWT = require('express-jwt');

// multer
var aws = require('aws-sdk');
var multer = require('multer');
var multerS3 = require('multer-s3');

aws.config.loadFromPath('~/AWS/aws-config.json');

var s3 = new aws.S3({ params: {
        Bucket: 'vandalore'
    }
});

var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'flor-app',
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
userRoutes.use(expressJWT());

// Deletes an existing user.
userRoutes.delete('/', users_controller.delete_user_local);

// Updates an existing user profile.
userRoutes.put('/', upload.single('profile-pic'), users_controller.update_user_profile);

// Get a user.
userRoutes.get('/:userId', users_controller.get_user);

// *** Get each of a user's votes (with some restrictions).
userRoutes.get('/:userId/votes', users_controller.get_user_votes);

// Get a user's posts.
// Do not need auth to access route.
userRoutes.get('/:userId/posts', users_controller.get_user_posts);

// *** Get each of a user's active relationships.
userRoutes.get('/:userId/active_relationships', users_controller.get_user_active_relationships);

// *** Get a user's feed posts.
userRoutes.get('/:userId/feed', users_controller.get_user_feed_posts);

// Gets latest notifications for a user.
userRoutes.get('/:userId/notifications', notifications_controller.get_notifications);

// Updates a notification's status from unread to read.
notifRoutes.put('/:userId/notifications', notifications_controller.mark_notification_as_read);

module.exports = userRoutes;