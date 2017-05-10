import { CALL_API, Schemas } from '../middleware/api'
import { USER_REQUEST, USER_SUCCESS, USER_FAILURE } from './constants'

// Fetches a single user from the API.
// Relies on the middleware defined in ../middleware.api.js.
// !!! There is no reducer to listen for USER_REQUEST. Any problem with this? !!!
const fetchUser = id => ({
	[CALL_API]: {
		types: [ USER_REQUEST, USER_SUCCESS, USER_FAILURE ],
		endpoint: 'users/',
		schema: Schemas.USER,
		method: 'get',
		data: id
	}
})

// Fetches user from the API unless it is cached.
// Relies on Redux Thunk middleware.
const loadUser = (id, requiredFields = []) => (dispatch, getState) => {
	const user = getState().entities.users[id]
	if(user && requiredFields.every(key => user.hasOwnProperty(key))) {
		return null
	}

	return dispatch(fetchUser(id))
}