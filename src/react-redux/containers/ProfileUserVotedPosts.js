import React, { Component, PropTypes } from 'react'
import ProfileUserVotedPost from '../components/ProfileUserVotedPost'

export default class ProfileUserVotedPosts extends Component {
    constructor() {
        this.loadUserVotedPosts = this.loadUserVotedPosts.bind(this)
    }

    loadUserVotedPosts() {
        // dispatch action to load user voted posts
    }

    render() {
        const votedPosts = this.loadUserVotedPosts()
        const postsVotedByUser = votedPosts.map(post => {
            return (
                <ProfileUserVotedPost key={post.id} post={post} />
            )
        })

        })
        return (
            <div>
                {postsVotedByUser}
            </div>
        )
    }
}

ProfileUserVotedPosts.PropTypes = {

}