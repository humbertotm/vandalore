import React, { Component, PropTypes } from 'react'
import CategoryGalleryPost from './CategoryGalleryPost'

class CategoryGalleryPosts extends Component {
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
                <CategoryGalleryPost
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

CategoryGalleryPosts.PropTypes = {

}

mapDispatchToProps = dispatch => {
    // loadPosts: dispatch(loadPosts)
}

export default connect(mapDispatchToProps)(CategoryGalleryPosts)
