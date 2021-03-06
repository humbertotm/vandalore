
/*
// Decomissioned middleware. Substituted by the function below.
// Creates a new vote and sends it in response.
module.exports.create_vote = function(req, res, next) {
    if(req.user) {
        var userId = req.user._id; // String
        var postId = req.body.postId; // String

        var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

        if(!checkForHexRegExp.test(userId) || !checkForHexRegExp.test(postId)) {
            throw new Error('Bad parameters.');
        }

        var vote = new Vote();
        vote.userId = userId;
        vote.postId = postId;

        return vote.save().then(function(createdVote) {
            res.json(createdVote);
            req.vote = createdVote;
            next();
        })
        .catch(function(err) {
            next(err);
        });
    } else {
        // If no authenticated user
        res.status(401).json({
            message: 'Please authenticate.'
        });
    }
}
*/

/*
// Pushes newly created vote into refs in user and post docs.
module.exports.push_and_save_vote = function(req, res, next) {
    var vote = req.vote;
    var userId = vote.userId; // ObjectId
    var postId = vote.postId; // ObjectId

    var promises = [
        // What if any of these return null? Will the Promise reject?
        User.findById(userId).exec(),
        Post.findById(postId).exec()
    ];

    var promisedDocs = Promise.all(promises);

    function pushAndSave(doc) {
        doc.votes.push(vote);
        return doc.save();
    }

    function passPostToNext(doc) {
        if(doc.constructor.modelName === 'Post') {
            req.post = doc;
            next();
        } else {
            return;
        }
    }

    return promisedDocs.then(function(docs) {
        docs.map(pushAndSave);
        docs.map(passPostToNext);
    })
    .catch(function(err) {
        err.logToConsole = true;
        next(err);
    });
}

// Checks the vote count for post to verify if there is
// a need to create a notification.
module.exports.check_vote_count = function(req, res, next) {
    var post = req.post;
    var voteCount = post.votes.length;

    if(voteCount > votesForHot()) {
        var notification = new Notification();
        notification.userId = post.userId;
        notification.postId = post._id;
        notification.message = 'Your post has reached the Hot Page!';

        return notification.save().then(function(notification) {
            req.notification = notification;
            next();
        })
        .catch(function(err) {
            err.logToConsole = true;
            next(err);
        });
    } else {
        return;
    }
}

// Pushes and saves newly created notification to corresponding user.
module.exports.push_and_save_notification = function(req, res, next) {
    var notification = req.notification;
    var userId = notification.userId; // ObjectId

    return User.findById(userId).exec().then(function(user) {
        if(user === null) {
            // What do we do here? This is middleware.
        }

        user.notifications.push(notification);
        return user.save();
    })
    .catch(function(err) {
        err.logToConsole = true;
        next(err);
    });
}
*/

/*
// Pushes and saves new post in corresponding user and category ref.
// Will be substituted by post('save') hook.
module.exports.push_and_save_post = function(req, res, next) {
    var post = req.post;
    var userId = post.userId; // ObjectId
    var categoryId = post.category; // Number

    var promises = [
        // What if any of these return null? Will the Promise reject?
        User.findById(userId).exec(),
        Category.findById(categoryId).exec()
    ];

    var promisedDocs = Promise.all(promises);

    function pushAndSave(doc) {
        doc.posts.push(post);
        return doc.save();
    }

    return promisedDocs.then(function(docs) {
        docs.map(pushAndSave);
    })
    .catch(function(err) {
        // Send this to error handling middleware.
        err.logToConsole = true;
        next(err);
    });
}
*/


        /*
        var relationship = new Relationship();
        relationship.followerId = authUserId;
        relationship.followedId = followedId;

        return relationship.save().then(function(createdRel) {
            res.json(createdRel);
            req.relationship = createdRel;
            next();
        })
        .catch(function(err) {
            next(err);
        });
        */



/*
// Will be substituted by post('save') hook.
// Pushes and saves newly created relationship into
// follower.following and followed.followers.
module.exports.push_and_save_rel = function(req, res, next) {
    var rel = req.relationship;
    var followerId = rel.followerId; // ObjectId
    var followedId = rel.followedId; // ObjectId

    var promises = [
        // What if any of these returns null? Will the Promise reject?
        User.findById(followerId).exec(),
        User.findById(followedId).exec()
    ];

    var promisedDocs = Promise.all(promises);

    function pushIntoFollowingAndFollowers(doc) {
        if(doc._id === followerId) {
            doc.following.push(followedId);
            return doc.save();
        } else {
            doc.followers.push(followerId);
            return doc.save();
        }
    }

    return promisedDocs.then(function(docs) {
        docs.map(pushIntoFollowingAndFollowers);
    })
    .catch(function(err) {
        err.logToConsole = true;
        next(err);
    });
}
*/


/*
        return Relationship.findById(relationshipId).exec().then(function(rel) {
            if(rel === null) {
                res.status(404).json({
                    message: 'Relationship not found.'
                });
            }

            if(rel.followerId.toString() === authUserId) {
                return rel.remove().then(function() {
                    res.status(200).json({
                        message: 'Relationship successfully deleted.',
                        relationshipId: relationshipId
                    });
                });
            } else {
                // If authenticated user does not match owner of comment doc.
                res.status(403).json({
                    message: 'You are not authorized to perform this operation.'
                });
            }
        })
        .catch(function(err) {
            next(err);
        });
        */