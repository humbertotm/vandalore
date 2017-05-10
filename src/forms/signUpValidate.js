export default signUpvalidate = values => {
	const errors = {}

	if(!values.email) {
		errors.email = 'Please enter an email.'
	} else if(!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
		errors.email = 'Please enter a valid email.'
	}

	if(!values.username) {
		errors.username = 'Please enter a username.'  
	}

	if(!values.password) {
		errors.password = 'Please enter a password.'
	}

	if(!values.passwordConfirmation) {
		errors.passwordConfirmation = 'Please enter a password confirmation.'
	}

	if(values.passwordConfirmation !== formProps.password) {
		errors.passwordConfirmation = 'Password and password confirmation must match.'
	}

	// Add length validation for the previous fields.
}
