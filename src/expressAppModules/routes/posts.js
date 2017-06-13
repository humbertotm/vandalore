// Controller
var posts_controller = require('../controllers/postsController');

// express-jet
var expressJWT = require('express-jwt');

// multer
var aws = require('aws-sdk');
var multer = require('multer');

// This file should not be in repo. !! Sensitive info.
// aws.config.loadFromPath('../../AWS/aws-config.json');

var storage = multer.diskStorage({
    // create dir
    destination: '../public/images',
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now().toString() + '.jpg');
    }
});

var upload = multer({ storage: storage });

var postRoutes = require('express').Router();

postRoutes.use(expressJWT({
    secret: 'secret'
}));

// Create a new post.
postRoutes.post('/', expressJWT({
    secret: 'secret'
}), upload.single('image'), posts_controller.verify_user,
                            posts_controller.image_versioning,
                            posts_controller.store_in_s3,
                            posts_controller.delete_local_files,
                            posts_controller.create_post
);

// Delete an existing post.
postRoutes.delete('/', expressJWT({
    secret: 'secret'
}), posts_controller.verify_docs, posts_controller.delete_post);

// Get a post.
// Do not need authenticated user.
postRoutes.get('/:postId', posts_controller.get_post);

// *** Get a post's comments.
// Do not need authenticated user.
postRoutes.get('/:postId/comments', posts_controller.get_post_comments);

module.exports = postRoutes;