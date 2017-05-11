import React, { Component, PropTypes } from 'react'
import PostHeader from '../components/PostHeader'
import GeneralGalleryPostContent from '../components/GeneralGalleryPostContent'
import SinglePostButtons from '../components/SinglePostButtons'
import NextPostButton from '../components/NextPostButton'
import CommentForm from '../components/CommentForm'
import Comments from './Comments'
import { Link } from 'react-router'

class SinglePost extends Component {
    constructor() {
        this.currentUserVoteExists = this.currentUserVoteExists.bind(this)
        this.createVote = this.createVote.bind(this)
        this.deleteVote = this.deleteVote.bind(this)
    }

    componentDidMount() {
        // Call the API to get the comments for this post.
        const { getComments, post } = this.props
        const postId = post.id
        getComments(postId)
    }

    currentUserVoteExists() {
        const { votes, currentUser, post } = this.props
        const currentUserId = currentUser.id
        const postId = post.id

        if(!currentUserId) {
            return null
        }

        // Iterate through votes until a vote from currentUser for
        // post at hand is found or not.
        return traverseVotes(votes, currentUserId, postId)
    }

    nextPostId() {
        // return next post id
        // Where to extract it from?
        // From the category parameter in the url; use it to search for
        // state.postsByCategory.category[items].
        // Next post's id will be the first element of the array
        // (or the last one)
    }

    createVote(postId, userId) {
        const { createVote } = this.props
        createVote(postId, userId)
    }

    deleteVote(voteId) {
        const { deleteVote } = this.props
    }

    toggleModal(modal) {
        const { toggleModal } = this.props
        toggleModal(modal)
    }

    render() {
        const { poster, post, currentUser } = this.props

        return (
            <div>
                <PostHeader poster={poster} />
                <GeneralGalleryPostContent post={post} />
                <SinglePostButtons
                    post={post}
                    currentUser={currentUser}
                    currentUserVoteExists={this.currentUserVoteExists}
                    createVote={this.createVote}
                    deleteVote={this.deleteVote}
                    toggleModal={this.toggleModal} />
                <Link to="/posts/${this.nextPostId()}">
                    <NextPostButton />
                </Link>
                <CommentForm />
                <Comments post={post} />
            </div>
        )
    }
}

SinglePost.propTypes = {

}

mapStateToProps = state => {
    // const postId = 'postId parameter in the url.'
    //
    // post: state.entities.posts[postId],
    // votes: state.entities.votes,
    // currentUser: state.currentUser
}

mapDispatchToProps = dispatch {
    // createVote: dispatch(createVote),
    // deleteVote: dispatch(deleteVote),
    // toggleModal: dispatch(toggleModal),
    // getComments: dispatch(fetchComments)
}

export default connect(mapStateToProps)(mapDispatchToProps){SinglePost}