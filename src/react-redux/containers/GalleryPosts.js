import React, { Component, PropTypes } from 'react'
import GeneralGalleryPost from './GeneralGalleryPost'

class GalleryPosts extends Component {
	componentDidMount() {
		const { currentGallery, loadPosts } = this.props
		const category = currentGallery
		// Load cached posts or call the API.
		loadPosts(category)
	}

	render() {
		const { postsByCategory, currentGallery } = this.props
		const posts = postsByCategory.currentGallery[items]
		const galleryPosts = posts.map(post => {
			return (
				<GeneralGalleryPost 
					post={post}
					key={post.id} />
			)
		})

		return (
			<div>
				{galleryPosts}
			</div>
		)
	}
}

GalleryPosts.PropTypes = {

}

mapDispatchToProps = dispatch => {
	// loadPosts: dispatch(loadPosts)
}

export default connect(mapDispatchToProps)(GalleryPosts)
