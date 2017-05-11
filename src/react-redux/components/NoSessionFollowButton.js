import React, { Component, PropTypes } from 'react'

export default class NoSessionFollowButton extends Component {
	render() {
		const { toggleModal } = this.props

		return (
			<div>
				<span>
					<button type="button" className="btn btn-default" onClick={toggleModal('logInForm')}> 
						Follow
					</button>
				</span>
			</div>
		)
	}
}