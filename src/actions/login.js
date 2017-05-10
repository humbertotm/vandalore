import { CALL_API, Schemas } from '../middleware/api'
import {
	LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE,
	LOGOUT_REQUEST, LOGOUT_SUCCESS, LOGOUT_FAILURE
} from './constants'

// Calls the API to log in a user with the provided credentials.
// Relies on the middleware defined in ../middleware/api.js.
const logIn = userData => {
	[CALL_API]: {
		types: [ LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE ],
		endpoint: '/login/url',
		schema: Schemas.USER,
		method: 'post',
		data: userData
	}
}

// Checks that there is no logged in user.
// Relies on Thunk middleware.
const requestLogIn = userData => (dispatch, getState) => {
	const authenticatedUser = getState().currentUser
	if(authenticatedUser) {
		return null
	} 

	return dispatch(logIn(userData))
}

// Resets currentUser to null.
// !!! Where should the JWT deletion be requested? !!!
const logOut = () => {
	
}