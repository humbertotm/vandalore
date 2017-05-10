import React, { Component, PropTypes } from 'react'
import FeedPost from './FeedPost'

class FeedPosts extends Component {
	componentDidMount() {
		// Load posts.
	}

	render() {
		const { } = this.props
		const posts = 'something'
		const feedPosts = posts.map(post => {
			const poster = post.user
			return (
				<FeedPost 
					post={post} 
					key={post.id} 
					poster={poster} />
			)
		})

		return (
			<div>
				{feedPosts}
			</div>
		)
	}
}

FeedPosts.PropTypes = {

}

mapDispatchToProps = dispatch => {
	// loadPosts: dispatch(loadPosts)
}

export default connect(mapDispatchToProps)(FeedPosts)
