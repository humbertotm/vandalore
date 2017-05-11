import { normalize, schema } from 'normalizr'
import { camelizeKeys } from 'humps'
import axios from 'axios'

const BASE_URL = 'http://api-url-here'

// Fetches an API response and normalizers the result JSON according to 
// the provided schema. 
// This makes every API response have the same shape, regardless of how 
// nested it was. 

// Will be used in the callApi method to achieve DRYness.
const axiosCall = (method, url) => {
	return axios({
		method: method,
		url: url
	})
}

// Will be used in the callApi method to achieve DRYness.
const errorCatch = error => {
	// Response came with status that falls outside 2xx.
	if(error.response) {
		return Object.assign({}, error.response.data)	
	} else {
		// An error in the request.
		return Object.assign({}, error.message)
	}
}

const callApiWithAxios = (method, endpoint) => {
	const fullUrl = (endpoint.indexOf(BASE_URL) === -1) ? BASE_URL + endpoint : endpoint

	return axiosCall(method, fullUrl)
		.then(response => {
			const camelizedJson = camelizeKeys(response.data)
			return Object.assign({}, camelizedJson)
		})
		.catch(error => {
			return errorCatch(error)
		})
}

// Normalizr schemas to transform API responses from nested to a flat form,
// where they are placed in 'entities'

const userSchema = new schema.Entity('users', {
	posts: [postSchema]
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

export const Schemas = {
	USER: userSchema,
	POST: postSchema,
	POST_ARRAY: [postSchema],
	VOTE: voteSchema,
	COMMENT: commentSchema,
	COMMENT_ARRAY: [commentSchema],
	RELATIONSHIP: relationshipSchema
}

// Action key that carries API info interpreted by this middleware
export const CALL_API = Symbol('Call API')

// Redux middleware that interprets actions with CALL_API info specified.
// Performs the call and promises when actions are dispatched.
export default store => next => action => {
	const callAPI = action[CALL_API]
	if(typeof callAPI === 'undefined') {
		return next(action)
	}

	const { types, method, endpoint } = callAPI

	if(typeof endpoint !== 'string') {
		throw new Error('Specify a string endpoint URL.')
	}

	if(typeof method !== 'string') {
		throw new Error('Expected method to be a string.')
	}

	if(!['get', 'post', 'delete', 'put', 'patch'].includes(method)) {
		throw new Error('Expected method to be an http method.')
	}

	if(method !== 'delete' && !schema) {
		throw new Error('Specify one of the exported Schemas.')
	}

	if(method === 'delete' && schema) {
		throw new Error('No schema is required') 	
	}

	if(method === 'delete' && !entity) {
		throw new Error('Expected an entity to be provded.')
	}

	if(!Array.isArray(types) || types.length !== 3) {
		throw new Error('Expected an array of action types.')
	}

	if(!types.every(type => typeof type === 'string')){
		throw new Error('Expected action types to be strings.')
	}

	const actionWith = dataForAction => {
		const finalAction = Object.assign({}, dataForAction)
		delete finalAction[CALL_API]
		return finalAction
	}

	const [ requestType, successType, failureType ] = types
	next(actionWith({ type: requestType }))

	return callApiWithAxios(method, endpoint).then(
		response => next(actionWith({
			type: successType,
			data: response.data
		})),
		error => next(actionWith({
			type: failureType,
			error: error.data || 'An error occurred in the request.'
		}))
	)
}