import React, { Component, PropTypes } from 'react'
import ProfileUserPost from '../components/ProfileUserPost'

class ProfileUserPosts extends Component {
	constructor() {
		this.loadUserPosts = this.loadUserPosts.bind(this)
	}

	componentDidMount() {
		const { user, loadUserPosts } = this.props 
		const userId = user.id
		// dispatch an action that loads user posts
		// This action has not been defined yet.
		loadUserPosts(userId)
	}

	loadProfileUserPosts() {
		const { posts } = this.props
		// Extract from posts the ones created by profile user.
	}

	render() {
		const posts = this.loadProfileUserPosts()
		const profileUserPosts = posts.map(post => {
			return (
				<ProfileUserPost key={post.id} post={post} />
			)
		})

		return (
			<div>
				{profileUserPosts}
			</div>
		)
	}
}

ProfileUserPosts.PropTypes = {
	
}

mapStateToProps = state => {
	// posts: state.entities.posts
}

mapDispatchToProps = dispatch => {
	// loadUserPosts: dispatch(loadUserPosts)
}

export default connect(mapStateToProps)(mapDispatchToProps)(ProfileUserPosts)