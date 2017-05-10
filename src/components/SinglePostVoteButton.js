import React, { Component, PropTypes } from 'react'

export default class SinglePostVoteButton extends Component {
	render() {
		const { currentUser, post, createVote } = this.props
		const postId = post.id
		const userId = currentUser.id

		return (
			<div>
				<span>
					<button type="button" className="btn btn-default" onClick={createVote(postId, userId)}>
						Vote
					</button>
				</span>
			</div>
		)
	}
}

SinglePostVoteButton.propTypes = {

}