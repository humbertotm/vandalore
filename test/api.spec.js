/*
import { CALL_API, Schemas } from '../src/middleware/newApi'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import sinon from 'sinon'
import newApi from '../src/middleware/newApi'
import nock from 'nock'
import configureStore from 'redux-mock-store'
import {
	FETCH_POSTS_REQUEST, FETCH_POSTS_SUCCESS, FETCH_POSTS_FAILURE,
} from '../src/actions/constants'

chai.use(chaiAsPromised)
const expect = chai.expect;

describe('api middleware', () => {
	let next

	// This hooks affect both describe cases.
	before(() => {

	})

	beforeEach(() => {
		next = sinon.spy()
	})

	afterEach(() => {
		next.reset()
	})

	describe('when action is without CALL_API type', () => {
		it('passes action to next middleware in chain', () => {
			const action = { type: 'SOME_TYPE' }
			// Is it necessary to mock store for this test?
			const store = {}

			newApiProposal(store)(next)(action)
			sinon.assert.calledWith(next, action)
		})	
	})

	

	describe('when action is with CALL_API type', () => {
		let next
		let nockScope
		let action
		let store

		beforeEach(() => {
			next = sinon.spy()
			nockScope = nock('https://api-url-here')
										.get('/posts')

			action = {
				type: [CALL_API],
				payload: {
					types: [ FETCH_POSTS_REQUEST, FETCH_POSTS_SUCCESS, FETCH_POSTS_FAILURE ],
					endpoint: '/posts',
					schema: Schemas.POST,
					method: 'GET'
				}
			} 
		})

		afterEach(() => {
			next.reset()
			nock.cleanAll()
		})

		it('sends request to path', () => {
			// Make a request mock with nock.
			// Assert the scope of the nock is fulfilled.
			nockScope = nockScope.reply(200, { status: 'ok' })

			const store = {}

			newApi(store)(next)(action)
			nockScope.isDone()
		})

		it.only('resolves promise when response is successful', () => {
			// Return promise.
			// Verify that next was called twice, first with
			// requestType action, then with successType action.
			nockScope = nockScope.reply(200, { status: 'ok' })

			store = {}
			let promise = newApi(store)(next)(action)
			return expect(promise).to.be.fulfilled
		})

		it.only('dispatches request and success type actions after promise resolved', (done) => {
			// Return promise.
			// Verify that next was called twice, first with
			// requestType action, then with failureType 1action.
			nockScope = nockScope.reply(200, { status: 'ok' })

			store = {}
			let promise = newApi(store)(next)(action)

			promise.then(() => {
				sinon.assert.calledWith(next, { type: FETCH_POSTS_REQUEST }, {
					type: FETCH_POSTS_SUCCESS,
					response: {
						status: 'ok'
					}
				})
				done()
			})
		})
	})


})

*/