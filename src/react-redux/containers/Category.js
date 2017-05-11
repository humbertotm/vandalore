import React, { Component, PropTypes } from 'react'
import CategoryGalleryPosts from './CategoryGalleryPosts'

export default class Category extends Component {
    constructor(props) {
        this.loadMorePosts = this.loadMorePosts.bind(this)
    }

    // Loads more posts starting at maxId.
    loadMorePosts() {
        const { loadMorePosts, currentGallery, postsByCategory } = this.props
        const { lastItemFetchedId } = postsByCategory.currentGallery
        loadMorePosts(currentGallery, lastItemFetchedId)
    }

    render() {
        { currentGallery, postsByCategory, loadMorePosts } = this.props
        return (
            <div>
                <CategoryGalleryPosts
                    currentGallery={currentGallery}
                    postsByCategory={postsByCategory} />
                <LoadMorePostsButton loadMorePosts={this.loadMorePosts} />
            </div>
        )
    }
}

Category.PropTypes = {

}

mapStateToProps = state => {
 // currentGallery: state.currentGallery,
 // postsByCategory: state.postsByCategory
}

mapDispatchToProps = dispatch => {
    // loadMorePosts: dispatch(fetchPosts)
}

export default connect(mapStateToProps)(mapDispatchToProps)(Category)