import { schema } from 'normalizr'
import { normalize } from 'normalizr'
import { camelizeKeys } from 'humps'
import fetch from 'isomorphic-fetch'

const BASE_URL = 'https://api-url-here'

const callApi = (httpVerb, endpoint, schema) => {
	const fullUrl = (endpoint.indexOf(BASE_URL) === -1) ? BASE_URL + endpoint : endpoint
	return fetch(fullUrl, {
		method: httpVerb
	})
		.then(response => 
			response.json().then(json => {
				if(!response.ok) {
					return Promise.reject(json)
				}

				const camelizedJson = camelizeKeys(json)
				return Object.assign({}, normalize(camelizedJson, schema))
			})
		)
}

// Normalizr schemas to transform API responses from nested to a flat form,
// where they are placed in 'entities'

const userSchema = new schema.Entity('users', {
})

const postSchema = new schema.Entity('posts', {
	poster: userSchema
})

const voteSchema = new schema.Entity('votes', {
	voter: userSchema,
	post: postSchema
})

const commentSchema = new schema.Entity('comments', {
	commenter: userSchema, 
	post: postSchema
})

const relationshipSchema = new schema.Entity('relationships', {
	follower: userSchema,
	followed: userSchema
})

const notificationSchema = new schema.Entity('notifications', {
	userId: userSchema
})

export const Schemas = {
	USER: userSchema,
	POST: postSchema,
	VOTE: voteSchema,
	COMMENT: commentSchema,
	RELATIONSHIP: relationshipSchema,
	NOTIFICATION: notificationSchema
}

// Action key that carries API info interpreted by this middleware
export const CALL_API = Symbol('Call API')

// Main api middleware function.
export default store => next => action => {
	// const callAPI = action[CALL_API]

	if(action.type !== CALL_API) {
		return next(action)
	}

	const actionPayload = action.payload

	// if(!callAPI) {}
	// if(typeof callAPI === 'undefined') {
	//	return next(action)
	// }

	const { 
		method, 
		types, 
		entity, 
		endpoint, 
		data,
		schema } = actionPayload

	const [ requestType, successType, failureType ] = types

	// Error checking.
	if(typeof endpoint !== 'string') {
		throw new Error('Specify a string endpoint URL.')
	}

	if(typeof method !== 'string') {
		throw new Error('Expected method to be a string.')
	}

	if(!['GET', 'POST', 'DELETE', 'PUT', 'PATCH'].includes(method)) {
		throw new Error('Expected method to be an http method.')
	}

	if(method !== 'DELETE' && !schema) {
		throw new Error('Specify one of the exported Schemas.')
	}

	if(method === 'DELETE' && schema) {
		throw new Error('No schema is required') 	
	}

	if(method === 'DELETE' && !entity) {
		throw new Error('Expected an entity to be provided.')
	}

	if(!Array.isArray(types) || types.length !== 3) {
		throw new Error('Expected an array of action types.')
	}

	if(!types.every(type => typeof type === 'string')){
		throw new Error('Expected action types to be strings.')
	}

	if(typeof data !== 'object') {
		throw new Error('Expected data to be an object.')
	}

	const actionWith = dataForAction => {
		const finalAction = Object.assign({}, dataForAction)
		return finalAction
	}

	next(actionWith({
		type: types.requestType
	}))

	return callApi(method, endpoint, schema)
		.then(response => {
			next(actionWith({
				type: successType,
				response
			}))
		})
		.catch(error => {
			next(actionWith({
				type: failureType,
				error: error.message || 'An error occurred in the request.'
			}))
		})
}