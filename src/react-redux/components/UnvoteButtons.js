import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'

export default UnvoteButtons extends Component {
    constructor(props) {
        this.handleUnvoteRequest = this.handleUnvoteRequest.bind(this)
    }

    render() {
        const { currentUserVoteExists, deleteVote } = this.props
        const voteId = currentUserVoteExists.id

        return (
            <div>
                <span>
                    <button type="button" className="btn btn-primary" onClick={deleteVote(voteId)}>
                        Vote
                    </button>
                </span>
                <span>
                    <Link to="/posts/${post.id">
                        <button type="button" className="btn btn-default">
                            Comment
                        </button>
                    </Link>
                </span>
            </div>
        )
    }
}