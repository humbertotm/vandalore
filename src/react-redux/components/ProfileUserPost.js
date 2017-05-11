import React, { Component, PropTypes } from 'react'

export default class ProfileUserPost extends Component {
    render() {
        const { post } = this.props

        return (
            <div>
                <img src={post.content.url} />
            </div>
        )
    }
}

ProfileUserPost.PropTypes = {

}