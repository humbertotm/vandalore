// Require necessary models.
var Post         = require('../models/postModel'),
    User         = require('../models/userModel'),
    Category     = require('../../../src/expressAppModules/models/categoryModel');

var fs           = require('fs'),
    gm           = require('gm').
    parallel     = require('async/parallel'),
    aws          = require('aws-sdk');

// Require mongoose and set bluebird to handle its promises.
var mongoose     = require('mongoose');
var Promise      = require('bluebird');
mongoose.Promise = Promise;

aws.config.loadFromPath('../../AWS/aws-config.json');

// Find auth user before proceeding with post creation.
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

// Do image versioning.
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

    // Run image versioning in parallel.
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
        if(err) {
            console.log('Error in image versioning.');
            return next(err);
        }

        req.fullPicPath = fullPicPath;
        req.thumbnailPath = thumbnailPath;
        next();
    });
}

// Store images in S3 Bucket.
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

// Delete local image files.
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

// Creates and responds with a new post.
module.exports.create_post = function(req, res, next) {
    var post = new Post();
    post.title = req.body.title;
    post.description = req.body.description;
    post.image.fullPicUrl = req.fullPicUrl;
    post.image.thumbnail = req.thumbnailUrl;
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

// Verify user and post of interest exist in the DB, for delete actions.
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
        // If no authenticated user
        res.status(401).json({
            message: 'Please authenticate.'
        });
    }
}

// Deletes a post.
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

// Gets a post.
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

// Gets a post's comments.
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
            path: 'user',
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
                // This will be normalized with normalizr schemas.
                comments: postComms
            }
        });
    }).catch(function(err) {
        next(err);
    });
}