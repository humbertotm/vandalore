import React, { Component, PropTypes } from 'react'

export default class CommentFormCounter extends Component {
	render() {
		const { value } = this.props
		return (
			<div>
				<p>{value}</p>
			</div>
		)
	}
}