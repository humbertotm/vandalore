// Require necessary models.
var Post         = require('../models/postModel'),
    User         = require('../models/userModel'),
    Category     = require('../../../src/expressAppModules/models/categoryModel');

// Require necessary npm modules.
var fs           = require('fs'),
    gm           = require('gm'),
    parallel     = require('async/parallel'),
    aws          = require('aws-sdk');

// Require mongoose and set mongoose.Promise to Bluebird.
var mongoose     = require('mongoose');
var Promise      = require('bluebird');
mongoose.Promise = Promise;

// Load aws access, and secret keys.
// aws.config.loadFromPath('../../AWS/aws-config.json');

/**
 * All these functions are middlewares to be employed as middlewares for
 * /posts routes.
 * All these functions take req, res, and next as params.

 * @param {Object} req Express req object, containing the incoming request data.
 *
 * @param {Object} res Express res object, containing the data to be sent in
 * in the response.
 *
 * @param {Function} next Function that passes flow control to the next middleware
 * in the chain when called with no arguments. When next(err) is called, flow
 * control is passed directly to the error handling middleware set up for the route.
*/

/**
 * Verify the authenticated user exists in DB before proceeding to create post.
 *
 * If no user is authenticated, respond with 401.
 *
 * Throw an error if req.user._id is not a string representing a 12 byte hex number.
 *
 * Find user with req.user._id.
 * If no user is found (null), respond with 404.
 *
 * Set req.user to found user doc.
 *
 * If there is an I/O error along the way, call next(err) to handle it
 * appropriately.
*/
module.exports.verify_user = function(req, res, next) {
    if(req.user) {
        var userId = req.user._id; // String

        var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

        if(!checkForHexRegExp.test(userId)) {
            throw new Error('Bad parameters.');
        }

        return User.findById(userId).exec().then(function(user) {
            if(user === null) {
                return res.status(404).json({
                    message: 'User not found.'
                });
            }

            req.user = user;
            next();
        }).catch(function(err) {
            return next(err);
        });
    } else {
        res.status(401).json({
            message: 'Please authenticate.'
        });
    }
}

/**
 * Do image versioning with the file in req.file set by multer.
 *
 * Create a fullPic and a thumbnail, running gm processes in parallel.
 *
 * Once the process is done successfully, set req.fullPicPath and
 * req.thumbnailPath to the respective paths of the new image files created.
 * Pass control flow to next middleware in the chain.
 *
 * If there is an I/O error along the way, call next(err) to handle it
 * appropriately.
*/
module.exports.image_versioning = function(req, res, next) {
    var path = req.file.path;

    var versions = {
        fullPic: {
            width: 650
        },
        thumbnail: {
            width: 300
        }
    };

    var fullPicPath = '../public/images/' + Date.now().toString() + '-' + 'fullPic.jpg';
    var thumbnailPath = '../public/images/' + Date.now().toString() + '-' + 'thumbnail.jpg';

    parallel([
        // Adjust width and maintain proportions.
        function(done) {
            gm(path)
                .resize(versions.fullPic.width)
                .write(fullPicPath, function(err) {
                    done(err);
                });
        },
        function(done) {
            gm(path)
                .resize(versions.thumbnail.width)
                .write(thumbnailPath, function(err) {
                    done(err);
                });
        }
    ], function done(err, results) {
        if(err) { return next(err); }

        req.fullPicPath = fullPicPath;
        req.thumbnailPath = thumbnailPath;
        next();
    });
}

