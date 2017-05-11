import React, { Component, PropTypes } from 'react'

export default class Comment extends Component {
    render() {
        const { comment, commenter } = this.props
        return (
            <div>
                <p>{commenter.userName}</p>
                <p>{comment.content}</p>
                <p>{comment.createdAt}</p>
            </div>
        )
    }
}