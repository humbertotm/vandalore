// Require User model.
var User         = require('../models/userModel');

// Require mongoose and set mongoose.Promise to Bluebird.
var mongoose     = require('mongoose');
var Promise      = require('bluebird');
mongoose.Promise = Promise;

// Require necessary npm modules.
var fs           = require('fs'),
    gm           = require('gm'),
    parallel     = require('async/parallel'),
    aws          = require('aws-sdk');

// Require hashPassword util function.
var hashPassword = require('../utils').hashPassword;

// Load aws access, and secret keys.
// aws.config.loadFromPath('../../AWS/aws-config.json');

/**
 * All these functions are middlewares to be employed as middlewares for
 * /votes routes.
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
 * If no user is authenicated, respond with 401.
 *
 * Throw an Error if if req.user._id or req.body._id is not a string
 * representing a 12 byte hex string.
 *
 * Find user by req.body._id.
 * Respond with 404 if user returned is null.
 *
 * If user._id matches req.user._id, remove user and respond with 200.
 *
 * If it does not match, respond with 403.
 *
 * If there is an I/O error along the way, call next(err) to handle it
 * appropriately.
*/
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

            res.status(403).json({
                message: 'You are not authorized to perform this operation.'
            });
        }).catch(function(err) {
            next(err);
        });
    }

    res.status(401).json({
        message: 'Please authenticate.'
    });
}

/**
 * This function verifies the user associated to the soon-to-be deleted
 * document in the database before proceeding to delete it.
 *
 * If there is no authenticated user (!req.user), respond with 401.
 *
 * If there is an authenticated user (req.user as set by previous expressJWT
 * middleware):
 *
 * Throw an Error if req.user._id or req.body._id is not a string representing
 * a 12 byte hex number.
 *
 * Find user.
 * If user returned is null (do not exist in the DB), respond with 404.
 *
 * If it is found, and user._id matches req.user._id, set req.user and call next().
 * If it does not, respond with 403.
 *
 * If there is an I/O error along the way, call next(err) to handle it
 * appropriately.
*/
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
        if(err) {
            console.log('Error in image versioning.');
            return next(err);
        }

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
 * Updates a user's profile pic.
 *
 * Set user.profilePic.fullPicUrl and user.profilePic.thumbnailUrl, and save.
 *
 * Respond with updated user.
 *
 * If there is an I/O error along the way, call next(err) to handle it
 * appropriately.
*/
module.exports.update_profile_pic = function(req, res, next) {
    var user = req.user;
    user.profilePic.fullPicUrl = req.fullPicUrl;
    user.profilePic.thumbnailUrl = req.thumbnailUrl;

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

/**
 * Respond with 401 if there is no authenticated user.
 *
 * If req.user._id or req.body._id is not a string representing a 12 byte
 * hex number, throw an Error.
 *
 * Find user by req.body._id.
 * If user returned is null, respond with 404.
 * If user._id matches req.user._id, update user.username and/or user.bio and save.
 * Respond with updated user.
 *
 * If it does not match, respond with 403.
 *
 * If there is an I/O error along the way, call next(err) to handle it
 * appropriately.
*/
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

/**
 * Respond with 401 if there is no authenticated user.
 *
 * If req.user._id or req.body._id is not a string representing a 12 byte
 * hex number, throw an Error.
 *
 * Find user by req.body._id.
 * If user returned is null, respond with 404.
 *
 * If req.user._id matches req.body._id:
 * If user has local credentials:
 * If user._id matches req.user._id, update user.local.email and save.
 * Respond with updated user.
 *
 * If user has no local credentials, respond with 403.
 * If ids do not match, respond with 403.
 *
 * If there is an I/O error along the way, call next(err) to handle it
 * appropriately.
*/
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

/**
 * Respond with 401 if there is no authenticated user.
 *
 * If req.user._id or req.body._id is not a string representing a 12 byte
 * hex number, throw an Error.
 *
 * Find user by req.body._id.
 * If user returned is null, respond with 404.
 *
 * If user._id matches req.user._id:
 * If user has local credentials, and req.body.password and req.body.passwordConf
 * match: Respond with updated user.
 *
 * If user has no local credentials, respond with 403.
 * If ids do not match, respond with 403.
 *
 * If there is an I/O error along the way, call next(err) to handle it
 * appropriately.
*/
module.exports.update_user_password = function(req, res) {
    if(req.user) {
        var authUserId = req.user._id;
        var userId = req.body.userId;

        var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

        if(!(checkForHexRegExp.test(authUserId) && checkForHexRegExp.test(userId))) {
            throw new Error('authUserId and/or userId provided is not an instance of ObjectId.');
        }

        return User.findById(userId).exec().then(function(user) {
            if(user === null) {
                return res.status(404).json({
                    message: 'User not found.'
                });
            }

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

/**
 * If req.params.userId is not a string representing a 12 byte hex number,
 * throw an Error.
 *
 * Find user by req.params.userId.
 * If user returned is null, respond with 404.
 *
 * Respond with found user.
 *
 * If there is an I/O error along the way, call next(err) to handle it
 * appropriately.
*/
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

/**
 * If req.params.userId is not a string representing a 12 byte hex number,
 * throw an Error.
 *
 * Find user by req.params.userId, and populate 25 posts in reverse order.
 * If user returned is null, respond with 404.
 *
 * Respond only with posts where user is not null.
 *
 * If there is an I/O error along the way, call next(err) to handle it
 * appropriately.
*/
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

module.exports.get_more_user_posts = function(req, res, next) {
    // Get more user posts.
}

/**
 * If no user is authenticated, respond with 401.
 *
 * If req.user._id is not a string representing a 12 byte hex number, throw an
 * Error.
 *
 * Find user.
 * If returned user is null, respond with 404.
 *
 * Find posts where user is in user.following, and populate user.
 * Respond only with posts where populated user is not null.
 *
 * If there is an I/O error along the way, call next(err) to handle it
 * appropriately.
*/
module.exports.get_user_feed_posts = function(req, res, next) {
    if(req.user) {
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
            }).exec();
        }).then(function(posts) {
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
        }).catch(function(err) {
            next(err);
        });
    }
     res.status(401).json({
        'Please authenticate.'
     });
}

module.exports.get_more_feed_posts = function(req, res, next) {
    // Get more feed posts.
}