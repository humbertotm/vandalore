import chai from 'chai'
import * as actions from '../../../src/actions/posts'
import { CALL_API, Schemas } from '../../../src/middleware/api'
import {
	FETCH_POSTS_REQUEST, FETCH_POSTS_SUCCESS, FETCH_POSTS_FAILURE,
	DELETE_POST_REQUEST, DELETE_POST_SUCCESS, DELETE_POST_FAILURE,
	INVALIDATE_CATEGORY_POSTS
} from '../../../src/actions/constants'
import configureStore from 'redux-mock-store'
import ReduxThunk from 'redux-thunk'
import sinon from 'sinon'

const expect = chai.expect;

describe.skip('posts action creators', () => {
	let store
	const middlewares = [ ReduxThunk ]

	before(() => {

	})

	beforeEach(() => {

	})

	afterEach(() => {

	})
	// Does not work without the deep comparison.
	it('deletePost action creator creates action', () => {
		// Create a mockStore.
		const mockStore = configureStore(middlewares)
		// Create an instance of mockStore.
		store = mockStore({})
		const expectedActions = [{
			type: [CALL_API],
			payload: {
				// Does not go as deep as these key-value pairs.
				// If this key-value pairs are critical, verify their correctness
				// through a similar approach as the one used for fetchPosts.
				types: [ DELETE_POST_REQUEST, DELETE_POST_SUCCESS, DELETE_POST_FAILURE ],
				endpoint: '/posts?postId=10',
				method: 'DELETE'
			}
		}]

		store.dispatch(actions.deletePost(10))
		expect(store.getActions()).to.deep.equal(expectedActions)
	})

	it('loadPosts action creator dispatches fetchPosts when items.length === 0', () => {
		// Create a mockStore.
		const mockStore = configureStore(middlewares)
		// Give it an initialState.
		const initialState = {
			postsByCategory: {
				hot: {
					isFetching: false,
					items: [],
					lastItemFetchedId: 9,
					lastUpdated: Date.now()
				}
			}
		}	

		// Create an instance of the mockStore and provide it with initialState.
		store = mockStore(initialState)
		// Create spy on store.dispatch
		const spy = sinon.spy(store, 'dispatch')
		const expectedActions = [{
			type: [CALL_API],
			payload: {
				types: [ FETCH_POSTS_REQUEST, FETCH_POSTS_SUCCESS, FETCH_POSTS_FAILURE],
				endpoint: '/posts?category=hot',
				schema: Schemas.POST,
				method: 'GET'
			}		
		}]

		return store.dispatch(actions.loadPosts('hot'))

		sinon.assert.calledTwice(spy)
		expect(store.getActions()).to.deep.equal(expectedActions)
		spy.restore()
	})

	it('loadPosts action creator returns null when items.length !== 0', () => {
		// Create a mockStore.
		const mockStore = configureStore(middlewares)
		// Give the store an initialState.
		const initialState = {
			postsByCategory: {
				hot: {
					isFetching: false,
					items: [10, 9],
					lastItemFetchedId: 9,
					lastUpdated: Date.now()
				}
			}
		}	
		store = mockStore(initialState)

		// Assert null is returned.
		const loadPostsValue = store.dispatch(actions.loadPosts('hot'))
		expect(loadPostsValue).to.equal(null)
	})

	it('fetchPosts returns action with maxId & category in endpoint', () => {
		// Will have to access endpoint property to make a comparison,
		// as deep comparison will not go as deep.

		// Create a mockStore.
		const mockStore = configureStore(middlewares)
		// Create an instance of mockStore.
		store = mockStore({})
		
		store.dispatch(actions.fetchPosts('hot', 10))
		const storeActions = store.getActions()
		const actionOfInterest = storeActions[0]
		const expectedEndpoint = '/posts?maxId=10&category=hot'

		expect(actionOfInterest.payload.endpoint).to.equal(expectedEndpoint)
	})

	it('fetchPosts returns action only with category in endpoint', () => {
		// Same as above.

		// Create a mockStore.
		const mockStore = configureStore(middlewares)
		// Create an instance of mockStore.
		store = mockStore({})
		
		store.dispatch(actions.fetchPosts('hot'))
		const storeActions = store.getActions()
		const actionOfInterest = storeActions[0]
		const expectedEndpoint = '/posts?category=hot'

		expect(actionOfInterest.payload.endpoint).to.equal(expectedEndpoint)
	})
})

