import React, { Component, PropTypes } from 'react'
import ProfileHeader from '../components/ProfileHeader'
import ProfileUserPosts from '../components/ProfileUserPosts'
import ProfileUserVotedPosts from '../components/ProfileUserVotedPosts'

class Profile extends Component {
    constructor(props) {
        this.toggleModal = this.toggleModal.bind(this)
        this.follow = this.follow.bind(this)
        this.unfollow = this.unfollow.bind(this)
        this.relationshipExists = this.relationshipExists.bind(this)
    }

    componentDidMount() {
        // Fire an api call to find a relationship between profileUser and currentUser
    }

    relationshipExists() {
        const { relationships, currentUser, users } = this.props
        const profileUser = users.idInUrl
        const followedId = profileUser.id
        // Call a function that will search among entities.relationships
        // for one with followerId === currentUser.id && followedId === profileUser.id
        if(!currentUser) {
            return null
        }

        findRelationshipOfInterest(followerdId, followedId)
    }

    toggleModal(modal) {
        const { toggleModal } = this.props
        toggleModal(modal)
    }

    follow(followerId, followedId) {
        const { follow } = this.props
        follow(followerId, followedId)
    }

    unfollow(relationshipId) {
        const { unfollow } = this.props
        unfollow(relationshipId)
    }

    render() {
        const { users, currentUser } = this.props
        // Extract profile user from users through the id in the url.
        const profileUser = users.idInUrl

        return (
            <div>
                <ProfileHeader
                    profileUser={profileUser}
                    currentUser={currentUser}
                    toggleModal={this.toggleModal}
                    follow={this.follow}
                    unfollow={this.unfollow}
                    relationshipExists={this.relationshipExists} />
                <ProfileUserPosts user={user} />
                <ProfileUserVotedPosts user={user} />
            </div>
        )
    }
}

Profile.PropTypes = {

}

mapStateToProps = state => {
    // users: state.entities.users,
    // relationships: state.entities.relationships,
    // currentUser: state.currentUser
}

mapDispatchToProps = dispatch => {
    // toggleModal: dispatch(toggleModal),
    // follow: dispatch(follow),
    // unfollow: dispatch(unfollow)
}

export default connect(mapStateToProps)(mapDispatchToProps)(Profile)