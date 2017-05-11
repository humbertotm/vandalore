import React, { Component, PropTypes } from 'react'

export default class SinglePostNoSessionButton extends Component {
	render() {
		const { toggleModal } = this.props

		return (
			<div>
				<span>
					<button type="button" className="btn btn-default" onClick={toggleModal('logInForm')}>
						Vote
					</button>
				</span>
			</div>
		)
	}
}

SinglePostNoSessionButton.propTypes = {
	
}