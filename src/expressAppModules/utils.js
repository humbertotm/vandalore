module.exports.hashPassword = function(password, cb) {
    bcrypt.genSalt(10, function(err, salt) {
        if(err) return cb(err);

        bcrypt.hash(password, salt, function(err, hash) {
            if(err) return cb(err);

            return cb(null, hash);
        });
    });
}

module.exports.votesForHot = function() {
    return new Promise(function(resolve, reject) {
        resolve();
    });
}