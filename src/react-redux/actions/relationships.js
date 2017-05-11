import { CALL_API, Schemas } from '../middleware/api'
import {
    CREATE_RELATIONSHIP_REQUEST, CREATE_RELATIONSHIP_SUCCESS, CREATE_RELATIONSHIP_FAILURE,
    DELETE_RELATIONSHIP_REQUEST, DELETE_RELATIONSHIP_SUCCESS, DELETE_RELATIONSHIP_FAILURE
} from './constants'

// Creates a relationship by calling the API.
// Relies on the middleware defined in ../middleware/api.js.
const follow = (followerId, followedId) => ({
    [CALL_API]: {
        types: [ CREATE_RELATIONSHIP_REQUEST, CREATE_RELATIONSHIP_SUCCESS, CREATE_RELATIONSHIP_FAILURE],
        // Data for request will go in the request body.
        endpoint: '/relationships',
        method: 'POST',
        data: { followerId, followedId },
        schema: Schemas.relationshipSchema
    }
})

// Deletes a relationship by calling the API.
// Relies on the middleware defined in ../middleware/api.js.
const unfollow = relationshipId => ({
    [CALL_API]: {
        types: [ DELETE_RELATIONSHIP_REQUEST, DELETE_RELATIONSHIP_SUCCESS, DELETE_RELATIONSHIP_FAILURE],
        endpoint: `/relationships?relationshipId=${relationshipId}`,
        method: 'DELETE'
    }
})