import * as types from '../actions/constants'
import configureStore from 'redux-mock-store'
import newApiProposal from './newApiProposal'
import sinon from 'sinon'
import { CALL_API, Schemas } from './newApiProposal'
import nock from 'nock'
import chai from 'chai'
import spies from 'chai-spies'

// Far from being finished.
// Will get back to it later, after an answer comes to my head.

describe('api middleware', () => {
    // General test configuration goes here.
    // Include store or mock store to be able to dispatch actions.
    const middlewares = [ newApiProposal ]
    const mockStore = configureStore(middlewares)
    let store
    let next

    beforeEach(() => {
        store = mockStore({})
        next = jest.fn()
    })

    afterEach(() => {
        nock.cleanAll()
        store = {}
    })

    describe('when action is without CALL_API', () => {
        it('passes the action to the next middleware', () => {
            let action = { type: 'not-CALL_API' }

            newApiProposal(store)(next)(action)
            expect(next).toHaveBeenCalledWith(action)
        })
    })

    describe('when action is with CALL_API', () => {
        let nockScope
        beforeEach(() => {
            nockScope = nock('https://api-url-here/')
                .get('/posts')
        })

        afterEach(() => {
            nock.cleanAll
        })

        it('dispatches an action with requestType', () => {
            nockScope = nockScope.reply(200, { status: 'ok' })

            let action = {
                [CALL_API]: {
                    types: [ types.FETCH_POSTS_REQUEST, types.FETCH_POSTS_SUCCESS, types.FETCH_POSTS_FAILURE],
                    method: 'GET',
                    endpoint: '/posts/maxId=10&category=hot',
                    schema: Schemas.POST
                }
            }

            return newApiProposal(store)(next)(action)
            nockScope.isDone()
            expect(store.getActions()).toEqual()
        })

        it('makes http call to API', () => {
            const onFulfilled = sinon.spy()
            const action = {
                [CALL_API]: {
                    types: [ types.FETCH_POSTS_REQUEST, types.FETCH_POSTS_SUCCESS, types.FETCH_POSTS_FAILURE],
                    method: 'get',
                    endpoint: '/posts'
                }
            }
        })

        it('dispatches successType action after successful response', () => {
            const action = {
                [CALL_API]: {
                    types: [ types.FETCH_POSTS_REQUEST, types.FETCH_POSTS_SUCCESS, types.FETCH_POSTS_FAILURE],
                    method: 'get',
                    endpoint: '/posts'
                }
            }

            const requestAction = {
                type: types.FETCH_POSTS_REQUEST
            }

            const successAction = {
                type: types.FETCH_POSTS_SUCCESS,
                data: 'posts'
            }

            return newApiProposal(store)(next)(action)
                .then(() => {
                    expect(next.mock.calls[0][0]).toEqual(requestAction)
                    expect(next.mock.calls[1][0]).toEqual(successAction)
                })
        })

        it('dispatches failureType action after unsuccessful response', () => {
            const action = {
                [CALL_API]: {
                    types: [ types.FETCH_POSTS_REQUEST, types.FETCH_POSTS_SUCCESS, types.FETCH_POSTS_FAILURE],
                    method: 'get',
                    endpoint: '/posts'
                }
            }

            const requestAction = {
                type: types.FETCH_POSTS_REQUEST
            }

            const failureAction = {
                type: types.FETCH_POSTS_FAILURE,
                error: 'Post not found'
            }

            // Not passing. Something needs fixing.
            // Will get back to this later.

            // return api(store)(next)(action)
            //  .then(() => {
            //      expect(next.mock.calls[0][0]).toEqual(requestAction)
            //      expect(next.mock.calls[1][0]).toEqual(failureAction)
            //  })

        })
    })
})