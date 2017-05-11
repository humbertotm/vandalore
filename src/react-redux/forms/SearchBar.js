import React from 'react'
import { Field, reduxForm } from 'redux-form'
import asyncValidate from './asyncValidate'

const renderField = ({input, label, type, meta: { touched, error, asyncValidating } }) => (
    <div>
        <div className={asyncValidating ? 'async-validating' : ''}>
            <input {...input} type={type} placeholder={label} />
        </div>
    </div>
)

const SearchBar = props => {
    const { handleSubmit, pristine, submitting } = props
    return (
        <form onSubmit={handleSubmit}>
            <Field name="searchBar" type="text" component={renderField} label="Search" />
            <div>
                <button type="submit">Some search icon</button>
            </div>
        </form>
    )
}

export default reduxForm({
    form: 'searchBar',
    asyncValidate
})