import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'

export default class PostHeader extends Component {
	render() {
		const { poster } this.props

		return (
			<div>
				<Link to="/users/:${poster.userName}">
					<span>
						<p>{poster.name}</p>
					</span>
					<span>
						<img src={poster.profilePictureUrl}/>
					</span>
				</Link>
			</div>
		)
	}
}

PostHeader.PropTypes = {

}