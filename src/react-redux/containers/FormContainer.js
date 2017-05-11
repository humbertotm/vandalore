import React, { Component, PropTypes } from 'react'
import LogInForm from '../forms/LogInForm'
import SignUpForm from '../forms/SignUpForm'
import UploadPostForm from '../forms/UploadPostForm'

export default class FormContainer extends Component {
	render() {
		const { contentLabel } = this.props
		return (
			<div>
				{
					(contentLabel === 'logInForm') && <LogInForm />
				}

				{
					(contentLabel === 'signUpForm') && <SignUpForm />
				}

				{
					(contentLabel === 'uploadPostForm') && <UploadPostForm />
				}
			</div>
		)
	}
}