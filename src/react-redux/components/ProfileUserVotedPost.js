import React, { Component, PropTypes } from 'react'

export default class ProfileUserVotedPost extends Component {
    render() {
        const { post } = this.props

        return (
            <div>
                <img src={post.content.url} />
            </div>
        )
    }
}

ProfileUserVotedPost.PropTypes = {

}