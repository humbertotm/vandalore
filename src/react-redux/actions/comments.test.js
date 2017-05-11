import * as actions from './comments'
import {
	COMMENTS_REQUEST, COMMENTS_SUCCESS, COMMENTS_FAILURE,
	CREATE_COMMENT_REQUEST, CREATE_COMMENT_SUCCESS, CREATE_COMMENT_FAILURE,
	DELETE_COMMENT_REQUEST, DELETE_COMMENT_SUCCESS, DELETE_COMMENT_FAILURE,
	CLEAR_COMMENTS, UPDATE_COMMENT_FORM_COUNTER
} from './constants'
import { CALL_API, Schemas } from '../middleware/api'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

const middlewares = [ thunk ]
const mockstore = configureMockStore(middlewares)

// It is not testing for equality in the action created.
// It is only testing for action creation.

describe('fetchComments action', () => {
	it('should create an action to call the API', () => {
		const expectedAction = {
			[CALL_API]: {
				types: [ COMMENTS_REQUEST, COMMENTS_SUCCESS, COMMENTS_FAILURE ],
				endpoint: '/comments&postId=5',
				method: 'GET',
				schema: Schemas.COMMENT
			}
		}

		expect(actions.fetchComments(5)).toEqual(expectedAction)
	})
})

describe('deleteComment action', () => {
	it('should create an action to call the API', () => {
		const expectedAction = {
			[CALL_API]: {
				types: [ DELETE_COMMENT_REQUEST, DELETE_COMMENT_SUCCESS, DELETE_COMMENT_FAILURE ],
				endpoint: 'delete/comment/url',
				method: 'delete',
				data: 1,
				entity: 'comments'
			}
		}

		expect(actions.deleteComment(1)).toEqual(expectedAction)
	})
})

describe('clearComments action', () => {
	it('should create an action to clear some posts comments', () => {
		const expectedAction = {
			type: CLEAR_COMMENTS,
			postId: 1
		}

		expect(actions.clearComments(1)).toEqual(expectedAction)
	})
})

describe('updateCounter action', () => {
	const expectedAction = {
		type: UPDATE_COMMENT_FORM_COUNTER,
		commentFormCounter: 120
	}

	expect(actions.updateCounter(120)).toEqual(expectedAction)
})

describe('requestUpdateCounter action dispatches updateCounter', () => {
	it('should dispatch another action', () => {
		const store = mockstore({
			commentUI: {
				commentFormCounter: 140
			}
		})

		const expectedAction = [{
			type: UPDATE_COMMENT_FORM_COUNTER,
			commentFormCounter: 120
		}]

		// When using return store.dispatch(...), it won't work.
		// I am hypothesizing that it does not work because requestUpdateCounter
		// does not return a promise or a value, it just dispatches another action.
		store.dispatch(actions.requestUpdateCounter(20))
		expect(store.getActions()).toEqual(expectedAction)
	})
})