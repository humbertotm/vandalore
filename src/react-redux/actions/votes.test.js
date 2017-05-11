import * as actions from './votes'
import { CALL_API, Schemas } from '../middleware/api'
import {
    CREATE_VOTE_REQUEST, CREATE_VOTE_SUCCESS, CREATE_VOTE_FAILURE,
    DELETE_VOTE_REQUEST, DELETE_VOTE_SUCCESS, DELETE_VOTE_FAILURE
} from './constants'

describe('createVote action', () => {
    it('should create action to call API', () => {
        const expectedAction = {
            [CALL_API]: {
                types: [ CREATE_VOTE_REQUEST, CREATE_VOTE_SUCCESS, CREATE_VOTE_FAILURE ],
                enpoint: '/create/vote/url',
                method: 'post',
                data: {
                    postId: 1,
                    userId: 2
                },
                schema: Schemas.VOTE
            }
        }

        expect(actions.createVote(1,2)).toEqual(expectedAction)
    })
})

describe('deleteVote action', () => {
    it('should create action to call API', () => {
        const expectedAction = {
            [CALL_API]: {
                types: [ DELETE_VOTE_REQUEST, DELETE_VOTE_SUCCESS, DELETE_VOTE_FAILURE ],
                endpoint: '/delete/vote/url',
                method: 'delete',
                data: 1,
                entity: 'votes'
            }
        }

        expect(actions.deleteVote(1)).toEqual(expectedAction)
    })
})