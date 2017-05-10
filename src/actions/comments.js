import { CALL_API, Schemas } from '../middleware/api'
import {
	COMMENTS_REQUEST, COMMENTS_SUCCESS, COMMENTS_FAILURE,
	CREATE_COMMENT_REQUEST, CREATE_COMMENT_SUCCESS, CREATE_COMMENT_FAILURE,
	DELETE_COMMENT_REQUEST, DELETE_COMMENT_SUCCESS, DELETE_COMMENT_FAILURE,
	CLEAR_COMMENTS, UPDATE_COMMENT_FORM_COUNTER
} from './constants'

// Requests comments from the API.
// Relies on the middleware defined in ../middleware/api.js.
// !!! This approach will have to be revisited. It will make an Ajax request
// each time we go to the individual post view. We need to consider caching
// comments of a previously visited post.
export const fetchComments = postId => ({
	[CALL_API]: {
		types: [ COMMENTS_REQUEST, COMMENTS_SUCCESS, COMMENTS_FAILURE ],
		endpoint: `/comments&postId=${postId}`,
		method: 'GET',
		schema: Schemas.COMMENT
	}
})

// Deletes a comment by calling the API.
// Relies on middleware defined in ../middleware/api.js.
export const deleteComment = commentId => ({
	[CALL_API]: {
		types: [ DELETE_COMMENT_REQUEST, DELETE_COMMENT_SUCCESS, DELETE_COMMENT_FAILURE ],
		endpoint: `/comments?commentId=${commentId}`,
		method: 'DELETE',
		// I might be able to get the entity from the request url.
		// entity: 'comments'
	}
})

// Clears state.entities.comments and state.entities.posts.postId.comments
export const clearComments = postId => ({
	type: CLEAR_COMMENTS,
	postId
})

// Updates the character counter for the comment form.
// Relies on Thunk middleware.
export const requestUpdateCounter = characterCount => dispatch => {
	const newCount = 140 - characterCount

	return dispatch(updateCounter(newCount))
}

export const updateCounter = characterCount => ({
	type: UPDATE_COMMENT_FORM_COUNTER,
	commentFormCounter: characterCount
})