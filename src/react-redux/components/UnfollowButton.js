import React, { Component, PropTypes } from 'react'

export default class UnfollowButton extends Component {
    render() {
        const { unfollow, relationshipExists } = this.props
        const relationshipId = relationshipExists().id

        return (
            <div>
                <span>
                    <button type="button" className="btn btn-default" onClick={unfollow(relationshipId)}>
                        Unfollow
                    </button>
                </span>
            </div>
        )
    }
}