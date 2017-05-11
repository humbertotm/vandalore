import{ SubmissionError } from 'redux-form'

// Will have to tailor it a little bit more to accomodate both forms.
export default asyncValidate = (values, callingForm) => {
    let url
    if(callingForm === 'login') {
        url = 'https://vandalorianApi/login'
    }
    url = 'https://vandalorianApi/users'
    return fetch(url , {
        method: 'POST',
        body: {
            values
        }
    }).then(response => {
        dispatch(updateCurrentUser(response))
    }).catch(error => {
        // Not quite sure as to how to handle the rejected Promise yet.
        throw new SubmissionError()
    })
}