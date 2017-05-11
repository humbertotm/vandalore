import { CALL_API, Schemas } from '../middleware/newApi'
import {
	FETCH_POSTS_REQUEST, FETCH_POSTS_SUCCESS, FETCH_POSTS_FAILURE,
	DELETE_POST_REQUEST, DELETE_POST_SUCCESS, DELETE_POST_FAILURE,
	INVALIDATE_CATEGORY_POSTS
} from './constants'

// Fetches posts from the API when there are none cached for the
// specified category.
// Relies on the middleware defined in ../middleware/api.js.
export const fetchPosts = (category, maxId) => {
	if(!maxId) {
		return ({
			type: [CALL_API],
			payload: {
				types: [ FETCH_POSTS_REQUEST, FETCH_POSTS_SUCCESS, FETCH_POSTS_FAILURE],
				endpoint: `/posts?category=${category}`,
				schema: Schemas.POST,
				method: 'GET'
			}		
		})
	}

	return ({
		type: [CALL_API],
		payload: {
			types: [ FETCH_POSTS_REQUEST, FETCH_POSTS_SUCCESS, FETCH_POSTS_FAILURE ],
			endpoint: `/posts?maxId=${maxId}&category=${category}`,
			schema: Schemas.POST,
			method: 'GET'
		}	
	})
}

// Fetches posts from the API unless it is cached.
// Relies on Redux Thunk middleware.
// There is a possibility that there is something wrong with this whole 
// syntax. I can't get it to run on JSFiddle. No wonder it is not passing
// the test.
export const loadPosts = category => (dispatch, getState) => {
	const currentState = getState()
	const posts = currentState.postsByCategory
	const categoryPosts = posts[category]
	const items = categoryPosts.items
	
	if(items.length === 0) {
		return dispatch(fetchPosts(category))
	}

	return null
}

export const deletePost = postId => ({
	type: [CALL_API],
	payload: {
		types: [ DELETE_POST_REQUEST, DELETE_POST_SUCCESS, DELETE_POST_FAILURE ],
		endpoint: `/posts?postId=${postId}`,
		method: 'DELETE'
		// Might be able to get the entity from request.url
	}
})