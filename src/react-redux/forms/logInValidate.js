export default logInValidate = values => {
	const errors = {}

	if(!values.email) {
		errors.email = 'Please enter an email.'
	} else if(!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email) {
		errors.email = 'Please enter a valid email.'
	}

	if(!values.password) {
		errors.password = 'Please enter a password.'
	}

	// Add length validation for previous fields.
}