import * as actionTypes from '../actions/constants'

// Updates the contents of state.postsByCategory.category
export const posts = (state = {
	isFetching: false,
	items: [],
	lastItemFetchedId: null
}, action) => {
	switch(action.type) {
		case actionTypes.FETCH_POSTS_REQUEST:
			return {
				...state,
				isFetching: true
			}

		case actionTypes.FETCH_POSTS_SUCCESS:
			const response = action.response
			const entities = response.entities
			const posts = entities.posts
			// Object.keys() throws array in ascending order.
			const newItems = Object.keys(posts)
			const stateItems = state.items

			return {
				...state,
				isFetching: false,
				items: stateItems.concat(newItems),
				lastItemFetchedId: newItems.slice(0, 1)
			}

		case actionTypes.FETCH_POSTS_FAILURE:
			return {
				...state,
				isFetching: false
			}

		default:
			return state
	}
}

// HOF. Updates postsByCategory by calling posts(state, action).
export const postsByCategory = (state = {}, action) => {
	switch(action.type) {
		case actionTypes.FETCH_POSTS_REQUEST:

		case actionTypes.FETCH_POSTS_SUCCESS:

		case actionTypes.FETCH_POSTS_FAILURE:
			// This is obviusly incorrect. failureType action will come
			// with an error object. Will fix this later. 
			const { category } = action.response
			const stateCategory = state.category

			return {
				...state,
				[category]: posts(state[category], action)
			}

		default: 
			return state	
	}
}
