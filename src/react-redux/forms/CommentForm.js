import React, { Component, PropTypes } from 'react'
import { Field, reduxForm } from 'redux-form'
import CommentField from '../components/CommentField'
import exceededLength from './commentValidate'
import commentValidate from './commentValidate'

class CommentForm extends Component {
    render() {
        const { handleSubmit, pristine, submitting, disabledValue, updateCounterValue } = this.props
        const additionalProps = {
            disabled: disabledValue,
            updateCounter: updateCounterValue
        }

        return (
            <div>
                <form onSubmit={handleSubmit}>
                    <Field name='comment' type='textarea' component={CommentField} props={additionalProps} />

                    <div>
                        <button type='submit' disabled={pristine || submitting || exceededLength}>Comment</button>
                    </div>
                </form>
            </div>
        )
    }

CommentForm = reduxForm({
    form: 'commentForm',
    validate: commentValidate,
    asyncValidate
})(CommentForm)

export default CommentForm