// Require neccessary models.
var Notification = require('../models/notificationModel');
var User = require('../models/userModel');

// Require mongoose and set bluebird to handle its promises.
var  mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

// Gets notifications for a user.
module.exports.get_notifications = function(req, res) {
    if(req.user) {
        var userId = req.user._id;

        var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

        if(!checkForHexRegExp.test(userId)) {
            throw new Error('userId provided is not an instance of ObjectId.');
        }

        return User.findById(userId).populate({
            path: 'notifications',
            options: { limit: 5 }
        }).exec().then(function(user) {
            if(user === null) {
                res.status(404).json({
                    message: 'User not found.'
                });
            }

            var notifications = user.notifications;
            res.json(notifications);
        })
        .catch(function(err) {
            next(err);
        });
    } else {
        // If no user is authenticated
        res.status(401).json({
            message: 'Please authenticate.'
        });
    }
}

// Updates notification.read.
module.exports.mark_notification_as_read = function(req, res) {
    if(req.user) {
        var authUserId = req.user._id;
        var notificationId = req.body.notification._id;

        var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

        if(!(checkForHexRegExp.test(authUserId) && checkForHexRegExp.test(notificationId))) {
            throw new Error('authUserId and/or notificationId provided is not an instance of ObjectId.');
        }

        return Notification.findById(notificationId).exec().then(function(notification) {
            if(notification === null) {
                res.status(404).json({
                    message: 'Notification not found.'
                });
            }

            if(notification.userId === authUserId) {
                notification.read = true;
                return notification.save().then(function(notif) {
                    res.json(notif);
                });
            } else {
                // If authenticated user does not match notification owner
                res.status(403).json({
                    message: 'You are not authorized to perform this operation.'
                });
            }
        })
        .catch(function(err) {
            next(err);
        });
    } else {
        // If no user is authenticated
        res.status(401).json({
            message: 'Please authenticate.'
        });
    }
}