/**
 * Stores fullPic and thumbnail versions to AWS S3 Bucket.
 *
 * Reads the files from req.fullPicPath and req.thumbnailPath, and creates a
 * Buffer from each to proceed to upload them to S3 Bucket.
 *
 * Once both file have been successfully uploaded, set req.thumbnailUrl and
 * req.fullPicUrl from s3.upload() return object. Pass control flow to next
 * middleware in the chain.
 *
 * If there is an I/O error along the way, call next(err) to handle it
 * appropriately.
*/
module.exports.store_in_s3 = function(req, res, next) {
    var fullPic = req.fullPicPath;
    var thumbnail = req.thumbnailPath;

    function storePic(file, imageSize, done) {
        fs.readFile(file, function(err, data) {
            if(err) { return done(err); }

            var base64data = Buffer.from(data, 'binary');
            var s3 = new aws.S3();
            var key = Date.now().toString() + '-' + imageSize + '.jpg';

            s3.upload({
                Bucket: 'vandalore',
                Key: key,
                Body: base64data,
                // Beware: Not all images will be png.
                ContentType: 'image/png',
                ACL: 'public-read'
            }, function(err, data) {
                if(err) { return done(err); }
                done(null, data);
            });
        });
    }

    parallel({
        fullPic: function(done) {
            var imageSize = 'fullPic';
            storePic(fullPic, imageSize, done);
        },
        thumbnail: function(done) {
            var imageSize = 'thumbnail';
            storePic(thumbnail, imageSize, done);
        }
    }, function done(err, results) {
        if(err) { return next(err); }

        // results: { fullPic: {}, thumbnail: {} }
        req.thumbnailUrl = results.thumbnail.Location;
        req.fullPicUrl = results.fullPic.Location;
        next();
    });
}

/**
 * Delete all three (original, thumbnail, fullPic) local files on machine
 * in parallel.
 *
 * On success, pass control flow to the next middleware in the chain.
 *
 * If there is an I/O error along the way, call next(err) to handle it
 * appropriately.
*/
module.exports.delete_local_files = function(req, res, next) {
    function deleteFile(file, done) {
        fs.unlink(file, function(err) {
            if(err) { return done(err); }
            done(null, file);
        });
    }

    parallel([
        function(done) {
            deleteFile(req.fullPicPath, done);
        },
        function(done) {
            deleteFile(req.thumbnailPath, done);
        },
        function(done) {
            deleteFile(req.file.path, done);
        }
    ], function done(err, results) {
        if(err) { return next(err); }

        next();
    });
}

/**
 * Lastly, create post
 *
 * If post is saved successfully, respond with newly created post.
 *
 * If there is an I/O error along the way, call next(err) to handle it
 * appropriately.
*/
module.exports.create_post = function(req, res, next) {
    var post = new Post();
    post.title = req.body.title;
    post.description = req.body.description;
    post.image.fullPicUrl = req.fullPicUrl;
    post.image.thumbnailUrl = req.thumbnailUrl;
    post.category = req.body.category;
    post.userId = req.user._id;

    return post.save().then(function(post) {
        res.json({
            entities: {
                posts: post
            }
        });
    }).catch(function(err) {
        next(err);
    });
}

/**
 * Verify the authenticated user, and post exist in DB before
 * proceeding to delete post.
 *
 * If no user is authenticated, respond with 401.
 *
 * Throw an error if req.user._id or req.body.postId is not a string representing
 * a 12 byte hex number.
 *
 * Respond with 404 if one, or both docs are null.
 *
 * Find user with req.user._id.
 * If no user is found (null), respond with 404.
 *
 * Set req.user and req.post to found docs, and pass control flow to next
 * middleware in the chain.
 *
 * If there is an I/O error along the way, call next(err) to handle it
 * appropriately.
*/
module.exports.verify_docs = function(req, res, next) {
    if(req.user) {
        var userId = req.user._id; // String
        var postId = req.body.postId; // String

        var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

        if(!checkForHexRegExp.test(userId) || !checkForHexRegExp.test(postId)) {
            throw new Error('Bad parameters.');
        }

        var promises = [
            Post.findById(postId).exec(),
            User.findById(userId).exec()
        ];

        return Promise.all(promises).then(function(results) {
            var nullDoc = false;
            for(var i = 0; i < results.length; i++) {
                if(results[i] === null) {
                    nullDoc = true;
                    break;
                }

                if(results[i].constructor.modelName === 'Post') {
                    req.post = results[i];
                }

                req.user = results[i];
            }

            if(nullDoc) {
                return res.status(404).json({
                    message: 'User and/or Post not found.'
                });
            }

            next();
        }).catch(function(err) {
            next(err);
        });
    } else {
        res.status(401).json({
            message: 'Please authenticate.'
        });
    }
}

