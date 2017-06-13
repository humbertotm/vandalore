// Require User model.
var User         = require('../models/userModel');

// Require mongoose and set bluebird to handle its promises.
var mongoose     = require('mongoose');
var Promise      = require('bluebird');
mongoose.Promise = Promise;

// Require hashPassword util function.
var hashPassword = require('../utils').hashPassword;

module.exports.delete_user = function(req, res, next) {
    if(req.user) {
        var authUserId = req.user._id; // String
        var userId = req.body._id;  // String

        var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

        if(!checkForHexRegExp.test(authUserId) || !checkForHexRegExp.test(userId)) {
            throw new Error('authUserId and/or userId provided is not an instance of ObjectId.');
        }

        return User.findById(userId).exec().then(function(user) {
            if(user === null) {
                return res.status(404).json({
                    message: 'User not found.'
                });
            }

            if(user._id.toString() === authUserId) {
                return user.remove().then(function() {
                    res.status(200).json({
                        message: 'User successfully deleted.',
                        user: userId
                    });
                });
            }

            // If authenticated user does not match owner of user doc.
            res.status(403).json({
                message: 'You are not authorized to perform this operation.'
            });
        }).catch(function(err) {
            next(err);
        });
    }

    // If no authenticated user
    res.status(401).json({
        message: 'Please authenticate.'
    });
}

