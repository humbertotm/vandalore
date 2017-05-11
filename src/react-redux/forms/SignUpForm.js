import React from 'react'
import { Field, reduxForm } from 'redux-form'
import signUpValidate from './signUpValidate'
import asyncValidate from './asyncValidate'

const renderField = ({ input, type, label, meta: { touched, error, asyncValidating } }) => (
    <div>
        <label>{label}</label>
        <div className={asyncValidating ? 'async-validating' : ''}>
            <input {...input} type={type} placeholder={label} />
            {touched && error && <span>{error}</span>}
        </div>
    </div>
)

const SignUpForm = (props) => {
    const { handleSubmit, pristine, submitting } = props

    return (
        <div>
            <form onSubmit={handleSubmit}>

                <Field name='email' type='email' component={renderField} label='Email' />

                <Field name='username' type='text' component={renderField} label='Username' />

                <Field name='password' type='password' component={renderField} label='Password' />

                <Field name='passwordConfirmation' type='password' component={renderField} label='Password confirmation' />

                <button type='submit' disabled={pristine || submitting}>Sign up</button>
            </form>

            <p>
                Already a member?
                <span>
                    <a onClick={this.goToLogIn('login')}>Log in!</a>
                </span>
            </p>
        </div>
    )
}

export default reduxForm({
    form: 'SignUpForm',
    validate: signUpValidate,
    asyncValidate
})(SignUpForm)