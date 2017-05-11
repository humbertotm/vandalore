import React, { Component, PropTypes } from 'react'
import Comment from '../components/Comment'

export default class Comments extends Component {
    componentDidMount() {
        const { post } = this.props
        dispatch(requestComments(post))
    }

    render() {
        const { comments } = this.props.post[comments]
        const postComments = comments.map(comment => {
            return (
                <Comment key=(comment.id) comment={comment} commenter={comment.userId} />
            )
        })

        return (
            <div>
                {postComments}
            </div>
        )
    }
}

Comments.PropTypes = {

}