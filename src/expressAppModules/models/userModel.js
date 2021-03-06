var mongoose     = require('mongoose');
mongoose.Promise = require('bluebird');

var Schema       = mongoose.Schema;

var bcrypt       = require('bcryptjs');

var userMid      = require('./docMiddleware/userMid');

var userSchema = new Schema({
    local: {
        email: {
            type: String,
            validate: {
                validator: function(v) {
                    // Provisional regEx. Not definitive solution.
                    var re =  /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    return re.test(v);
                },
                message: '{VALUE} is not a valid email address.'
            },
            index: true,
            unique: true
        },

        password: {
            type: String,
            required: function() {
                if(this.local.email) {
                    return true;
                } else return false;
            }
        }
    },

    facebook: {
        id: {
            type: String,
            index: true,
            unique: true
        },
        token: String,
        email: String,
        displayName: String,
        profilePicUrl: String
    },

    google: {
        id: {
            type: String,
            index: true,
            unique: true
        },
        token: String,
        email: String,
        name: String,
        profilePicUrl: String
    },

    username: {
        type: String,
        required: true,
        maxlength: [56, 'Username is too long.'],
        index: true
    },

    bio: {
        type: String,
        maxlength: 500
    },

    profilePic: {
        fullPicUrl: {
            type: String,
            default: 'default-pic-url',
            required: true
        },
        thumbnail: {
            type: String,
            default: 'default-thumbnail-url',
            required: true
        }
    },

    // Has confirmed its email address
    activated: {
        type: Boolean,
        default: false,
        required: true
    },

    admin : {
        type: Boolean,
        default: false,
        required: true
    },

    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'Post',
        default: []
    }],

    votedPosts: [{
        type: Schema.Types.ObjectId,
        ref: 'Post',
        default: []
    }],

    /*
    votes: [{
        type: Schema.Types.ObjectId,
        ref: 'Vote',
        default: []
    }],
    */

    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment',
        default: []
    }],

    following: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: [],
        required: true
    }],

    /*
    activeRelationships: [{
        type: Schema.Types.ObjectId,
        ref: 'Relationship',
        default: []
    }],
    */

    followers: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: [],
        required: true
    }],

    /*
    passiveRelationships: [{
        type: Schema.Types.ObjectId,
        ref: 'Relationship',
        default: []
    }],
    */

    notifications: [{
        type: Schema.Types.ObjectId,
        ref: 'Notification',
        default: []
    }],

    postRemoveHookEnabled: {
        type: Boolean,
        default: true,
        required: false
    }
},
{
    timestamps: true
});

// method to hash password

userSchema.post('remove', userMid.postRemove);

module.exports = mongoose.model('User', userSchema);

/*
    *** IMPORTANT LOGIC TO MODEL ***

    * If user logs in with google or fb, activated is set to true upon
        user doc creation.

    * If user signs up locally, activated is set to false upon
        user doc creation.

    * If a user logged in socially, and connects local credentials,
        activated should be set to true upon creds submission.

    * Instance method to hash password before saving it to db.

    * Username: ONLY ONE USERNAME VISIBLE AT A TIME (usernames from
        social accounts, and local account can be different).
        THIS IS THE ONE THAT WILL BE INDEXED AND USED TO SEARCH FOR
        USERS BY USERNAME.

    * There can be no different users sharing the same social account id.

    * There can be no different users sharing the same local email.

    * Local creds email must be validated with a regEx before saving it.

*/
