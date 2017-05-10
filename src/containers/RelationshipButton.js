import React, { Component, PropTypes } from 'react'
import NoSessionFollowButton from '../components/NoSessionFollowButton'
import FollowButton from '../components/FollowButton'
import UnfollowButton from '../components/UnfollowButton'

export default class RelationshipButton extends Component {
	render() {
		const { profileUser, currentUser, toggleModal, 
						follow, unfollow, relationshipExists } = this.props
		return (
			// How are we incorporating the case when the profile user is
			// the user in session?
			// No button should be available.
			<div>
				{
					!currentUser && 
					<NoSessionFollowButton toggleModal={toggleModal} />
				}

				{
					currentUser && !relationshipExists &&
					<FollowButton 
						follow={follow} 
						currentUser={currentUser}
						profileUser={profileUser} />
				}

				{
					currentUser && relationshipExists &&
					<UnfollowButton unfollow={unfollow} relationshipExists={relationshipExists} />
				}

				// Not quite sure this is the best approach.
				{
					(currentUser.id === profileUser.id) && 
					<div></div>
				}
			</div>
		)
	}
}