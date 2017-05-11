import { normalize } from 'normalizr'
import { camelizeKeys } from 'humps'
import fetch from 'isomorphic-fetch'

const BASE_URL = 'https://api-url-here'

export const apiRequest = (method, endpoint) => {
	// Will have to incorporate query string in this fullUrl.
	// Devise a function to extract query string parameters
	// from function arguments (params) or use a library.
	const fullUrl = (endpoint.indexOf(BASE_URL) === -1) ? BASE_URL + endpoint : endpoint
	
	return fetch(fullUrl, {
		method
	})
}

export const makeApiRequest = actionPayload => {
	const {
		method,
		endpoint,
		params, 
		data,
		schema
	} = actionPayload

	if(method === 'DELETE') {
		return apiRequest(method, endpoint)
			.then(response => 
				response.json().then(json => {
					if(!response.ok) {
						return Promise.reject(json)
					}

					// What if it is successful?
				})
			)
	}

	return apiRequest(method, endpoint)
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

export const actionWith = dataForAction => {
		const finalAction = Object.assign({}, dataForAction)
		return finalAction
	}