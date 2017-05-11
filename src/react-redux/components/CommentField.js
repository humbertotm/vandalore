import React, { Component, PropTypes } from 'react'

export default class CommentField extends Component {
    render() {
        const { type, input: { value, onChange },
            meta: { dispatch, touched, error, asyncValidating },
            additionalProps: { disabled, updateCounter } } = this.props
        const valueLength = value.length
        const placeholderValue = disabled => {
            if(disabled === true) {
                return "Log in to comment."
            }
            return "Leave a comment."
        }


        return (
            <div>
                <div className={asyncValidating ? 'async-validating' : ''}>
                    <input {...input}
                        disabled={disabled}
                        onChange={updateCounter(valueLength)}
                        type={type}
                        placeholder={placeholderValue(disabled)} />
                    {touched && error && <span>{error}</span>}
                </div>
            </div>
        )
    }
}