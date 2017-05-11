import React from 'react'
import { Field, reduxForm } from 'redux-form'
import uploadValidate from './uploadValidate'
import asyncValidate from './asyncValidate'

const renderField = ({ input, type, label, meta: { touched, error, asynValidating } }) => (
	<div>
		<label>{label}</label>
		<div className={asynValidating ? 'async-validating' : ''}>
			<input {...input} type={type} placeHolder={label} />
			{touched && error && <span>{error}</span>}
		</div>
	</div>
)

const categoryField = () => (
	<div>

	</div>
)

const UploadPostForm = (props) => {
	const { handleSubmit, pristine, submitting } = props

	return (
		<div>
			<form onSubmit={handleSubmit}>

				<Field name='title' type='text' component={renderField} label='Title' />

				<Field name='description' type='text' component={renderField} label='Description' />

				<Field name='content' type='file' component={renderField} label='Content' value={null} />

				<label>Category</label>
				<div>
					<label><Field name='category' type='radio' component='input' value='tattoo' />Tattoo</label>
					<label><Field name='category' type='radio' component='input' value='urban' />Urban</label>
					<label><Field name='category' type='radio' component='input' value='photography' />Photography</label>
					<label><Field name='category' type='radio' component='input' value='painting' />Painting</label>
					<label><Field name='category' type='radio' component='input' value='illustration' />Illustration</label>
					<label><Field name='category' type='radio' component='input' value='sculpture' />Sculpture</label>
					<label><Field name='category' type='radio' component='input' value='other' />Other</label>
				</div>

				<button type='submit' disabled={pristine || submitting}>Upload!</button>
			</form>
		</div>
	)
}

export default reduxForm({
	form: 'UploadPostForm',
	validate: uploadValidate,
	asyncValidate
})(UploadPostForm)