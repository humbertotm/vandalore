import React, { Component, PropTypes } from 'react'

export default class ProfileHeader extends Component {

    render() {
        const { profileUser, currentUser, toggleModal,
                        follow, unfollow, relationshipExists } = this.props
        return (
            <div>
                <img src={user.profilePic.url} />
                <p>{profileUser.bio}</p>
                <span>
                    <p>{profileUser.followersCount} followers</p>
                </span>
                <span>
                    <p>{profileUser.followingCount} followed</p>
                </span>
                <RelationshipButton
                    toggleModal={toggleModal}
                    follow={follow}
                    unfollow={unfollow}
                    profileUser={profileUser}
                    currentUser={currentUser}
                    relationshipExists={relationshipExists} />
            </div>
        )
    }
}

ProfileHeader.PropTypes = {

}


