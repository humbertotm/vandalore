import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'

export default class GeneralGalleryPostContent extends Component {
	render() {
		const { post } = this.props

		return (
			<div>
				<Link to="/posts/${post.id}" /* from "/posts/:id" */>
					<h4>{post.title}</h4>
					<img src={post.content.url}/>
				</Link>
				<div id="post-stats">
					<p>
						<span>{post.voteCount}</span> Votes
					</p>
					<p>
						<span>{post.commentCount}</span> Comments
					</p>
				</div>
				<Link to="/${post.category}" /* from "/:category" */>
					<p>
						{post.category}.capitalize() /* This method does not exist. Devise my own */
					</p>
				</Link>
			</div>
		)
	}
} 

GeneralGalleryPostContent.propTypes = {
	post: PropTypes.object.shape({
		id: PropTypes.number,
		content: PropTypes.string,
		voteCount: PropTypes.number,
		commentCount: PropTypes.number,
		category: PropTypes.string
	}).isRequired // IsRequired should be specified at each property level
}								// or globally? 