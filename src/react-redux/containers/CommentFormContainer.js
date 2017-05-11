import React, { Component, PropTypes } from 'react'
import { connect } from 'redux'
import CommentForm from '../forms/CommentForm'
import CommentFormCounter from '../components/CommentFormCounter'
// import updateCounter from '../actions/commentForm'

export default class CommentFormContainer extends Component {
    render() {
        const { counterValue, updateCounterValue, currentUser } = this.props
        const disabledValue = (currentUser) => {
            if(!currentUser) {
                return true
            }

            return false
        }

        return (
            <div>
                <CommentForm disabledValue={disabledValue(currentUser)}
                    updateCounterValue={updateCounterValue}  />
                <CommentFormCounter value={counterValue}/>
            </div>
        )
    }
}

const mapStateToProps = state => {
    counterValue: state.commentUI.commentFormCounter,
    currentUser: state.currentUser
}

const mapDispatchToProps = dispatch => {
    updateCounterValue: dispatch(requestUpdateCounter)
}

CommentFormContainer.propTypes = {
    counterValue: PropTypes.number,
    updateCounterValue: PropTypes.func,
    currentUser: PropTypes.object
}