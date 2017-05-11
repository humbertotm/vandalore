import React, { Component, PropTypes } from 'react'
import GalleryPosts from './GalleryPosts'

class Home extends Component {
    constructor(props) {
        this.fetchMorePosts = this.fetchMorePosts.bind(this)
    }

    // Loads more posts starting at maxId.
    fetchMorePosts() {
        const { fetchMorePosts, currentGallery, postsByCategory } = this.props
        const { lastItemFetchedId } = postsByCategory[currentGallery]
        fetchMorePosts(currentGallery, lastItemFetchedId)
    }

    render() {
        return (
            <div>
                <GalleryPosts
                    currentGallery={currentGallery}
                    postsByCategory={postsByCategory} />
                <LoadMorePostsButton fetchMorePosts={this.fetchMorePosts} />
            </div>
        )
    }
}

Home.PropTypes = {

}

mapStateToProps = state => {
    // map the props that will be passed down the component chain.
    // !!! currentGallery will be set by the url. !!!
    // currentGallery: state.currentGallery
    // postsByCategory: state.postsByCategory
}

mapDispatchToProps = dispatch => {
    // map the functions that will be passed down the component chain.
    // fetchMorePosts: dispatch(fetchPosts)
}

// Find out what is the correct order of arguments here.
export default connect(mapStateToProps)(mapDispatchToProps)(Home)