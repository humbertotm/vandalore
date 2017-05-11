import * as reducers from './postsReducer'
import * as types from '../actions/constants'

// posts reducer test.
// This can be tested indirectly by testing the reducer that calls it.
// Make sure to test every case.
// Refactor to avoid repetitive code. 
describe('posts reducer', () => {
	const posts = reducers.posts
	const defaultState = {
		isFetching: false,
		items: [],
		lastItemFetchedId: null
	}

	const newState = {
		isFetching: true,
		items: [],
		lastItemFetchedId: null
	}

	it('should return default initial state', () => {
		expect(
			posts(undefined, {})
		).toEqual(defaultState)
	})

	it('should handle action with FETCH_POSTS_REQUEST type', () => {
		expect(
			posts(defaultState, {
				type: types.FETCH_POSTS_REQUEST
			})
		).toEqual(newState)
	})

	it('should handle action with FETCH_POSTS_SUCCESS type', () => {
		expect(
			posts(defaultState, {
				type: types.FETCH_POSTS_SUCCESS,
				response: {
					entities: {
						posts: {
							"1": {
								id: "1",
								userId: "2"
							}
						}  
					}
				}
			})
		).toEqual({
			isFetching: false,
			items: ["1"],
			lastItemFetchedId: ["1"]
		})
	}) 

	it('should handle action with FETCH_POSTS_FAILURE type', () => {
		expect(
			posts(newState, {
				type: types.FETCH_POSTS_FAILURE
			})
		).toEqual(defaultState)
	})

	it('should return state if action type is not listened to', () => {
		expect(
			posts(newState, {
				type: types.RESET_ERROR_MESSAGE
			})
		).toEqual(newState)
	})
})

// postsByCategory reducer test.
// Tests posts reducer indirectly through integration.
describe('postsByCategory reducer', () => {
	const postsByCategory = reducers.postsByCategory
	const someState = {
		hot: {
			isFetching: false,
			items: [],
			lastItemFetchedId: null
		}
	}

	it('should return default initial state', () => {
		expect(
			postsByCategory(undefined, {})
		).toEqual({})
	})

	it('should handle action with POSTS_REQUEST type', () => {
		expect(
			postsByCategory(someState, {
				type: types.FETCH_POSTS_REQUEST,
				// Must change this. requestType action will not be created
				// with a response object. Tailor this.
				response: {
					category: 'hot'
				}
			})
		).toEqual({
			hot: {
					isFetching: true,
					items: [],
					lastItemFetchedId: null
				} 
		})
	})

	it('should handle action with FETCH_POSTS_SUCCESS', () => {
		expect(
			postsByCategory({
				hot: {
					isFetching: true,
					items: [],
					lastItemFetchedId: null
				}
			}, {
				type: types.FETCH_POSTS_SUCCESS,
				response: {
					category: 'hot',
					entities: {
						posts: {
							"2": {
								id: "2",
								userId: "2"
							},
							"1": {
								id: "1",
								userId: "1"
							}
						} 
					}
				}
			})
		).toEqual({
			hot: {
				isFetching: false,
				// This relies on Object.keys() returning array
				// with enumerable properties in ascending order.
				items: ['1', '2'],
				lastItemFetchedId: ['1']
			}
		})
	})

	it('should handle action with FETCH_POSTS_FAILURE type', () => {
		expect(
			postsByCategory({
				hot: {
					isFetching: true,
					items: [],
					lastItemFetchedId: null
				}
			}, {
				type: types.FETCH_POSTS_FAILURE,
				// This is obviously incorrect. failureType action will come
				// with an error object. Will fix this later. 
				response: {
					category: 'hot'
				}
			})
		).toEqual({
			hot: {
				isFetching: false,
				items: [],
				lastItemFetchedId: null
			}
		})
	})	
})