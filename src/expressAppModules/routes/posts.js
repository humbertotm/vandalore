// Controller
var posts_controller = require('../controllers/postsController');

// express-jet
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

var postRoutes = require('express').Router();

postRoutes.use(expressJWT());

// Create a new post.
postRoutes.post('/', upload.single('image'), posts_controller.create_post);

// Delete an existing post.
postRoutes.delete('/', posts_controller.delete_post);

// Get a post.
// Do not need authenticated user.
postRoutes.get('/:postId', posts_controller.get_post);

// *** Get a post's comments.
// Do not need authenticated user.
postRoutes.get('/:postId/comments', posts_controller.get_post_comments);

module.exports = postRoutes;