export default commentValidate = () => {
	// Some validation here.
}

export default exceededLength = values => {
	if(values.comment.length > 140) {
		return true
	} else return false
}