/**
 * Verify post._id is among user.posts.
 *
 * If it is not, respond with 403.
 *
 * Remove post from user.posts, and save user.
 *
 * Once user has been saved, remove post, and respond with the removed post's id.
 *
 * If there is an I/O error along the way, call next(err) to handle it
 * appropriately.
*/
module.exports.delete_post = function(req, res, next) {
    var user = req.user;
    var post = req.post;

    var index = user.posts.indexOf(post._id);

    // Removal from user.
    // post.remove() mid does not handle user removal.
    if(index === -1) {
        return res.status(403).json({
            message: 'You are not authorized to perform this operation.'
        });
    }

    user.posts.splice(index, 1);
    return user.save().then(function() {
        return post.remove();
    }).then(function() {
        res.json({
            message: 'Post successfully deleted.',
            postId: post._id
        });
    }).catch(function(err) {
        next(err);
    });
}

/**
 * Gets a post.
 *
 * Throws an Error if req.params.postId is not a string representing a 12 byte
 * hex number.
 *
 * Finds a post with req.params.postId.
 * Responds with 404 if null is returned.
 *
 * Responds with post.
 *
 * If there is an I/O error along the way, call next(err) to handle it
 * appropriately.
*/
module.exports.get_post = function(req, res, next) {
    // Client will request post, and after post is received,
    // comments will be requested.
    var postId = req.params.postId; // String

    var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

    if(!checkForHexRegExp.test(postId)) {
        throw new Error('Bad parameters.');
    }

    return Post.findById(postId).exec().then(function(post) {
        if(post === null) {
            return res.status(404).json({
                message: 'Post not found.'
            });
        }

        res.json({
            entities: {
                posts: post
            }
        });
    }).catch(function(err) {
        next(err);
    });
}

/**
 * Gets a post's comments.
 *
 * Throw an Error if req.params.postId is not a string representing a 12 byte
 * hex number.
 *
 * Find post and populate the first 20 comments, and each comment's user.
 *
 * If post is null, respond with 404.
 *
 * Respond only with comments where userId is not null.
 *
 * If there is an I/O error along the way, call next(err) to handle it
 * appropriately.
*/
module.exports.get_post_comments = function(req, res, next) {
    var postId = req.params.postId; // String

    var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

    if(!checkForHexRegExp.test(postId)) {
        throw new Error('postId provided is not an instance of ObjectId.');
    }

    // Maybe a cursor for streaming would work better here?
    return Post.findById(postId).populate({
        path: 'comments',
        options: { limit: 20 },
        populate: {
            path: 'userId',
            select: 'username miniProfilePic _id'
        }
    }).exec().then(function(post) {
        if(post === null) {
            return res.status(404).json({
                message: 'Post not found.'
            });
        }

        var comments = post.comments;
        var postComms = [];
        comments.forEach(function(comm) {
            if(comm.userId !== null) {
                postComms.push(comm);
            }
        });

        res.json({
            entities: {
                comments: postComms
            }
        });
    }).catch(function(err) {
        next(err);
    });
}

/**
 * Gets more posts starting at minId.
 *
 * Throw an Error if req.params.postId or req.params.minId is not a string
 * representing a 12 byte hex number.
 *
 * Find a post with req.params.postId and populate the next 20 comments (along
 * with its respective user) beginning at req.params.minId.
 *
 * If post returned is null, respond with 404.
 *
 * Respond only with comments where userId is not null.
 *
 * If there is an I/O error along the way, call next(err) to handle it
 * appropriately.
*/
module.exports.get_more_comments = function(req, res, next) {
    var postId = req.params.postId;
    var minId = req.params.minId;

    return Post.findById(postId).exec().then(function(post) {
        if(post === null) {
            return res.status(404).json({
                message: 'Post not found.'
            });
        }

        // What if this is -1?
        var toSkip = post.comments.indexOf(mongoose.Types.ObjectId(minId));
        return post.populate({
            path: 'comments',
            options: {
                limit: 20,
                skip: toSkip
            },
            populate: {
                path: 'userId',
                select: 'username profilePic _id -admin -password'
            }
        }).execPopulate();
    }).then(function(popPost) {
        var postComms = [];

        // Does this include only populated comments?
        var comms = popPost.comments;
        comms.forEach(function(comment) {
            if(comment.userId !== null) {
                postComms.push(comment);
            }
        });

        res.json({
            entities: {
                comments: postComms
            }
        });
    }).catch(function(err) {
        next(err);
    });
}