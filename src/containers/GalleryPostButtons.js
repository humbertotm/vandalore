import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import NoSessionButtons from '../components/NoSessionButtons'
import VoteButtons from '../components/VoteButtons'
import UnvoteButtons from '../components/UnvoteButtons'

export default class GalleryPostButtons extends Component {
	render() {
		const { currentUser, post, currentUserVoteExists, toggleModal, createVote, deleteVote } = this.props

		return (
			<div>
				{
					!currentUser &&
					<NoSessionButtons toggleModal={toggleModal} />
				}

				{
					currentUser && !currentUserVoteExists &&
					<VoteButtons 
						post={post}
						currentUser={currentUser}
						createVote={createVote} />
				}

				{
					<UnvoteButtons 
						currentUserVoteExists={currentUserVoteExists}
						deleteVote={deleteVote} />
				}
			</div>
		)
	}
}

GalleryPostButtons.PropTypes = {

}