import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'

export default class NoSessionButtons extends Component {
	// constructor(props) {
	// 	this.handleToggleModal = this.handleToggleModal.bind(this)
	// }

	// handleToggleModal(modal) {
	// 	const { toggleModal } = this.props
	// 	toggleModal(modal)
	// }

	render() {
		const { toggleModal } = this.props

		return (
			<div>
				<span>
					<button type="button" className="btn btn-default" onClick={toggleModal('logInForm')}>
						Vote
					</button>
				</span>
				<span>
					<button type="button" className="btn btn-default" onClick={toggleModal('logInForm')}>
						Comment
					</button>
				</span>
			</div>
		)
	}
}

NoSessionButtons.PropTypes = {

}