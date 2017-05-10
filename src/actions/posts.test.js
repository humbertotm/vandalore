// import chai from 'chai'
import * as actions from './posts'
import { CALL_API, Schemas } from '../middleware/api'
import {
	FETCH_POSTS_REQUEST, FETCH_POSTS_SUCCESS, FETCH_POSTS_FAILURE,
	DELETE_POST_REQUEST, DELETE_POST_SUCCESS, DELETE_POST_FAILURE,
	INVALIDATE_CATEGORY_POSTS
} from './constants'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

const middlewares = [ thunk ]
const mockStore = configureMockStore(middlewares)
let store

describe('loadPosts async action', () => {
	afterEach(() => {
		store = {}
	})	

	it('should not create any action', () => {
		const initialState = {
			postsByCategory: {
				hot: {
					isFetching: false,
					items: [10, 9],
					lastItemFetchedId: 9,
					lastUpdated: new Date()
				}
			}
		}	

		store = mockStore(initialState)
		store.dispatch(actions.loadPosts('hot'))
		expect(store.getActions()).toEqual([])			
	})

	it('should create an action to call the API', () => {
		const initialState = {
			postsByCategory: {
				hot: {
					isFetching: false,
					items: [],
					lastItemFetchedId: null,
					lastUpdated: null
				}
			}
		}

		store = mockStore(initialState)

		const expectedAction = [{
			[CALL_API]: {
				type: [ FETCH_POSTS_REQUEST, FETCH_POSTS_SUCCESS, FETCH_POSTS_FAILURE],
				endpoint: '/posts?category=hot',
				schema: Schemas.POST,
				method: 'GET'
			}
		}]

		const expectedAction1 = [{
			type: 'TEST_TYPE'
		}]

		// Don't know how to test it dispatches the action and the
		// action ends up in the store.

		// return store.dispatch(actions.loadPosts('hot'))
		// expect(store.getActions()).toEqual(expectedAction1)				
	})
})

describe('posts action creators', () => {
	it('should test fetchPosts creates expected action', () => {
		const initialState = {
			postsByCategory: {
				hot: {
					isFetching: false,
					items: [],
					lastItemFetchedId: null,
					lastUpdated: null
				}
			}
		}

		const expectedAction = [{
			[CALL_API]: {
				types: [ FETCH_POSTS_REQUEST, FETCH_POSTS_SUCCESS, FETCH_POSTS_FAILURE],
				endpoint: '/posts?maxId=10&category=fresh',
				schema: Schemas.POST,
				method: 'GET'
			}
		}]

		store = mockStore(initialState)
		// Does not work because the action created is not a FSA.
		// store.dispatch(actions.fetchPosts('fresh', 10))
		// expect(store.getActions()).toEqual(expectedAction)
	})

	it('should test deletePost creates expected action to call API', () => {
		const expectedAction = {
			[CALL_API]: {
				types: [ DELETE_POST_REQUEST, DELETE_POST_SUCCESS, DELETE_POST_FAILURE ],
				endpoint: '/delete/post/url',
				method: 'delete',
				data: 10,
				entity: 'posts'
			}
		}

		// Test assertion.
	})
})
