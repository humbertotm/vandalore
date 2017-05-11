import React, { Component, PropTypes } from 'react'
import FeedPosts from './FeedPosts'

class Feed extends Component {
	constructor(props) {
		this.loadMorePosts = this.loadMorePosts.bind(this)
	}

	// Loads more posts starting at maxId.
	loadMorePosts() {
		const { loadMorePosts, currentGallery, postsByCategory } = this.props
		const { lastItemFetchedId } = postsByCategory.currentGallery[lastItemFetchedId]
		loadMorePosts(currentGallery, lastItemFetchedId)
	}

	render() {
		return (
			<div>
				<FeedPosts />
				<LoadMorePostsButton onClick={this.loadMorePosts} />
			</div>
		)
	}
}

Feed.PropTypes = {

}

mapDispatchToProps = dispatch => {
	// loadMorePosts: dispatch(loadPosts)
}

mapStateToProps = state => {
	// currentGallery: state.currentGallery,
	// postsByCategory: state.postsByCategory
}

export default connect(mapDispatchToProps)(Feed)