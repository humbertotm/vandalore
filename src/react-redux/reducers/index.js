import merge from 'lodash/merge'
import pick from 'lodash/pick'
import currentUser from './loginReducer'
import postsByCategory from './postsReducer'
import * as ActionTypes from '../actions/constants'

export const singleEntity = (state = {}, action) => {
	if(action.response && action.response.keysArray) {
		return pick(state, action.response.keysArray)
	}

	return state
}

// Updates an entity cache in response to any action with response.entities.
export const entities = (state = {
 	users: {}, 
 	posts: {},
 	votes: {},
 	comments: {},
 	relationships: {}
}, action) => {
	if(action.response && action.response.entities) {
		return merge({}, state, action.response.entities)
	}

	// This will be called when an action to delete something was dispatched.
	if(action.response && action.response.keysArray) {
		const { entity } = action.response
		return {
			...state,
			[entity]: singleEntity(state[entity], action)
		}
	}

	return state
}

// This will be in close relation to the router.
// Updates currentGallery
export const currentGallery = (state = 'home', action) => {
	const { type, gallery } = action
	if(type === ActionTypes.UPDATE_CURRENT_GALLERY) {
		return gallery
	}

	return state
} 

// Updates error message to notify about failures.
export const errorMessage = (state = null, action) => {
	const { type, error } = action

	if(type === ActionTypes.RESET_ERROR_MESSAGE) {
		return null
	} else if(error) {
		return error
	}

	return state
}