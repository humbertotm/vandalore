// Require User model.
var User = require('../models/usersModel');

// Require hashPassword util function.
var hashPassword = require('../utils').hashPassword;

module.exports.delete_user = function(req, res) {
    if(req.user) {
        var authUserId = req.user._id;
        var userId = req.body._id;

        var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

        if(!(checkForHexRegExp.test(authUserId) && checkForHexRegExp.test(userId))) {
            throw new Error('authUserId and/or userId provided is not an instance of ObjectId.');
        }

        User.findById(userId).exec().then(function(user) {
            if(user === null) {
                res.status(404).json({
                    message: 'User not found.'
                });
            }

            if(user._id === authUserId) {
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
        })
        .catch(function(err) {
            // Send this to error handling middleware.
            res.status(500).json(err);
        });
    }

    // If no authenticated user
    res.status(401).json({
        message: 'Please authenticate.'
    });
}

module.exports.update_user_profile = function(req, res) {
    if(req.user) {
        var authUserId = req.user._id;
        var userId = req.body._id;

        var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

        if(!(checkForHexRegExp.test(authUserId) && checkForHexRegExp.test(userId))) {
            throw new Error('authUserId and/or userId provided is not an instance of ObjectId.');
        }

        User.findById(userId).exec().then(function(user) {
            if(user === null) {
                res.status(404).json({
                    message: 'User not found.'
                });
            }

            if(user._id === authUserId) {
                user.username === req.body.username || user.username;
                user.profilePicUrl === req.file.location || user.profilePicUrl;
                user.bio === req.body.bio || user.bio;

                return user.save().then(function(updatedUser) {
                    res.json({
                        message: 'Profile successfully updated!',
                        user: updatedUser
                    });
                });
            } else {
                // If authenticated user does not match owner of user doc.
                res.status(403).json({
                    message: 'You are not authorized to perform this operation.'
                });
            }
        })
        .catch(function(err) {
            // Send this to error handling middleware.
            res.status(500).json(err);
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
        var authUserId = req.user._id;
        var userId = req.body._id;

        var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

        if(!(checkForHexRegExp.test(authUserId) && checkForHexRegExp.test(userId))) {
            throw new Error('authUserId and/or userId provided is not an instance of ObjectId.');
        }

        User.findById(userId).exec().then(function(user) {
            if(user === null) {
                res.status(404).json({
                    message: 'User not found.'
                });
            }

            if(user._id === authUserId) {
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
        })
        .catch(function(err) {
            // Send this to error handling middleware.
            res.status(500).json(err);
        });
    } else {
        // If no authenticated user
        res.status(401).json({
            message: 'Please authenticate.'
        });
    }
}

// Still pending.
module.exports.update_user_password = function(req, res) {
    if(req.user) {
        var authUserId = req.user._id;
        var userId = req.body.userId;

        var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

        if(!(checkForHexRegExp.test(authUserId) && checkForHexRegExp.test(userId))) {
            throw new Error('authUserId and/or userId provided is not an instance of ObjectId.');
        }

        User.findById(userId).exec().then(function(user) {
            if(user._id === authUserId) {
                if(user.local) {
                    if(req.body.password && req.body.passwordConfirmation) {
                        if(req.body.password === req.body.passwordConfirmation) {
                            user.password === hashPassword(req.body.password, /* cb */);
                            user.save().then(function(updatedUser) {
                                res.status(200).json({
                                    message: 'Password successfully updated.'
                                });
                            });
                        }
                        // Handle password and passwordConfirmation not matching.
                    }
                    // Handle password or passwordConfirmation missing.
                }

                // If user has no local credentials
                res.status(403).json({
                    message: 'You have not set any local credentials.'
                });
            }

            // If authenticated user does not match owner of user doc.
            res.status(403).json({
                message: 'You are not authorized to perform this operation.'
            });
        })
        .catch(function(err) {
            res.json(err);
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

    User.findById(userId).exec().then(function(user) {
        if(user === null) {
            res.status(404).json({
                message: 'User not found.'
            });
        }

        res.json(user);
    })
    .catch(function(err) {
        // Send this to error handling middleware.
        res.status(500).json(err);
    });
}

module.exports.get_user_votes = function(req, res) {
    if(req.user) {
        var authUserId = req.user._id;

        var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

        if(!checkForHexRegExp.test(authUserId)) {
            throw new Error('authUserId provided is not an instance of ObjectId.');
        }

        User.findById(authUserId).populate({
            path: 'votes'
            // options: { limit: 100 }
        }).exec().then(function(user) {
            if(user === null) {
                res.status(404).json({
                    message: 'User not found.'
                });
            }

            res.json(user.votes);
        })
        .catch(function(err) {
            // Send this to error handling middleware.
            res.status(500).json(err);
        });
    } else {
        // If no authenticated user
        res.status(401).json({
            message: 'Please authenticate.'
        });
    }
}

module.exports.get_user_posts = function(req, res) {
    var userId = req.params.userId;

    var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

    if(!checkForHexRegExp.test(userId)) {
        throw new Error('userId provided is not an instance of ObjectId.');
    }

    User.findById(userId).populate({
        path: 'posts',
        options: { limit: 100 }
    }).exec().then(function(user) {
        if(user === null) {
            res.status(404).json({
                message: 'User not found.'
            });
        }

        res.json(user.posts);
    })
    .catch(function(err) {
        // Send this to error handling middleware.
        res.status(500).json(err);
    });
}

module.exports.get_user_feed_posts = function(req, res) {
    /*
        ***
            This is a more complex piece of code.
            Will get back to it later.
        ***
    */
}