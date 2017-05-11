import React, { Component, PropTypes } from 'react'

export default class FollowButton extends Component {
    render() {
        const { follow, currentUser, profileUser } = this.props
        const followerId = currentUser.id
        const followedId = profileUser.id

        return (
            <div>
                <span>
                    <button type="button" className="btn btn-default" onClick={follow(followerId, followedId)}>
                        Follow
                    </button>
                </span>
            </div>
        )
    }
}

FollowButton.propTypes = {

}