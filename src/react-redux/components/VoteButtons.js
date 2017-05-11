import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'

export default class VoteButtons extends Component {
    constructor(props) {
        this.handleVoteRequest = this.handleVoteRequest.bind(this)
    }

    render() {
        const { post, currentUser, createVote } = this.props
        const postId = post.id
        const userId = currentUser.id

        return (
            <div>
                <span>
                    <button type="button" className="btn btn-default" onClick={createVote(postId, userId)}>
                        Vote
                    </button>
                </span>
                <span>
                    <Link to="/posts/${post.id}">
                        <button type="button" className="btn btn-default">
                            Comment
                        </button>
                    </Link>
                </span>
            </div>
        )
    }
}

VoteButtons.PropTypes = {

}