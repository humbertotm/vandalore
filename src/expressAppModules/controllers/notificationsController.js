// Require neccessary models.
var Notification = require('../models/notificationModel'),
    User         = require('../models/userModel');

// Require mongoose and set mongoose.Promise to Bluebird.
var mongoose     = require('mongoose');
var Promise      = require('bluebird');
mongoose.Promise = Promise;

/**
 * All these functions are middlewares to be employed as middlewares for
 * /notifications routes.
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
 * Responds with 401 if no user is authenticated.
 *
 * Throws an Error if req.user._id is not a string representing a 12 byte hex
 * number.
 *
 * Finds user and populates its last 5 notifications.
 * If user is null, responds with 404.
 *
 * Respond with notifications.
 *
 * If there is an I/O error along the way, call next(err) to handle it
 * appropriately.
*/
module.exports.get_notifications = function(req, res, next) {
    if(req.user) {
        var userId = req.user._id; // String

        var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

        if(!checkForHexRegExp.test(userId)) {
            throw new Error('Bad params.');
        }

        // Maybe a cursor for streaming would work better?
        return User.findById(userId).populate({
            path: 'notifications',
            select: '-userId',
            options: { limit: 5, sort: -1 }
        }).exec().then(function(user) {
            if(user === null) {
                return res.status(404).json({
                    message: 'User not found.'
                });
            }

            var notifications = user.notifications;
            res.json({
                entities: {
                    notifications: notifications
                }
            });
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
 * Responds with 401 if no user is authenticated.
 *
 * Find notification with id provided in req.body._id.
 *
 * If no notification is found, respond with 404.
 *
 * If there is an authenticated user but it does not match the notification's
 * user, respond with 403.
 *
 * Update notification.read to true, and save notification.
 *
 * If there is an I/O error along the way, call next(err) to handle it
 * appropriately.
*/
module.exports.mark_notification_as_read = function(req, res, next) {
    if(req.user) {
        var authUserId = req.user._id; // String
        var notificationId = req.body._id; // String

        var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

        if(!checkForHexRegExp.test(authUserId) || !checkForHexRegExp.test(notificationId)) {
            throw new Error('authUserId and/or notificationId provided is not an instance of ObjectId.');
        }

        return Notification.findById(notificationId).exec().then(function(notification) {
            if(notification === null) {
                return res.status(404).json({
                    message: 'Notification not found.'
                });
            }

            if(notification.userId.toString() === authUserId) {
                notification.read = true;
                return notification.save().then(function(noti) {
                    res.json({
                        notificationId: noti._id
                    })
                });
            }

            res.status(403).json({
                message: 'You are not authorized to perform this operation.'
            });
        }).catch(function(err) {
            next(err);
        });
    } else {
        res.status(401).json({
            message: 'Please authenticate.'
        });
    }
}