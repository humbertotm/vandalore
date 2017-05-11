import React, { Component, PropTypes } from 'react'

export default class SinglePostUnvoteButton extends Component {
    render() {
        const { deleteVote, currentUserVoteExists } = this.props
        const voteId = currentUserVoteExists.id

        return (
            <div>
                <span>
                    <button type="button" className="btn btn-primary" onClick={deleteVote(voteId)}>
                        Unvote
                    </button>
                </span>
            </div>
        )
    }
}

SinglePostUnvoteButton.propTypes = {

}