// Verify user exists before updating profile pic.
module.exports.verify_user = function(req, res, next) {
    if(req.user) {
        var authUserId = req.user._id;
        var userId = req.body._id;

        var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

        if(!checkForHexRegExp.test(authUserId) || !checkForHexRegExp.test(userId)) {
            throw new Error('authUserId and/or userId provided is not an instance of ObjectId.');
        }

        return User.findById(userId).exec().then(function(user) {
            if(user === null) {
                return res.status(404).json({
                    message: 'User not found.'
                });
            }

            if(user._id.toString() === authUserId) {
                req.user = user;
                return next();
            } else {
                res.status(403).json({
                    message: 'You are not authorized to perform this operation.'
                });
            }
        }).catch(function(err) {
            next(err);
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

module.exports.update_profile_pic = function(req, res, next) {
    var user = req.user;
    user.profilePic.fullPicUrl = req.fullPicUrl;
    user.profilePic.thumbnail = req.thumbnailUrl;

    return user.save().then(function(user) {
        res.json({
            entities: {
                users: user
            }
        });
    }).catch(function(err) {
        next(err);
    });
}


module.exports.update_user_profile = function(req, res) {
    if(req.user) {
        var authUserId = req.user._id;
        var userId = req.body._id;

        var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

        if(!checkForHexRegExp.test(authUserId) || !checkForHexRegExp.test(userId)) {
            throw new Error('authUserId and/or userId provided is not an instance of ObjectId.');
        }

        return User.findById(userId).exec().then(function(user) {
            if(user === null) {
                res.status(404).json({
                    message: 'User not found.'
                });
            }

            if(user._id.toString() === authUserId) {
                user.username === req.body.username || user.username;
                user.bio === req.body.bio || user.bio;

                return user.save().then(function(updatedUser) {
                    res.json({
                        message: 'Profile successfully updated!',
                        entities: {
                            users: updatedUser
                        }
                    });
                });
            } else {
                // If authenticated user does not match owner of user doc.
                res.status(403).json({
                    message: 'You are not authorized to perform this operation.'
                });
            }
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

module.exports.update_user_local_email = function(req, res) {
    if(req.user) {
        var authUserId = req.user._id;  // String
        var userId = req.body._id;  // String

        var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

        if(!checkForHexRegExp.test(authUserId) || !checkForHexRegExp.test(userId)) {
            throw new Error('authUserId and/or userId provided is not an instance of ObjectId.');
        }

        return User.findById(userId).exec().then(function(user) {
            if(user === null) {
                res.status(404).json({
                    message: 'User not found.'
                });
            }

            if(user._id.toString() === authUserId) {
                if(user.local) {
                    user.local.email = req.body.email || user.local.email;
                    return user.save().then(function(updatedUser) {
                        res.json({
                            message: 'Email successfully updated.',
                            user: updatedUser
                        });
                    });
                } else {
                    // If user has no local credentials
                    res.status(403).json({
                        message: 'You have not set any local credentials.'
                    });
                }
            } else {
                // If authenticated user does not match owner of user doc.
                res.status(403).json({
                    message: 'You are not authorized to perform this operation.'
                });
            }
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

module.exports.update_user_password = function(req, res) {
    if(req.user) {
        var authUserId = req.user._id;
        var userId = req.body.userId;

        var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

        if(!(checkForHexRegExp.test(authUserId) && checkForHexRegExp.test(userId))) {
            throw new Error('authUserId and/or userId provided is not an instance of ObjectId.');
        }

        return User.findById(userId).exec().then(function(user) {
            if(user._id.toString() === authUserId) {
                if(user.local && (req.body.password === req.body.passwordConfirmation)) {
                    user.password = hashPassword(password);
                    return user.save().then(function(updatedUser) {
                        // Choose fiedls.
                        res.json(updatedUser);
                    });
                }
                // If user has no local credentials
                res.status(403).json({
                    message: 'You have not set any local credentials or password/password confirmation mismatch.'
                });
            }
            // If authenticated user does not match owner of user doc.
            res.status(403).json({
                message: 'You are not authorized to perform this operation.'
            });
        }).catch(function(err) {
            next(err);
        })
    }

    // If no authenticated user
    res.status(401).json({
        message: 'Please authenticate.'
    });
}

module.exports.get_user = function(req, res) {
    var userId = req.params.userId;

    var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

    if(!checkForHexRegExp.test(userId)) {
        throw new Error('userId provided is not an instance of ObjectId.');
    }

    return User.findById(userId).exec().then(function(user) {
        if(user === null) {
            return res.status(404).json({
                message: 'User not found.'
            });
        }

        // Determine which fields will be sent.
        res.json({
            entities: {
                users: user
            }
        });
    }).catch(function(err) {
        next(err);
    });
}

module.exports.get_user_posts = function(req, res) {
    var userId = req.params.userId;

    var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

    if(!checkForHexRegExp.test(userId)) {
        throw new Error('userId provided is not an instance of ObjectId.');
    }

    // Maybe a stream would work well?
    return User.findById(userId).populate({
        path: 'posts',
        populate: {
            path: 'user',
            select: '_id username miniProfilePicUrl'
        },
        options: { limit: 25, sort: -1 }
    }).exec().then(function(user) {
        if(user === null) {
            return res.status(404).json({
                message: 'User not found.'
            });
        }

        var userPosts = [];
        var posts = user.posts;
        posts.forEach(function(post) {
            if(post.user !== null) {
                userPosts.push(post);
            }
        });

        res.json({
            entities: {
                posts: posts
            }
        });
    }).catch(function(err) {
        next(err);
    });
}

module.exports.get_user_feed_posts = function(req, res, next) {
    var authUserId = req.user._id; // String
    return User.findById(authUserId).exec().then(function(user) {
        if(user === null) {
            return res.status(404).json({
                message: 'User not found.'
            });
        }

        // Just make sure that this promise's rejection will be caught
        // by catch statement.
        // Think about streaming this response.
        return Post.find({ 'user': { $in: user.following }}).populate({
            path: 'user',
            select: '_id username miniProfilePicUrl'
        }).exec().then(function(posts) {
            var feedPosts = [];
            posts.forEach(function(post) {
                if(post.user !== null) {
                    feedPosts.push(post);
                }
            });

            res.json({
                entities: {
                    posts: feedPosts
                }
            });
        });
    }).catch(function(err) {
        next(err);
    });
}