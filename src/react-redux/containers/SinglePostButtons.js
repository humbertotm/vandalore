import React, { Component, PropTypes } from 'react'
// import SinglePostVoteButton from '../components/SinglePostVoteButton'
// import SinglePostUnvoteButton from '../components/SinglePostUnvoteButton'
// import SinglePostNoSessionButton from '../components/SinglePostNoSessionButton'

export default class SinglePostButtons extends Component {
	render() {
		const { post, currentUser, currentUserVoteExists,
	 					createVote, deleteVote, toggleModal } = this.props
		return (
			<div>
				{
					!currentUser &&
					<SinglePostNoSessionButton 
						toggleModal={toggleModal} /> 
				}

				{
					currentUser && !currentUserVoteExists &&
					<SinglePostVoteButton
						currentUser={currentUser}
						post={post}
						createVote={createVote} />
				}

				{
					currentUser && currentUserVoteExists &&
					<SinglePostUnvoteButton />
				}
			</div>
		)
	}
}

SinglePostButtons.propTypes = {

}