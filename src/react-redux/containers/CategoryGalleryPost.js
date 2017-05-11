import React, { Component, PropTypes } from 'react'
import CategoryGalleryPostContent from '../components/CategoryGalleryPostContent'
import GalleryPostButtons from '../components/GalleryPostButtons'

export default class CategoryGalleryPost extends Component {
    constructor() {
        this.currentUserVoteExists = this.currentUserVoteExists.bind(this)
        this.toggleModal = this.toggleModal.bind(this)
        this.createVote = this.createVote.bind(this)
        this.deleteVote = this.deleteVote.bind(this)
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

    toggleModal(modal) {
        const { toggleModal } = this.props
        toggleModal(modal)
    }

    createVote(postId, userId) {
        const { createVote } = this.props
        createVote(postId, userId)
    }

    deleteVote(voteId) {
        const { deleteVote } = this.props
        deleteVote(voteId)
    }

    render() {
        const { post, currentUser } = this.props
        return (
            <div>
                <CategoryGalleryPostContent post={post} />
                <GalleryPostButtons
                    currentUserVoteExists={this.currentUserVoteExists}
                    post={post}
                    currentUser={currentUser}
                    toggleModal={this.toggleModal}
                    createVote={this.createVote}
                    deleteVote={this.deleteVote} />
            </div>
        )
    }
}

CategoryGalleryPost.PropTypes = {

}

mapStateToProps = state => {
    // currentUser: state.currentUser,
    // votes: state.entities.votes
}

mapDispatchToProps = dispatch => {
    // toggleModal: dispatch(toggleModal),
    // createVote: dispatch(createVote),
    // deleteVote: dispatch(deleteVote)
}