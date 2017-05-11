export default uploadValidate = values => {
    if(!values.title) {
        errors.title = 'Please enter a title for your post.'
    }

    if(!values.content) {
        errors.content = 'Please upload an image.'
    }

    // Add length validation for previous fields.

    if(!values.category) {
        errors.category = 'Please choose a category for your post.'
    }
}