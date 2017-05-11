import React from 'react'
import { Field, reduxForm } from 'redux-form'
import logInValidate from './logInValidate'
import asyncValidate from './asyncValidate'

const renderField = ({input, label, type, meta: { touched, error, asyncValidating } }) => (
    <div>
        <label>{label}</label>
        <div className={asyncValidating ? 'async-validating' : ''}>
            <input {...input} type={type} placeholder={label} />
            {touched && error && <span>{error}</span>}
        </div>
    </div>
)

const LogInForm = props => {
    const { handleSubmit, pristine, submitting } = props
    return (
        <div>
            <form onSubmit={handleSubmit}>

                <Field name='email' type='email' component={renderField} label="Email" />

                <Field name='password' type='password' component={renderField} label="Password" />

                <div>
                    <button type='submit' disabled={pristine || submitting}>Log in</button>
                </div>
            </form>

            <p>
                New to Vandalorian?
                <span>
                    // This called function should change the value of
                    // contentLabel to rerender the modal's content.
                    <a onClick={this.goToSignUp('signup')}>Sign up!</a>
                </span>
            </p>
        </div>
    )
}

export default reduxForm({
    form: 'logInForm',
    validate: logInValidate,
    asyncValidate
})(LogInForm)