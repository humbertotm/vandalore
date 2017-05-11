import { CALL_API, Schemas } from '../middleware/api'
import {
    CREATE_VOTE_REQUEST, CREATE_VOTE_SUCCESS, CREATE_VOTE_FAILURE,
    DELETE_VOTE_REQUEST, DELETE_VOTE_SUCCESS, DELETE_VOTE_FAILURE
} from './constants'

// Creates a new vote by calling the API.
// Relies on the middleware defined in ../middleware/api.js.
export const createVote = (postId, userId) => ({
    [CALL_API]: {
        types: [ CREATE_VOTE_REQUEST, CREATE_VOTE_SUCCESS, CREATE_VOTE_FAILURE ],
        endpoint: '/votes',
        method: 'POST',
        data: { postId, userId },
        schema: Schemas.voteSchema
    }
})

// Deletes an existing vote by calling the API.
// Relies on the middleware defined in ../middleware/api.js.
export const deleteVote = voteId => ({
    [CALL_API]: {
        types: [ DELETE_VOTE_REQUEST, DELETE_VOTE_SUCCESS, DELETE_VOTE_FAILURE ],
        endpoint: `/votes?voteId=${voteId}`,
        method: 'DELETE'
    }
})
